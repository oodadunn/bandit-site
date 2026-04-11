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

  const { id } = await params;
  const sb = getSupabaseAdmin();

  const [accountRes, contactsRes, equipmentRes, dealsRes, leadsRes, jobsRes, activityRes] =
    await Promise.all([
      sb.from("accounts").select("*").eq("id", id).single(),
      sb
        .from("contacts")
        .select("*")
        .eq("account_id", id)
        .order("is_primary", { ascending: false })
        .order("created_at", { ascending: false }),
      sb
        .from("equipment")
        .select("*")
        .eq("account_id", id)
        .order("install_date", { ascending: false, nullsFirst: false }),
      sb
        .from("deals")
        .select("*")
        .eq("account_id", id)
        .order("created_at", { ascending: false }),
      sb
        .from("leads")
        .select(
          "id, created_at, form_type, urgency, status, name, email, phone, issue_description, deal_id"
        )
        .eq("account_id", id)
        .order("created_at", { ascending: false })
        .limit(50),
      sb
        .from("jobs")
        .select("*")
        .eq("account_id", id)
        .order("created_at", { ascending: false })
        .limit(50),
      sb
        .from("lead_activity")
        .select("*")
        .eq("account_id", id)
        .order("created_at", { ascending: false })
        .limit(50),
    ]);

  if (accountRes.error || !accountRes.data) {
    return NextResponse.json(
      { error: accountRes.error?.message || "Account not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({
    account: accountRes.data,
    contacts: contactsRes.data || [],
    equipment: equipmentRes.data || [],
    deals: dealsRes.data || [],
    leads: leadsRes.data || [],
    jobs: jobsRes.data || [],
    activity: activityRes.data || [],
  });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAdminAuthenticated(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const body = await request.json();

  const sb = getSupabaseAdmin();
  const allowed = [
    "name",
    "domain",
    "industry",
    "account_type",
    "tier",
    "billing_address",
    "city",
    "state",
    "zip",
    "country",
    "primary_phone",
    "website",
    "notes",
    "owner_email",
  ];
  const patch: Record<string, unknown> = {};
  for (const k of allowed) {
    if (k in body) patch[k] = body[k];
  }

  const { data, error } = await sb
    .from("accounts")
    .update(patch)
    .eq("id", id)
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
