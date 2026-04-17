/**
 * POST /api/voice/tools/create-service-ticket
 *
 * ElevenLabs agent tool. Caller is reporting a broken baler, requesting a
 * repair visit, or ordering a pickup. Creates a `leads` row with form_type
 * 'service_request' so the existing dispatch flow picks it up immediately.
 * If we already know the account (from caller-lookup earlier), we link it.
 *
 * Request body:
 *   { phone: string, name?: string, company?: string,
 *     equipment_type?: string,         // "vertical baler", "horizontal baler", "compactor", etc.
 *     issue_description: string,
 *     urgency?: "emergency"|"urgent"|"standard",
 *     site_address?: string,
 *     service_type?: string,           // "repair"|"pickup"|"installation"|"maintenance"|"relocation"
 *     conversation_id?, agent_id?, metadata? }
 *
 * Response:
 *   { ok, ticket_id, acknowledged_message }
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

const URGENCY_ETA: Record<string, string> = {
  emergency: "within 2 hours",
  urgent: "within 24 hours",
  standard: "within 2 business days",
};

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
  const phone = normalizePhone((body.phone as string) ?? null) || ctx.fromNumber;
  const issue = (body.issue_description as string)?.trim();

  if (!phone || !issue) {
    const resp = { ok: false, error: "phone and issue_description are required" };
    await logToolCall({
      toolName: "create_service_ticket",
      conversationId: ctx.conversationId,
      elevenlabsAgentId: ctx.elevenlabsAgentId,
      fromNumber: phone,
      request: body,
      response: resp,
      statusCode: 400,
      startMs,
    });
    return NextResponse.json(resp, { status: 400 });
  }

  const name = (body.name as string) ?? null;
  const company = (body.company as string) ?? null;
  const equipmentType = (body.equipment_type as string) ?? null;
  const urgencyRaw = ((body.urgency as string) ?? "standard").toLowerCase();
  const urgency = ["emergency", "urgent", "standard"].includes(urgencyRaw) ? urgencyRaw : "standard";
  const siteAddress = (body.site_address as string) ?? null;
  const serviceType = (body.service_type as string) ?? "repair";

  const supabase = getSupabaseAdmin();

  // Ensure call row
  let callId: string | null = null;
  if (ctx.conversationId) {
    callId = await upsertCallStub({
      conversationId: ctx.conversationId,
      elevenlabsAgentId: ctx.elevenlabsAgentId,
      fromNumber: phone,
    });
  }

  // Look up existing account to enrich the ticket if we can
  let accountId: string | null = null;
  if (callId) {
    const { data: call } = await supabase
      .from("calls")
      .select("account_id")
      .eq("id", callId)
      .maybeSingle();
    accountId = (call?.account_id as string) ?? null;
  }

  const composedDescription = [
    `Service type: ${serviceType}`,
    equipmentType ? `Equipment: ${equipmentType}` : null,
    `Issue: ${issue}`,
    siteAddress ? `Site: ${siteAddress}` : null,
    ctx.conversationId ? `Conv: ${ctx.conversationId}` : null,
  ]
    .filter(Boolean)
    .join(" | ");

  const { data: lead, error } = await supabase
    .from("leads")
    .insert({
      form_type: "service_request",
      name,
      company,
      phone,
      address: siteAddress,
      urgency,
      equipment_type: equipmentType,
      issue_description: composedDescription,
      status: "new",
    })
    .select("id")
    .single();

  if (error) {
    console.error("[create-service-ticket] insert failed:", error);
    const resp = { ok: false, error: "could not create ticket" };
    await logToolCall({
      toolName: "create_service_ticket",
      conversationId: ctx.conversationId,
      elevenlabsAgentId: ctx.elevenlabsAgentId,
      fromNumber: phone,
      request: body,
      response: resp,
      statusCode: 500,
      startMs,
    });
    return NextResponse.json(resp, { status: 500 });
  }

  if (callId) {
    await supabase
      .from("calls")
      .update({ lead_id: lead.id, outcome: "service_ticket" })
      .eq("id", callId);

    const { data: maxTurn } = await supabase
      .from("call_turns")
      .select("turn_index")
      .eq("call_id", callId)
      .order("turn_index", { ascending: false })
      .limit(1)
      .maybeSingle();
    const nextIdx = ((maxTurn?.turn_index as number) ?? -1) + 1;

    await supabase.from("call_turns").insert({
      call_id: callId,
      turn_index: nextIdx,
      role: "tool",
      tool_name: "create_service_ticket",
      tool_input: { phone, equipment_type: equipmentType, issue_description: issue, urgency, service_type: serviceType, site_address: siteAddress },
      tool_output: { ticket_id: lead.id, account_id: accountId },
      text: `Service ticket created: ${serviceType} — ${issue}`,
    });
  }

  const eta = URGENCY_ETA[urgency];
  const response = {
    ok: true,
    ticket_id: lead.id,
    eta,
    acknowledged_message: `You're all set. I've opened a ${serviceType} ticket${equipmentType ? ` for your ${equipmentType}` : ""}. A tech will be in touch ${eta} to confirm details.`,
  };

  await logToolCall({
    toolName: "create_service_ticket",
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
