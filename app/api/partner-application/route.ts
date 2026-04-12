import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { convertLeadToAccount } from "@/lib/crm";
import type { Lead } from "@/lib/supabase";

// Receives the Become-a-Partner form submission, stores it as a lead
// with form_type='partner', and auto-converts into the CRM as a
// partner-type Account + Contact (no deal).

interface PartnerFormBody {
  company_name?: string;
  contact_name?: string;
  email?: string;
  phone?: string;
  states?: string;
  years_experience?: string;
  business_description?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as PartnerFormBody;

    // Minimal validation — just require a way to contact them
    if (!body.company_name || !body.contact_name || (!body.email && !body.phone)) {
      return NextResponse.json(
        { ok: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Stash the partner-specific fields in issue_description so they're
    // preserved on the lead row and in the resulting Account notes.
    const details = [
      `Contact: ${body.contact_name}`,
      body.states ? `Service states: ${body.states}` : null,
      body.years_experience ? `Baler experience: ${body.years_experience}` : null,
      body.business_description ? `\nAbout: ${body.business_description}` : null,
    ]
      .filter(Boolean)
      .join("\n");

    // ---------- 1. Insert the lead ----------
    const sb = getSupabaseAdmin();
    const insertPayload: Partial<Lead> = {
      form_type: "partner",
      name: body.contact_name,
      company: body.company_name,
      email: body.email,
      phone: body.phone,
      state: body.states || undefined,
      issue_description: details,
    };

    const { data: leadData, error: leadErr } = await sb
      .from("leads")
      .insert(insertPayload)
      .select("*")
      .single();

    if (leadErr || !leadData) {
      console.error("partner lead insert failed:", leadErr);
      return NextResponse.json(
        { ok: false, error: "Failed to save application" },
        { status: 500 }
      );
    }

    const leadRow = leadData as Lead & { id: string };

    // ---------- 2. Auto-convert into CRM (partner account, no deal) ----------
    let convert: Awaited<ReturnType<typeof convertLeadToAccount>> | null = null;
    try {
      convert = await convertLeadToAccount(leadRow);
    } catch (err) {
      console.error("partner convertLeadToAccount failed:", err);
      // Don't fail the submission just because CRM conversion hiccuped —
      // the lead is already safely stored.
    }

    // ---------- 3. Forward to n8n (best-effort) ----------
    const n8nWebhookUrl = process.env.N8N_LEAD_WEBHOOK_URL;
    if (n8nWebhookUrl) {
      try {
        await fetch(n8nWebhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            form_type: "partner",
            ...body,
            lead_id: leadRow.id,
            account_id: convert?.account_id,
            source: "banditrecycling.com",
            timestamp: new Date().toISOString(),
          }),
        });
      } catch (err) {
        console.error("n8n partner webhook failed:", err);
      }
    }

    return NextResponse.json({
      ok: true,
      lead_id: leadRow.id,
      account_id: convert?.account_id ?? null,
      account_created: convert?.account_created ?? false,
    });
  } catch (err) {
    console.error("Partner application error:", err);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}
