import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { getWireProduct } from "@/lib/wire-catalog";

type QuoteItemInput = { productId?: string; quantity?: number };

type QuoteBody = {
  customer_name?: string;
  company?: string;
  email?: string;
  phone?: string;
  delivery_address?: string;
  delivery_city?: string;
  delivery_state?: string;
  delivery_zip?: string;
  equipment_make?: string;
  equipment_model?: string;
  customer_notes?: string;
  items?: QuoteItemInput[];
};

async function getVerifiedUser(request: NextRequest) {
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) return null;
  const { data, error } = await getSupabaseAdmin().auth.getUser(token);
  return error ? null : data.user;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as QuoteBody;
    const required = [
      body.customer_name,
      body.company,
      body.email,
      body.delivery_address,
      body.delivery_city,
      body.delivery_state,
      body.delivery_zip,
    ];
    if (required.some((value) => !value?.trim()) || !body.items?.length) {
      return NextResponse.json({ error: "Please complete the required fields and add at least one item." }, { status: 400 });
    }

    const normalizedItems = body.items.map((item) => {
      const product = item.productId ? getWireProduct(item.productId) : undefined;
      const quantity = Math.floor(Number(item.quantity));
      if (!product || !Number.isFinite(quantity) || quantity < 1 || quantity > 999) {
        throw new Error("Invalid quote item");
      }
      const lineTotal = Math.round(product.customerPrice * quantity * 100) / 100;
      return { product, quantity, lineTotal };
    });

    const productSubtotal = Math.round(normalizedItems.reduce((sum, item) => sum + item.lineTotal, 0) * 100) / 100;
    const user = await getVerifiedUser(request);
    const email = body.email!.trim().toLowerCase();
    if (user?.email && user.email.toLowerCase() !== email) {
      return NextResponse.json({ error: "The quote email must match your signed-in email." }, { status: 400 });
    }

    const sb = getSupabaseAdmin();
    const { data: order, error: orderError } = await sb
      .from("wire_orders")
      .insert({
        customer_id: user?.id ?? null,
        customer_name: body.customer_name!.trim(),
        company: body.company!.trim(),
        email,
        phone: body.phone?.trim() || null,
        delivery_address: body.delivery_address!.trim(),
        delivery_city: body.delivery_city!.trim(),
        delivery_state: body.delivery_state!.trim(),
        delivery_zip: body.delivery_zip!.trim(),
        equipment_make: body.equipment_make?.trim() || null,
        equipment_model: body.equipment_model?.trim() || null,
        customer_notes: body.customer_notes?.trim() || null,
        product_subtotal: productSubtotal,
        freight_status: "quoted_separately",
      })
      .select("id, created_at")
      .single();

    if (orderError || !order) {
      console.error("wire order insert failed", orderError);
      return NextResponse.json({ error: "We could not save the quote request." }, { status: 500 });
    }

    const { error: itemError } = await sb.from("wire_order_items").insert(
      normalizedItems.map(({ product, quantity, lineTotal }) => ({
        order_id: order.id,
        product_id: product.id,
        product_name: product.name,
        gauge: product.gauge,
        length_ft: product.lengthFt ?? null,
        package_label: product.packageLabel,
        unit_price: product.customerPrice,
        quantity,
        line_total: lineTotal,
      }))
    );

    if (itemError) {
      console.error("wire order item insert failed", itemError);
      await sb.from("wire_orders").delete().eq("id", order.id);
      return NextResponse.json({ error: "We could not save the quote items." }, { status: 500 });
    }

    const summary = normalizedItems
      .map(({ product, quantity }) => `${quantity} x ${product.name} (${product.packageLabel})`)
      .join("\n");
    const { error: leadError } = await sb.from("leads").insert({
      form_type: "wire_quote",
      name: body.customer_name,
      company: body.company,
      email,
      phone: body.phone,
      address: body.delivery_address,
      city: body.delivery_city,
      state: body.delivery_state,
      equipment_type: [body.equipment_make, body.equipment_model].filter(Boolean).join(" ") || null,
      product_type: "Bale wire",
      quantity: `${normalizedItems.reduce((sum, item) => sum + item.quantity, 0)} packages`,
      issue_description: `Wire quote ${order.id}\n${summary}\nProduct subtotal: $${productSubtotal.toFixed(2)}\nFreight: quoted separately${body.customer_notes ? `\nNotes: ${body.customer_notes}` : ""}`,
    });
    if (leadError) console.error("wire quote lead insert failed", leadError);

    const webhookUrl = process.env.N8N_LEAD_WEBHOOK_URL;
    if (webhookUrl) {
      try {
        await fetch(webhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ form_type: "wire_quote", order_id: order.id, email, product_subtotal: productSubtotal, items: normalizedItems.map(({ product, quantity }) => ({ product_id: product.id, name: product.name, quantity, unit_price: product.customerPrice })) }),
        });
      } catch (error) {
        console.error("wire quote webhook failed", error);
      }
    }

    return NextResponse.json({ ok: true, order_id: order.id, created_at: order.created_at });
  } catch (error) {
    console.error("wire quote request failed", error);
    return NextResponse.json({ error: "Invalid quote request." }, { status: 400 });
  }
}

export async function GET(request: NextRequest) {
  const user = await getVerifiedUser(request);
  if (!user?.email) return NextResponse.json({ error: "Sign in required." }, { status: 401 });

  const sb = getSupabaseAdmin();
  const columns = "id, created_at, status, product_subtotal, freight_status, delivery_address, delivery_city, delivery_state, delivery_zip, equipment_make, equipment_model, wire_order_items(id, product_id, product_name, package_label, unit_price, quantity, line_total)";
  const [{ data: accountOrders, error: accountError }, { data: emailOrders, error: emailError }] = await Promise.all([
    sb
    .from("wire_orders")
    .select(columns)
    .eq("customer_id", user.id),
    sb
      .from("wire_orders")
      .select(columns)
      .ilike("email", user.email),
  ]);

  if (accountError || emailError) {
    console.error("wire order history failed", accountError || emailError);
    return NextResponse.json({ error: "Could not load order history." }, { status: 500 });
  }
  const orders = Array.from(new Map([...(accountOrders ?? []), ...(emailOrders ?? [])].map((order) => [order.id, order])).values())
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  return NextResponse.json({ orders, email: user.email });
}
