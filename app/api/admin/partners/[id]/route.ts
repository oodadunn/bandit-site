import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { isAdminAuthenticated } from "@/lib/admin-auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAdminAuthenticated(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sb = getSupabaseAdmin();
  const { id } = await params;

  const { data: partner, error: partnerError } = await sb
    .from("service_partners")
    .select("*")
    .eq("id", id)
    .single();

  if (partnerError || !partner) {
    return NextResponse.json({ error: "Partner not found" }, { status: 404 });
  }

  const { data: pricing } = await sb
    .from("partner_pricing")
    .select("*")
    .eq("partner_id", id)
    .order("created_at", { ascending: false });

  const { data: reviews } = await sb
    .from("partner_reviews")
    .select("*")
    .eq("partner_id", id)
    .order("created_at", { ascending: false });

  return NextResponse.json({
    partner,
    pricing: pricing || [],
    reviews: reviews || [],
  });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAdminAuthenticated(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sb = getSupabaseAdmin();
  const { id } = await params;
  const body = await request.json();

  const updateData: Record<string, unknown> = {};
  if (body.pipeline_stage !== undefined) updateData.pipeline_stage = body.pipeline_stage;
  if (body.tier !== undefined) updateData.tier = body.tier;
  if (body.notes !== undefined) updateData.notes = body.notes;
  if (body.service_types !== undefined) updateData.service_types = body.service_types;
  if (body.w9_on_file !== undefined) updateData.w9_on_file = body.w9_on_file;
  if (body.nda_signed !== undefined) updateData.nda_signed = body.nda_signed;
  if (body.insurance_verified !== undefined) updateData.insurance_verified = body.insurance_verified;
  if (body.rate_card_received !== undefined) updateData.rate_card_received = body.rate_card_received;
  updateData.updated_at = new Date().toISOString();

  const { data, error } = await sb
    .from("service_partners")
    .update(updateData)
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    console.error("partner update error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
