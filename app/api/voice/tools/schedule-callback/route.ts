/**
 * POST /api/voice/tools/schedule-callback
 *
 * ElevenLabs agent tool. Caller asked for a call back at a better time, or
 * agent needs a teammate to follow up with specifics. Creates a row in the
 * leads table with form_type='voice_callback'. The existing lead-handling
 * pipeline picks it up automatically.
 *
 * Request body:
 *   { phone: string, name?: string, company?: string,
 *     preferred_window?: string,      // "tomorrow afternoon", "by EOD", etc. (free text)
 *     topic: string,                  // what the callback is about
 *     target_agent?: string,          // "savannah" | "rex" | "nova" | ... — who should call back
 *     urgency?: "emergency"|"urgent"|"standard",
 *     notes?: string,
 *     conversation_id?, agent_id?, metadata? }
 *
 * Response:
 *   { ok, lead_id, acknowledged_message }
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
  const phone = normalizePhone((body.phone as string) ?? null) || ctx.fromNumber;
  const name = (body.name as string) ?? null;
  const company = (body.company as string) ?? null;
  const preferredWindow = (body.preferred_window as string) ?? null;
  const topic = (body.topic as string) ?? "callback requested from voice agent";
  const targetAgent = (body.target_agent as string) ?? null;
  const urgencyRaw = ((body.urgency as string) ?? "standard").toLowerCase();
  const urgency = ["emergency", "urgent", "standard"].includes(urgencyRaw) ? urgencyRaw : "standard";
  const notes = (body.notes as string) ?? null;

  if (!phone) {
    const resp = { ok: false, error: "phone is required" };
    await logToolCall({
      toolName: "schedule_callback",
      conversationId: ctx.conversationId,
      elevenlabsAgentId: ctx.elevenlabsAgentId,
      fromNumber: null,
      request: body,
      response: resp,
      statusCode: 400,
      startMs,
    });
    return NextResponse.json(resp, { status: 400 });
  }

  const supabase = getSupabaseAdmin();

  // Ensure call row exists + link
  let callId: string | null = null;
  if (ctx.conversationId) {
    callId = await upsertCallStub({
      conversationId: ctx.conversationId,
      elevenlabsAgentId: ctx.elevenlabsAgentId,
      fromNumber: phone,
    });
  }

  // Compose the lead issue_description with callback details so the
  // existing lead pipeline surfaces everything in one field.
  const issueDescription = [
    topic ? `Topic: ${topic}` : null,
    preferredWindow ? `Preferred time: ${preferredWindow}` : null,
    targetAgent ? `Route to: ${targetAgent}` : null,
    notes ? `Notes: ${notes}` : null,
    ctx.conversationId ? `Conversation: ${ctx.conversationId}` : null,
  ]
    .filter(Boolean)
    .join(" | ");

  const { data: lead, error } = await supabase
    .from("leads")
    .insert({
      form_type: "voice_callback",
      name,
      company,
      phone,
      urgency,
      issue_description: issueDescription,
      status: "new",
    })
    .select("id")
    .single();

  if (error) {
    console.error("[schedule-callback] insert failed:", error);
    const resp = { ok: false, error: "could not save callback" };
    await logToolCall({
      toolName: "schedule_callback",
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

  // Link the lead to the call + append tool turn
  if (callId) {
    await supabase
      .from("calls")
      .update({ lead_id: lead.id, outcome: "callback_requested" })
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
      tool_name: "schedule_callback",
      tool_input: { phone, name, topic, preferred_window: preferredWindow, target_agent: targetAgent, urgency },
      tool_output: { lead_id: lead.id },
      text: `Callback scheduled: ${topic}${preferredWindow ? ` (${preferredWindow})` : ""}${targetAgent ? ` → ${targetAgent}` : ""}`,
    });
  }

  const response = {
    ok: true,
    lead_id: lead.id,
    acknowledged_message: preferredWindow
      ? `Perfect — I've got you scheduled for a callback ${preferredWindow}. We'll reach you at ${phone}.`
      : `Got it. Someone from our team will call you back at ${phone} as soon as possible.`,
  };

  await logToolCall({
    toolName: "schedule_callback",
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
