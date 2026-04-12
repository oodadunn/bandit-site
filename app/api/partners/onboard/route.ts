import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

// GET: Validate token and return partner info
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.json({ error: "Token required" }, { status: 400 });
  }

  const sb = getSupabaseAdmin();
  const { data: partner, error } = await sb
    .from("service_partners")
    .select(
      "id, company_name, contact_name, phone, email, city, state, coverage_states, service_types, pipeline_stage, onboard_completed_at, onboard_token_expires_at"
    )
    .eq("onboard_token", token)
    .single();

  if (error || !partner) {
    return NextResponse.json({ error: "Invalid or expired link" }, { status: 404 });
  }

  if (partner.onboard_token_expires_at && new Date(partner.onboard_token_expires_at) < new Date()) {
    return NextResponse.json({ error: "This onboarding link has expired. Please contact us for a new one." }, { status: 410 });
  }

  if (partner.onboard_completed_at) {
    return NextResponse.json({ error: "already_completed", partner_name: partner.company_name }, { status: 200 });
  }

  return NextResponse.json({ partner });
}

// POST: Submit onboarding data
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { token, step, data } = body;

  if (!token || !step) {
    return NextResponse.json({ error: "Token and step required" }, { status: 400 });
  }

  const sb = getSupabaseAdmin();

  // Validate token
  const { data: partner, error: tokenError } = await sb
    .from("service_partners")
    .select("id, company_name, onboard_token_expires_at, onboard_completed_at")
    .eq("onboard_token", token)
    .single();

  if (tokenError || !partner) {
    return NextResponse.json({ error: "Invalid token" }, { status: 404 });
  }

  if (partner.onboard_completed_at) {
    return NextResponse.json({ error: "Already completed" }, { status: 400 });
  }

  const partnerId = partner.id;
  const clientIp = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";

  try {
    switch (step) {
      case "nda": {
        // Store NDA signature
        await sb.from("partner_documents").insert({
          partner_id: partnerId,
          doc_type: "nda_signed",
          signature_data: data.signature,
          signed_at: new Date().toISOString(),
          signer_name: data.signer_name,
          signer_title: data.signer_title,
          signer_ip: clientIp,
        });
        await sb.from("service_partners").update({
          nda_signed: true,
          updated_at: new Date().toISOString(),
        }).eq("id", partnerId);
        break;
      }

      case "msa": {
        // Store MSA signature
        await sb.from("partner_documents").insert({
          partner_id: partnerId,
          doc_type: "msa_signed",
          signature_data: data.signature,
          signed_at: new Date().toISOString(),
          signer_name: data.signer_name,
          signer_title: data.signer_title,
          signer_ip: clientIp,
        });
        break;
      }

      case "rate_card": {
        // Store rate card pricing entries
        const pricingEntries = [];
        if (data.service_call_fee) {
          pricingEntries.push({
            partner_id: partnerId,
            pricing_type: "service_call",
            amount_usd: parseFloat(data.service_call_fee),
            unit_description: "Flat rate service call fee",
            effective_date: new Date().toISOString().split("T")[0],
            is_current: true,
          });
        }
        if (data.hourly_rate) {
          pricingEntries.push({
            partner_id: partnerId,
            pricing_type: "hourly_labor",
            amount_usd: parseFloat(data.hourly_rate),
            unit_description: "Standard hourly labor rate",
            effective_date: new Date().toISOString().split("T")[0],
            is_current: true,
          });
        }
        if (data.emergency_rate) {
          pricingEntries.push({
            partner_id: partnerId,
            pricing_type: "hourly_labor",
            amount_usd: parseFloat(data.emergency_rate),
            unit_description: "Emergency / after-hours hourly rate",
            effective_date: new Date().toISOString().split("T")[0],
            is_current: true,
          });
        }
        if (data.mileage_rate) {
          pricingEntries.push({
            partner_id: partnerId,
            pricing_type: "mileage",
            amount_usd: parseFloat(data.mileage_rate),
            unit_description: `Per mile beyond ${data.mileage_threshold || 25} miles`,
            effective_date: new Date().toISOString().split("T")[0],
            is_current: true,
          });
        }
        if (data.wire_price_per_ton) {
          pricingEntries.push({
            partner_id: partnerId,
            pricing_type: "wire_per_ton",
            amount_usd: parseFloat(data.wire_price_per_ton),
            unit_description: data.wire_gauge ? `${data.wire_gauge} gauge bale wire` : "Bale wire per ton",
            effective_date: new Date().toISOString().split("T")[0],
            expires_date: new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],
            is_current: true,
          });
        }
        if (data.equipment_move_rate) {
          pricingEntries.push({
            partner_id: partnerId,
            pricing_type: "equipment_move_flat",
            amount_usd: parseFloat(data.equipment_move_rate),
            unit_description: "Equipment moving flat rate (local)",
            effective_date: new Date().toISOString().split("T")[0],
            is_current: true,
          });
        }
        if (data.pm_monthly_rate) {
          pricingEntries.push({
            partner_id: partnerId,
            pricing_type: "pm_contract_monthly",
            amount_usd: parseFloat(data.pm_monthly_rate),
            unit_description: "Preventive maintenance monthly contract",
            effective_date: new Date().toISOString().split("T")[0],
            is_current: true,
          });
        }

        if (pricingEntries.length > 0) {
          await sb.from("partner_pricing").insert(pricingEntries);
        }

        // Update service types
        const serviceTypes = data.service_types || [];
        await sb.from("service_partners").update({
          service_types: serviceTypes,
          rate_card_received: true,
          updated_at: new Date().toISOString(),
        }).eq("id", partnerId);

        // Store rate card doc reference
        await sb.from("partner_documents").insert({
          partner_id: partnerId,
          doc_type: "rate_card",
          signed_at: new Date().toISOString(),
          signer_name: data.signer_name,
          notes: JSON.stringify(data),
        });
        break;
      }

      case "insurance": {
        // Update insurance info on partner record
        await sb.from("service_partners").update({
          insurance_provider: data.insurance_provider,
          insurance_policy_number: data.insurance_policy_number,
          insurance_expiration: data.insurance_expiration || null,
          updated_at: new Date().toISOString(),
        }).eq("id", partnerId);

        // Note: actual file upload would go to Supabase Storage
        // For now, record that they acknowledged insurance requirements
        await sb.from("partner_documents").insert({
          partner_id: partnerId,
          doc_type: "insurance_cert",
          signer_name: data.signer_name,
          notes: `Provider: ${data.insurance_provider}, Policy: ${data.insurance_policy_number}, Expires: ${data.insurance_expiration}`,
          signed_at: new Date().toISOString(),
        });
        break;
      }

      case "banking": {
        // Store banking info
        await sb.from("partner_banking").upsert({
          partner_id: partnerId,
          bank_name: data.bank_name,
          routing_number: data.routing_number,
          account_number: data.account_number,
          account_type: data.account_type,
          account_holder_name: data.account_holder_name,
        }, { onConflict: "partner_id" });

        await sb.from("partner_documents").insert({
          partner_id: partnerId,
          doc_type: "banking_info",
          signed_at: new Date().toISOString(),
          signer_name: data.account_holder_name,
          signer_ip: clientIp,
        });
        break;
      }

      case "w9": {
        // W9 acknowledgment (actual file would go to storage)
        await sb.from("partner_documents").insert({
          partner_id: partnerId,
          doc_type: "w9",
          signer_name: data.signer_name,
          notes: data.ein ? `EIN: ${data.ein}` : "W9 to be submitted separately",
          signed_at: new Date().toISOString(),
        });
        await sb.from("service_partners").update({
          w9_on_file: true,
          updated_at: new Date().toISOString(),
        }).eq("id", partnerId);
        break;
      }

      case "complete": {
        // Mark onboarding as complete, advance pipeline
        await sb.from("service_partners").update({
          onboard_completed_at: new Date().toISOString(),
          pipeline_stage: "compliant",
          last_contact_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }).eq("id", partnerId);
        break;
      }

      default:
        return NextResponse.json({ error: "Unknown step" }, { status: 400 });
    }

    return NextResponse.json({ success: true, step });
  } catch (err: any) {
    console.error("Onboarding submission error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
