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
  const type = searchParams.get("type"); // account_type filter

  let query = sb
    .from("accounts")
    .select(
      "id, name, domain, account_type, tier, city, state, primary_phone, owner_email, last_activity_at, created_at"
    )
    .order("last_activity_at", { ascending: false, nullsFirst: false })
    .limit(200);

  if (type && type !== "all") {
    query = query.eq("account_type", type);
  }
  if (q) {
    query = query.or(`name.ilike.%${q}%,domain.ilike.%${q}%,city.ilike.%${q}%`);
  }

  const { data, error } = await query;
  if (error) {
    console.error("accounts list error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Pull deal counts and open pipeline value in one extra query
  const ids = (data || []).map((a) => a.id);
  let dealStats: Record<string, { open_count: number; open_value: number; total_count: number }> = {};
  if (ids.length > 0) {
    const { data: deals } = await sb
      .from("deals")
      .select("account_id, stage, amount_usd")
      .in("account_id", ids);
    for (const d of deals || []) {
      const aid = d.account_id as string;
      if (!aid) continue;
      const s = (dealStats[aid] ||= { open_count: 0, open_value: 0, total_count: 0 });
      s.total_count += 1;
      const closed = d.stage === "won" || d.stage === "lost";
      if (!closed) {
        s.open_count += 1;
        s.open_value += Number(d.amount_usd || 0);
      }
    }
  }

  const enriched = (data || []).map((a) => ({
    ...a,
    deal_stats: dealStats[a.id] || { open_count: 0, open_value: 0, total_count: 0 },
  }));

  return NextResponse.json(enriched);
}

export async function POST(request: NextRequest) {
  if (!isAdminAuthenticated(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await request.json();
  if (!body?.name) {
    return NextResponse.json({ error: "name required" }, { status: 400 });
  }

  const sb = getSupabaseAdmin();
  const { data, error } = await sb
    .from("accounts")
    .insert({
      name: body.name,
      domain: body.domain || null,
      account_type: body.account_type || "prospect",
      tier: body.tier || "C",
      primary_phone: body.primary_phone || null,
      city: body.city || null,
      state: body.state || null,
      owner_email: body.owner_email || null,
      notes: body.notes || null,
      first_touch_at: new Date().toISOString(),
      last_activity_at: new Date().toISOString(),
    })
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
}
