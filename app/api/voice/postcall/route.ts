/**
 * POST /api/voice/postcall
 *
 * ElevenLabs post-call webhook. Fired after a conversation ends with the
 * full transcript, recording URL, summary, and metadata. We upsert a calls
 * row (keyed on conversation_id), then bulk-insert call_turns.
 *
 * EL's canonical post-call payload shape (observed 2026):
 *   {
 *     type: "post_call_transcription",
 *     event_timestamp: number,
 *     data: {
 *       agent_id: "agent_...",
 *       conversation_id: "conv_...",
 *       status: "done" | "failed" | ...,
 *       transcript: [{ role: "user"|"agent", message: string, time_in_call_secs: number, tool_calls?, tool_results? }],
 *       metadata: {
 *         start_time_unix_secs: number,
 *         call_duration_secs: number,
 *         call_successful: "success"|"failure"|"unknown",
 *         call_sid?: string,              // Twilio CA...
 *         agent_number?: string,          // our DID
 *         external_number?: string,       // the caller's number
 *         phone_call?: { call_sid?, external_number?, agent_number?, type? },
 *         ...
 *       },
 *       analysis: {
 *         call_summary_title?: string,
 *         transcript_summary?: string,
 *         call_successful?: "success"|"failure",
 *         evaluation_criteria_results?: {...},
 *         ...
 *       },
 *       conversation_initiation_client_data?: {...},
 *     }
 *   }
 *
 * We read defensively — field names have shifted across releases.
 */
import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { normalizePhone } from "@/lib/voice-tools";
import crypto from "crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function verifySignature(rawBody: string, header: string | null): boolean {
  const secret = process.env.ELEVENLABS_WEBHOOK_SECRET;
  if (!secret) return true;
  if (!header) return false;
  const parts = Object.fromEntries(
    header.split(",").map((p) => {
      const [k, v] = p.split("=");
      return [k.trim(), (v ?? "").trim()];
    })
  );
  const ts = parts.t;
  const sig = parts.v0;
  if (!ts || !sig) return false;
  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - Number(ts)) > 300) return false;
  const payload = `${ts}.${rawBody}`;
  const expected = crypto.createHmac("sha256", secret).update(payload).digest("hex");
  try {
    return crypto.timingSafeEqual(Buffer.from(sig, "hex"), Buffer.from(expected, "hex"));
  } catch {
    return false;
  }
}

interface TranscriptEntry {
  role?: string;
  message?: string;
  text?: string;
  content?: string;
  time_in_call_secs?: number;
  tool_calls?: unknown;
  tool_results?: unknown;
}

function unixToISO(seconds: unknown): string | null {
  const n = Number(seconds);
  if (!Number.isFinite(n) || n <= 0) return null;
  return new Date(n * 1000).toISOString();
}

