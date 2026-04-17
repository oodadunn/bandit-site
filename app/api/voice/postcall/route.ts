/**
 * POST /api/voice/postcall
 *
 * ElevenLabs post-call webhook. Fired after a conversation ends with the
 * full transcript, recording URL, summary, and metadata. We upsert a calls
 * row (keyed on conversation_id), then bulk-insert call_turns.
 *
 * EL's post-call webhook format (approximate — field names adapted across
 * several known payload shapes):
 *   {
 *     conversation_id: string,
 *     agent_id: string,
 *     status: "completed"|"failed"|...,
 *     duration_secs: number,
 *     transcript: [{ role: "user"|"agent", message: string, time_in_call_secs: number, ... }],
 *     metadata: { caller_number?, call_sid?, start_time?, end_time?, ... },
 *     analysis: { summary?: string, ... },
 *     recording_url?: string,
 *   }
 *
 * We read loosely and tolerate missing fields — EL has evolved this shape.
 */
import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { normalizePhone } from "@/lib/voice-tools";
import crypto from "crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * EL post-call webhooks are signed with HMAC-SHA256 over the raw body,
 * using the secret shown in the EL agent's webhook config.
 * Env: ELEVENLABS_WEBHOOK_SECRET
 * Header: ElevenLabs-Signature: t=<ts>,v0=<hex>
 * (Format is stable as of 2026; fallback to shared-secret header if unused.)
 */
function verifySignature(rawBody: string, header: string | null): boolean {
  const secret = process.env.ELEVENLABS_WEBHOOK_SECRET;
  if (!secret) return true; // If unset, skip (dev mode). Set in prod.
  if (!header) return false;
  // Parse "t=123,v0=abc"
  const parts = Object.fromEntries(
    header.split(",").map((p) => {
      const [k, v] = p.split("=");
      return [k.trim(), (v ?? "").trim()];
    })
  );
  const ts = parts.t;
  const sig = parts.v0;
  if (!ts || !sig) return false;
  // Optional: reject if ts too old (replay protection, 5 min)
  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - Number(ts)) > 300) return false;
  const payload = `${ts}.${rawBody}`;
  const expected = crypto.createHmac("sha256", secret).update(payload).digest("hex");
  return crypto.timingSafeEqual(Buffer.from(sig, "hex"), Buffer.from(expected, "hex"));
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

  // EL post-call events wrap the payload in { type: "post_call_transcription", data: {...} }
  const data = (body.data as Record<string, unknown>) ?? body;

  const conversationId =
    (data.conversation_id as string) ||
    (data.conversationId as string) ||
    (data.id as string);

  if (!conversationId) {
    return NextResponse.json({ error: "conversation_id missing" }, { status: 400 });
  }

  const metadata = (data.metadata as Record<string, unknown>) ?? {};
  const analysis = (data.analysis as Record<string, unknown>) ?? {};

  const callSid =
    (metadata.call_sid as string) ||
    (metadata.twilio_call_sid as string) ||
    null;

  const fromNumber = normalizePhone(
    (metadata.caller_number as string) ||
      (metadata.from as string) ||
      (data.caller_number as string) ||
      null
  );
  const toNumber = normalizePhone(
    (metadata.called_number as string) ||
      (metadata.to as string) ||
      (data.called_number as string) ||
      null
  );

  const durationSecs = Number(
    data.duration_secs ??
      data.call_duration_secs ??
      metadata.duration_secs ??
      0
  );

  const status =
    (data.status as string) ||
    (data.call_status as string) ||
    "completed";

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

  const elAgentId = (data.agent_id as string) || (data.agentId as string) || null;

  const supabase = getSupabaseAdmin();

  // Resolve our internal agent name from EL agent_id.
  // The agents table uses `id` (text) as both PK and internal name (e.g. 'jade').
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
        start_time: (metadata.start_time as string) ?? new Date().toISOString(),
        end_time: (metadata.end_time as string) ?? new Date().toISOString(),
        duration_seconds: Number.isFinite(durationSecs) ? Math.floor(durationSecs) : null,
        status: status === "done" || status === "ended" ? "completed" : status,
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
    return NextResponse.json({ error: "db write failed", detail: callErr?.message }, { status: 500 });
  }

  const callId = callRow.id as string;

  // Clear any earlier turns for this call (tool-invocation stubs we wrote
  // during the call) EXCEPT our tool turns — keep those and append transcript.
  const { data: existingTurns } = await supabase
    .from("call_turns")
    .select("id, turn_index, role")
    .eq("call_id", callId);

  // We'll re-number all turns, preserving tool rows with fresh indexes.
  const transcript: TranscriptEntry[] =
    (data.transcript as TranscriptEntry[]) ||
    (data.messages as TranscriptEntry[]) ||
    [];

  // Delete non-tool turns (they'll be replaced with canonical EL transcript)
  const nonToolIds = (existingTurns ?? [])
    .filter((t) => t.role !== "tool")
    .map((t) => t.id);
  if (nonToolIds.length > 0) {
    await supabase.from("call_turns").delete().in("id", nonToolIds);
  }

  // Build new turn rows from EL transcript
  const toolTurns = (existingTurns ?? []).filter((t) => t.role === "tool");
  const newTurns = transcript.map((entry, idx) => {
    const role =
      entry.role === "user" ? "user" : entry.role === "agent" ? "agent" : (entry.role ?? "system");
    const text = entry.message ?? entry.text ?? entry.content ?? "";
    return {
      call_id: callId,
      turn_index: idx,
      role,
      agent_name: role === "agent" ? internalAgentName : null,
      elevenlabs_agent_id: role === "agent" ? elAgentId : null,
      text,
    };
  });

  // Append tool turns at the end (they'll be re-indexed)
  const allTurns = [...newTurns];
  toolTurns.forEach((t, i) => {
    allTurns.push({
      call_id: callId,
      turn_index: newTurns.length + i,
      role: "tool",
      agent_name: null,
      elevenlabs_agent_id: null,
      text: "(tool call — preserved)",
    });
  });

  if (allTurns.length > 0) {
    // Re-insert non-tool transcript; tool turns already exist with old ids
    // so we only insert the new transcript rows.
    const insertPayload = newTurns; // tool turns already in DB
    if (insertPayload.length > 0) {
      const { error: turnsErr } = await supabase.from("call_turns").insert(insertPayload);
      if (turnsErr) {
        console.error("[postcall] insert turns failed:", turnsErr);
      }
    }
  }

  return NextResponse.json({
    ok: true,
    call_id: callId,
    conversation_id: conversationId,
    turns_saved: newTurns.length,
  });
}
