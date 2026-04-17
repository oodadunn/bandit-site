/**
 * POST /api/voice/tools/caller-lookup
 *
 * ElevenLabs agent tool. Given a caller's phone number, return the CRM
 * context the agent can use in its next reply — account, contact, open
 * deals, last service date. Safe to call early in the conversation.
 *
 * Request body (flexible — EL passes its metadata blob):
 *   { phone?: string, caller_number?: string, conversation_id?, agent_id?, metadata? }
 *
 * Response:
 *   { found: boolean, account?: {...}, contact?: {...}, open_deals?: [...],
 *     last_service_date?: string, recent_calls?: number, summary: string }
 */
import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import {
  checkToolAuth,
  logToolCall,
  normalizePhone,
  parseCallContext,
  upsertCallStub,
} from "@/lib/voice-tools";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const startMs = Date.now();
  const authErr = checkToolAuth(req);
  if (authErr) return authErr;

  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  const ctx = parseCallContext(body);
  const phone =
    normalizePhone(body.phone as string) ||
    ctx.fromNumber ||
    normalizePhone((body.caller_number as string) ?? null);

  if (!phone) {
    const resp = { found: false, summary: "No phone number provided." };
    await logToolCall({
      toolName: "caller_lookup",
      conversationId: ctx.conversationId,
      elevenlabsAgentId: ctx.elevenlabsAgentId,
      fromNumber: null,
      request: body,
      response: resp,
      statusCode: 200,
      startMs,
    });
    return NextResponse.json(resp);
  }

  const supabase = getSupabaseAdmin();

  // Stub a call row early so later tools can link to it
  if (ctx.conversationId) {
    await upsertCallStub({
      conversationId: ctx.conversationId,
      elevenlabsAgentId: ctx.elevenlabsAgentId,
      fromNumber: phone,
    });
  }

  // Lookup by phone on contacts first, fall back to account.primary_phone
  const { data: contact } = await supabase
    .from("contacts")
    .select("id, full_name, first_name, last_name, title, email, phone, account_id")
    .eq("phone", phone)
    .limit(1)
    .maybeSingle();

  let accountId = contact?.account_id ?? null;

  if (!accountId) {
    const { data: acct } = await supabase
      .from("accounts")
      .select("id")
      .eq("primary_phone", phone)
      .limit(1)
      .maybeSingle();
    accountId = acct?.id ?? null;
  }

  let account = null;
  if (accountId) {
    const { data } = await supabase
      .from("accounts")
      .select("id, name, account_type, tier, city, state, industry, notes, last_activity_at")
      .eq("id", accountId)
      .single();
    account = data ?? null;
  }

  let openDeals: unknown[] = [];
  let lastServiceDate: string | null = null;
  if (accountId) {
    const { data: deals } = await supabase
      .from("deals")
      .select("id, name, stage, amount_usd, close_date, deal_type, created_at")
      .eq("account_id", accountId)
      .in("stage", ["prospect", "qualified", "proposal", "negotiation", "service_open"])
      .order("created_at", { ascending: false })
      .limit(5);
    openDeals = deals ?? [];

    // Most recent completed service deal = last service date
    const { data: lastSvc } = await supabase
      .from("deals")
      .select("close_date, created_at")
      .eq("account_id", accountId)
      .eq("deal_type", "service")
      .eq("stage", "closed_won")
      .order("close_date", { ascending: false, nullsFirst: false })
      .limit(1)
      .maybeSingle();
    lastServiceDate = (lastSvc?.close_date as string) ?? (lastSvc?.created_at as string) ?? null;
  }

  // Count recent calls from this number (last 90 days)
  const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 3600 * 1000).toISOString();
  const { count: recentCalls } = await supabase
    .from("calls")
    .select("id", { count: "exact", head: true })
    .eq("from_number", phone)
    .gte("created_at", ninetyDaysAgo);

  const summaryParts: string[] = [];
  if (account) {
    summaryParts.push(`${account.name} (${account.account_type ?? "prospect"}, tier ${account.tier ?? "?"})`);
    if (account.city && account.state) summaryParts.push(`${account.city}, ${account.state}`);
  } else {
    summaryParts.push("No matching account — likely a new caller.");
  }
  if (contact?.full_name || contact?.first_name) {
    summaryParts.push(`Contact: ${contact.full_name ?? `${contact.first_name ?? ""} ${contact.last_name ?? ""}`.trim()}${contact.title ? `, ${contact.title}` : ""}`);
  }
  if (openDeals.length) summaryParts.push(`${openDeals.length} open deal(s).`);
  if (lastServiceDate) summaryParts.push(`Last service: ${lastServiceDate.slice(0, 10)}.`);
  if ((recentCalls ?? 0) > 0) summaryParts.push(`Called ${recentCalls} time(s) in last 90 days.`);

  const response = {
    found: Boolean(account || contact),
    phone,
    account,
    contact,
    open_deals: openDeals,
    last_service_date: lastServiceDate,
    recent_calls: recentCalls ?? 0,
    summary: summaryParts.join(" "),
  };

  await logToolCall({
    toolName: "caller_lookup",
    conversationId: ctx.conversationId,
    elevenlabsAgentId: ctx.elevenlabsAgentId,
    fromNumber: phone,
    request: body,
    response,
    statusCode: 200,
    startMs,
  });

  return NextResponse.json(response);
}