export async function POST(req: NextRequest) {
  const raw = await req.text();
  const sigHeader = req.headers.get("elevenlabs-signature");

  if (!verifySignature(raw, sigHeader)) {
    return NextResponse.json({ error: "invalid signature" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  const data = (body.data as Record<string, unknown>) ?? body;
  const metadata = (data.metadata as Record<string, unknown>) ?? {};
  const analysis = (data.analysis as Record<string, unknown>) ?? {};
  const phoneCall = (metadata.phone_call as Record<string, unknown>) ?? {};
  const initData =
    (data.conversation_initiation_client_data as Record<string, unknown>) ?? {};
  const initMeta = (initData.dynamic_variables as Record<string, unknown>) ?? {};

  const conversationId =
    (data.conversation_id as string) ||
    (data.conversationId as string) ||
    (data.id as string);

  if (!conversationId) {
    return NextResponse.json({ error: "conversation_id missing" }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();

  // Diagnostic: log the raw payload shape so we can iterate without re-inspecting prod.
  try {
    await supabase.from("voice_tool_log").insert({
      tool_name: "postcall_webhook",
      conversation_id: conversationId,
      elevenlabs_agent_id: (data.agent_id as string) ?? null,
      from_number: null,
      request: { metadata_keys: Object.keys(metadata), top_keys: Object.keys(data), phone_call_keys: Object.keys(phoneCall) },
      response: null,
      status_code: 200,
      latency_ms: 0,
    });
  } catch (err) {
    console.error("[postcall] diag log failed:", err);
  }

  // Caller number — try every field EL has used
  const fromNumberRaw =
    (phoneCall.external_number as string) ||
    (metadata.external_number as string) ||
    (metadata.caller_number as string) ||
    (metadata.caller_id as string) ||
    (metadata.from_number as string) ||
    (metadata.from as string) ||
    (initMeta.system__caller_id as string) ||
    (initMeta.caller_id as string) ||
    (data.caller_number as string) ||
    null;
  const fromNumber = normalizePhone(fromNumberRaw);

  const toNumberRaw =
    (phoneCall.agent_number as string) ||
    (metadata.agent_number as string) ||
    (metadata.called_number as string) ||
    (metadata.to_number as string) ||
    (metadata.to as string) ||
    (data.called_number as string) ||
    null;
  const toNumber = normalizePhone(toNumberRaw);

  const callSid =
    (phoneCall.call_sid as string) ||
    (metadata.call_sid as string) ||
    (metadata.twilio_call_sid as string) ||
    null;

  const durationSecs = Number(
    metadata.call_duration_secs ??
      data.duration_secs ??
      data.call_duration_secs ??
      metadata.duration_secs ??
      0
  );

  const startTime =
    unixToISO(metadata.start_time_unix_secs) ??
    (metadata.start_time as string) ??
    new Date().toISOString();
  const endTime =
    unixToISO(
      Number(metadata.start_time_unix_secs ?? 0) +
        (Number.isFinite(durationSecs) ? durationSecs : 0)
    ) ??
    (metadata.end_time as string) ??
    new Date().toISOString();

  const statusRaw =
    (data.status as string) || (data.call_status as string) || "completed";
  const status =
    statusRaw === "done" || statusRaw === "ended" ? "completed" : statusRaw;

  const summary =
    (analysis.transcript_summary as string) ||
    (analysis.summary as string) ||
    (data.summary as string) ||
    null;

  const recordingUrl =
    (data.recording_url as string) ||
    (data.audio_url as string) ||
    (metadata.recording_url as string) ||
    null;

  const elAgentId =
    (data.agent_id as string) || (data.agentId as string) || null;

  // Resolve internal agent name
  let internalAgentName: string | null = null;
  if (elAgentId) {
    const { data: agentRow } = await supabase
      .from("agents")
      .select("id")
      .eq("elevenlabs_agent_id", elAgentId)
      .maybeSingle();
    internalAgentName = (agentRow?.id as string) ?? null;
  }

  // Upsert the calls row
  const { data: callRow, error: callErr } = await supabase
    .from("calls")
    .upsert(
      {
        conversation_id: conversationId,
        call_sid: callSid,
        from_number: fromNumber,
        to_number: toNumber,
        elevenlabs_agent_id: elAgentId,
        current_agent: internalAgentName,
        agents_handled: internalAgentName ? [internalAgentName] : [],
        start_time: startTime,
        end_time: endTime,
        duration_seconds:
          Number.isFinite(durationSecs) && durationSecs > 0
            ? Math.floor(durationSecs)
            : null,
        status,
        transcript_summary: summary,
        recording_url: recordingUrl,
        external_provider: "elevenlabs",
      },
      { onConflict: "conversation_id" }
    )
    .select("id")
    .single();

  if (callErr || !callRow) {
    console.error("[postcall] upsert calls failed:", callErr);
    return NextResponse.json(
      { error: "db write failed", detail: callErr?.message },
      { status: 500 }
    );
  }

  const callId = callRow.id as string;

  // Backfill lead_id + outcome by finding the most recent successful tool
  // invocation from this phone number that produced a ticket/callback lead.
  // This links the call → lead without requiring tools to pass conversation_id.
  let backfillLeadId: string | null = null;
  let backfillOutcome: string | null = null;
  if (fromNumber) {
    const windowStart = new Date(
      Date.now() - Math.max(60, durationSecs + 120) * 1000
    ).toISOString();

    // Most recent 200 response on create_service_ticket or schedule_callback
    const { data: toolRows } = await supabase
      .from("voice_tool_log")
      .select("tool_name, response, created_at")
      .eq("from_number", fromNumber)
      .eq("status_code", 200)
      .in("tool_name", ["create_service_ticket", "schedule_callback"])
      .gte("created_at", windowStart)
      .order("created_at", { ascending: false })
      .limit(1);

    if (toolRows && toolRows.length > 0) {
      const r = toolRows[0];
      const resp = r.response as Record<string, unknown> | null;
      const ticketId =
        (resp?.ticket_id as string) || (resp?.lead_id as string) || null;
      if (ticketId) {
        backfillLeadId = ticketId;
        backfillOutcome =
          r.tool_name === "create_service_ticket"
            ? "service_ticket"
            : "callback_requested";
      }
    }

    // Also check for escalation within same window
    const { data: escRows } = await supabase
      .from("voice_tool_log")
      .select("tool_name, created_at")
      .eq("from_number", fromNumber)
      .eq("status_code", 200)
      .eq("tool_name", "create_escalation")
      .gte("created_at", windowStart)
      .order("created_at", { ascending: false })
      .limit(1);

    if (escRows && escRows.length > 0) {
      backfillOutcome = "escalated";
      await supabase
        .from("calls")
        .update({ escalated: true })
        .eq("id", callId);
    }

    if (backfillLeadId || backfillOutcome) {
      await supabase
        .from("calls")
        .update({
          lead_id: backfillLeadId ?? undefined,
          outcome: backfillOutcome ?? undefined,
        })
        .eq("id", callId);
    }
  }

  // Clear prior non-tool turns, keep tool rows (if any were written during the call)
  const { data: existingTurns } = await supabase
    .from("call_turns")
    .select("id, turn_index, role")
    .eq("call_id", callId);

  const nonToolIds = (existingTurns ?? [])
    .filter((t) => t.role !== "tool")
    .map((t) => t.id);
  if (nonToolIds.length > 0) {
    await supabase.from("call_turns").delete().in("id", nonToolIds);
  }

  // Build transcript rows — SKIP empty-text agent turns (EL emits intermediate
  // rows with no text while the LLM is thinking / awaiting tool results)
  const transcript: TranscriptEntry[] =
    (data.transcript as TranscriptEntry[]) ||
    (data.messages as TranscriptEntry[]) ||
    [];

  const newTurns: Array<{
    call_id: string;
    turn_index: number;
    role: string;
    agent_name: string | null;
    elevenlabs_agent_id: string | null;
    text: string;
  }> = [];

  let idx = 0;
  for (const entry of transcript) {
    const rawRole = entry.role;
    const role =
      rawRole === "user"
        ? "user"
        : rawRole === "agent"
          ? "agent"
          : (rawRole ?? "system");
    const text = (entry.message ?? entry.text ?? entry.content ?? "").trim();

    // Skip agent/system turns that have no text (intermediate EL states)
    if (!text && role !== "user") continue;

    newTurns.push({
      call_id: callId,
      turn_index: idx++,
      role,
      agent_name: role === "agent" ? internalAgentName : null,
      elevenlabs_agent_id: role === "agent" ? elAgentId : null,
      text: text || "(no content)",
    });
  }

  if (newTurns.length > 0) {
    const { error: turnsErr } = await supabase
      .from("call_turns")
      .insert(newTurns);
    if (turnsErr) console.error("[postcall] insert turns failed:", turnsErr);
  }

  return NextResponse.json({
    ok: true,
    call_id: callId,
    conversation_id: conversationId,
    turns_saved: newTurns.length,
    from_number: fromNumber,
    duration_seconds: durationSecs,
    lead_linked: backfillLeadId,
    outcome: backfillOutcome,
  });
}
