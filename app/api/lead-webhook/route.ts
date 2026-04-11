import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { convertLeadToAccount } from "@/lib/crm";
import type { Lead } from "@/lib/supabase";

// This route receives a lead submission, auto-converts it into the CRM
// (Account + Contact + Deal), and forwards to the n8n webhook for any
// downstream automation (HubSpot, email, SMS, etc).
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Partial<Lead> & { id?: string };

    // ---------- 1. Make sure the lead exists in Supabase ----------
    const sb = getSupabaseAdmin();
    let leadRow: (Lead & { id: string }) | null = null;

    if (body.id) {
      const { data } = await sb.from("leads").select("*").eq("id", body.id).single();
      if (data) leadRow = data as Lead & { id: string };
    }

    if (!leadRow) {
      // Client didn't pre-insert (or insert failed) — create the row here.
      const insertPayload: Partial<Lead> = {
        form_type: (body.form_type as Lead["form_type"]) || "service_quote",
        name: body.name,
        company: body.company,
        email: body.email,
        phone: body.phone,
        address: body.address,
        state: body.state,
        city: body.city,
        equipment_type: body.equipment_type,
        issue_description: body.issue_description,
        urgency: body.urgency,
        quantity: body.quantity,
        product_type: body.product_type,
        budget_range: body.budget_range,
      };
      const { data, error } = await sb
        .from("leads")
        .insert(insertPayload)
        .select("*")
        .single();
      if (error) {
        console.error("lead insert failed:", error);
      } else {
        leadRow = data as Lead & { id: string };
      }
    }

    // ---------- 2. Auto-convert into CRM ----------
    let convert: Awaited<ReturnType<typeof convertLeadToAccount>> | null = null;
    if (leadRow) {
      try {
        convert = await convertLeadToAccount(leadRow);
      } catch (err) {
        console.error("convertLeadToAccount failed:", err);
      }
    }

    // ---------- 3. Forward to n8n (best-effort) ----------
    const n8nWebhookUrl = process.env.N8N_LEAD_WEBHOOK_URL;
    let routed = false;
    if (n8nWebhookUrl) {
      try {
        const res = await fetch(n8nWebhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...body,
            lead_id: leadRow?.id,
            account_id: convert?.account_id,
            deal_id: convert?.deal_id,
            source: "banditrecycling.com",
            timestamp: new Date().toISOString(),
          }),
        });
        routed = res.ok;
      } catch (err) {
        console.error("n8n webhook failed:", err);
      }
    }

    return NextResponse.json({
      ok: true,
      routed,
      lead_id: leadRow?.id ?? null,
      account_id: convert?.account_id ?? null,
      deal_id: convert?.deal_id ?? null,
      account_created: convert?.account_created ?? false,
    });
  } catch (err) {
    console.error("Lead webhook error:", err);
    return NextResponse.json({ ok: true, routed: false });
  }
}
