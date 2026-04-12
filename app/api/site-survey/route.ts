import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    const required = ["service_type", "requestor_name", "requestor_phone", "site_address"];
    for (const field of required) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    const sb = getSupabaseAdmin();

    // Build the insert row
    const row = {
      service_type: body.service_type,
      equipment_type: body.equipment_type || null,
      work_description: body.work_description || null,

      requestor_name: body.requestor_name,
      requestor_email: body.requestor_email || null,
      requestor_phone: body.requestor_phone,
      requestor_company: body.requestor_company || null,

      onsite_contact_name: body.onsite_contact_name || body.requestor_name,
      onsite_contact_phone: body.onsite_contact_phone || body.requestor_phone,
      onsite_contact_role: body.onsite_contact_role || null,

      site_address: body.site_address,
      site_city: body.site_city || null,
      site_state: body.site_state || null,
      site_zip: body.site_zip || null,

      gate_or_security: body.gate_or_security ?? false,
      gate_details: body.gate_details || null,
      dock_access: body.dock_access ?? true,
      dock_details: body.dock_details || null,
      floor_level: body.floor_level || "ground",
      elevator_available: body.elevator_available ?? false,

      choke_width_inches: body.choke_width_inches || null,
      choke_height_inches: body.choke_height_inches || null,
      ceiling_height_feet: body.ceiling_height_feet || null,
      path_description: body.path_description || null,

      electrical_voltage: body.electrical_voltage || null,
      electrical_phase: body.electrical_phase || null,
      electrical_amperage: body.electrical_amperage || null,
      disconnect_in_place: body.disconnect_in_place ?? false,
      electrical_distance_ft: body.electrical_distance_ft || null,
      electrical_notes: body.electrical_notes || null,

      forklift_available: body.forklift_available ?? false,
      forklift_capacity_lbs: body.forklift_capacity_lbs || null,
      other_equipment: body.other_equipment || null,

      preferred_date: body.preferred_date || null,
      preferred_time_window: body.preferred_time_window || null,

      special_instructions: body.special_instructions || null,
      hazardous_materials: body.hazardous_materials ?? false,
      hazmat_details: body.hazmat_details || null,

      photos_equipment: body.photos_equipment || [],
      photos_access: body.photos_access || [],
      photos_electrical: body.photos_electrical || [],
      photos_facility: body.photos_facility || [],

      accuracy_acknowledged: body.accuracy_acknowledged ?? false,
      submitted_at: new Date().toISOString(),

      deal_id: body.deal_id || null,
      account_id: body.account_id || null,

      status: "submitted",
    };

    const { data, error } = await sb
      .from("site_surveys")
      .insert(row)
      .select("id")
      .single();

    if (error) {
      console.error("Site survey insert error:", error);
      return NextResponse.json(
        { error: "Failed to save survey: " + error.message },
        { status: 500 }
      );
    }

    // Send email notification (non-blocking, best-effort)
    sendEmailNotification(row, data.id).catch((err) =>
      console.error("Email notification failed:", err)
    );

    // Ping n8n webhook (non-blocking)
    fetch(process.env.N8N_LEAD_WEBHOOK_URL || "", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "site_survey",
        survey_id: data.id,
        service_type: row.service_type,
        company: row.requestor_company,
        name: row.requestor_name,
        phone: row.requestor_phone,
        address: row.site_address,
        state: row.site_state,
      }),
    }).catch(() => {});

    return NextResponse.json({ ok: true, id: data.id });
  } catch (err) {
    console.error("Site survey route error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/* ─── Email notification helper ──────────────────────────── */

async function sendEmailNotification(
  row: Record<string, unknown>,
  surveyId: string
) {
  // Uses Supabase Edge Function or a simple SMTP relay
  // For now, we'll use the n8n webhook as the primary notification path
  // and log to console as a fallback
  const photoCount =
    (row.photos_equipment as string[]).length +
    (row.photos_access as string[]).length +
    (row.photos_electrical as string[]).length +
    (row.photos_facility as string[]).length;

  console.log(
    `[Site Survey] New submission ${surveyId}:`,
    `${row.service_type} | ${row.requestor_company || "No company"} | ${row.requestor_name}`,
    `| ${row.site_address} | ${photoCount} photos`
  );
}
