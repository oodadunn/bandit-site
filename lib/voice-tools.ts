/**
 * Shared helpers for the ElevenLabs voice-agent tool endpoints.
 *
 * Tools endpoints are invoked by EL agents mid-conversation. They authenticate
 * with a shared secret header (configured per-tool in the EL dashboard).
 *
 * Env:
 *   VOICE_TOOL_SECRET   required — shared between Vercel and EL tool configs
 */
import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "./supabase-admin";

const SECRET_HEADER = "x-voice-tool-secret";

export function checkToolAuth(req: NextRequest): NextResponse | null {
  const expected = process.env.VOICE_TOOL_SECRET;
  if (!expected) {
    return NextResponse.json(
      { error: "VOICE_TOOL_SECRET not configured on server" },
      { status: 500 }
    );
  }
  const got = req.headers.get(SECRET_HEADER);
  if (got !== expected) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  return null;
}

/**
 * Normalize a phone to E.164-ish (digits only, prefixed with + if missing).
 * Good enough for Supabase equality matching where phones are already normalized.
 */
export function normalizePhone(raw?: string | null): string | null {
  if (!raw) return null;
  const digits = raw.replace(/[^\d+]/g, "");
  if (!digits) return null;
  if (digits.startsWith("+")) return digits;
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  return `+${digits}`;
}

export interface ToolLogParams {
  toolName: string;
  conversationId?: string | null;
  elevenlabsAgentId?: string | null;
  fromNumber?: string | null;
  request: unknown;
  response: unknown;
  statusCode: number;
  startMs: number;
  error?: string;
}

/**
 * Persist a row in voice_tool_log — so every tool invocation is auditable
 * even before the post-call webhook arrives.
 */
export async function logToolCall(p: ToolLogParams): Promise<void> {
  try {
    const supabase = getSupabaseAdmin();
    await supabase.from("voice_tool_log").insert({
      tool_name: p.toolName,
      conversation_id: p.conversationId ?? null,
      elevenlabs_agent_id: p.elevenlabsAgentId ?? null,
      from_number: p.fromNumber ?? null,
      request: p.request ?? null,
      response: p.response ?? null,
      status_code: p.statusCode,
      latency_ms: Date.now() - p.startMs,
      error: p.error ?? null,
    });
  } catch (err) {
    console.error("[voice-tools] logToolCall failed:", err);
  }
}

/**
 * Upsert a calls row keyed on conversation_id. Safe to call from any tool
 * — if EL hasn't fired the post-call webhook yet, this creates the row so
 * tool-driven side effects (escalations, tickets) can link to it.
 */
export async function upsertCallStub(params: {
  conversationId: string;
  elevenlabsAgentId?: string | null;
  fromNumber?: string | null;
  toNumber?: string | null;
}): Promise<string | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("calls")
    .upsert(
      {
        conversation_id: params.conversationId,
        elevenlabs_agent_id: params.elevenlabsAgentId ?? null,
        from_number: params.fromNumber ?? null,
        to_number: params.toNumber ?? null,
        status: "in_progress",
      },
      { onConflict: "conversation_id" }
    )
    .select("id")
    .single();
  if (error) {
    console.error("[voice-tools] upsertCallStub failed:", error);
    return null;
  }
  return data?.id ?? null;
}

/**
 * Parse the common EL metadata block that tool invocations carry.
 * EL's custom-tool webhook format typically includes:
 *   { conversation_id, agent_id, caller_number, ... }
 * but the exact field names vary — accept several aliases.
 */
export interface ParsedCallContext {
  conversationId: string | null;
  elevenlabsAgentId: string | null;
  fromNumber: string | null;
}

export function parseCallContext(body: Record<string, unknown>): ParsedCallContext {
  const conv =
    (body.conversation_id as string) ||
    (body.conversationId as string) ||
    ((body.metadata as Record<string, unknown>)?.conversation_id as string) ||
    null;
  const agent =
    (body.agent_id as string) ||
    (body.agentId as string) ||
    ((body.metadata as Record<string, unknown>)?.agent_id as string) ||
    null;
  const phone = normalizePhone(
    (body.caller_number as string) ||
      (body.callerNumber as string) ||
      (body.from as string) ||
      (body.phone as string) ||
      ((body.metadata as Record<string, unknown>)?.caller_number as string) ||
      null
  );
  return {
    conversationId: conv,
    elevenlabsAgentId: agent,
    fromNumber: phone,
  };
}

export const TOOL_HEADER_NAME = SECRET_HEADER;
