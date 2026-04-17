/**
 * POST /api/voice/tools/create-escalation
 *
 * ElevenLabs agent tool. Called mid-conversation when a caller is upset,
 * asking for a human, or raising something the agent can't handle safely.
 * Flips `calls.escalated=true` and stamps reason + urgency. The n8n
 * Escalation Notifier polls every 2 min and will alert the owner via
 * Telegram.
 *
 * Request body:
 *   { reason: string, urgency?: "low"|"medium"|"high"|"emergency",
 *     notes?: string, phone?: string, conversation_id?, agent_id?, metadata? }
 *
 * Response:
 *   { ok: boolean, escalation_id?: string, acknowledged_message: string }
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
  const phone = normalizePhone(body.phone as string) || ctx.fromNumber;
  const reason = (body.reason as string)?.trim();
  const urgencyRaw = ((body.urgency as string) || "medium").toLowerCase();
  const urgency = ["low", "medium", "high", "emergency"].includes(urgencyRaw) ? urgencyRaw : "medium";
  const notes = (body.notes as string) ?? null;

  if (!reason) {
    const resp = { ok: false, error: "reason is required" };
    await logToolCall({
      toolName: "create_escalation",
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

  const supabase = getSupabaseAdmin();

  // Ensure a call row exists so the escalation has somewhere to live
  let callId: string | null = null;
  if (ctx.conversationId) {
    callId = await upsertCallStub({
      conversationId: ctx.conversationId,
      elevenlabsAgentId: ctx.elevenlabsAgentId,
      fromNumber: phone,
    });
  }

  let escalationId: string | null = null;
  if (callId) {
    const { data, error } = await supabase
      .from("calls")
      .update({
        escalated: true,
        escalation_reason: reason,
        escalation_urgency: urgency,
        escalated_at: new Date().toISOString(),
        outcome: "escalated",
      })
      .eq("id", callId)
      .select("id")
      .single();
    if (error) {
      console.error("[create-escalation] update failed:", error);
    } else {
      escalationId = data?.id ?? null;
    }
  }

  // Also append a tool turn to the transcript so it shows up in /admin
  if (callId) {
    // Get current max turn_index
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
      tool_name: "create_escalation",
      tool_input: { reason, urgency, notes },
      tool_output: { escalation_id: escalationId, ok: true },
      text: `Escalation raised: ${reason} [${urgency}]`,
    });
  }

  const ackMsg =
    urgency === "emergency"
      ? "I've flagged this as an emergency — someone on our team will reach out within a few minutes."
      : urgency === "high"
        ? "Got it, I'm escalating this right now. You'll hear back from someone on our team shortly."
        : "Alright, I've made a note and flagged this for our team to follow up on.";

  const response = {
    ok: true,
    escalation_id: escalationId,
    urgency,
    acknowledged_message: ackMsg,
  };

  await logToolCall({
    toolName: "create_escalation",
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
