import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { isAdminAuthenticated } from "@/lib/admin-auth";

export async function GET(request: NextRequest) {
  if (!isAdminAuthenticated(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sb = getSupabaseAdmin();
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim();
  const state = searchParams.get("state");
  const stage = searchParams.get("stage");
  const tier = searchParams.get("tier");

  let query = sb
    .from("service_partners")
    .select(
      "id, created_at, company_name, contact_name, phone, email, state, coverage_states, service_types, pipeline_stage, tier, avg_rating, review_count, last_contact_at"
    )
    .order("company_name", { ascending: true })
    .limit(300);

  if (q) {
    query = query.or(
      `company_name.ilike.%${q}%,contact_name.ilike.%${q}%,email.ilike.%${q}%`
    );
  }
  if (state && state !== "all") {
    query = query.eq("state", state);
  }
  if (stage && stage !== "all") {
    query = query.eq("pipeline_stage", stage);
  }
  if (tier && tier !== "all") {
    query = query.eq("tier", tier);
  }

  const { data, error } = await query;
  if (error) {
    console.error("partners list error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data || []);
}
