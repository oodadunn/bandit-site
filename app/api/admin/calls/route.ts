import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import crypto from "crypto";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const TOKEN_SALT = process.env.TOKEN_SALT || "bandit-salt";

function generateToken(password: string): string {
  return crypto
    .createHash("sha256")
    .update(password + TOKEN_SALT)
    .digest("hex");
}

async function isAuthenticated(request: NextRequest): Promise<boolean> {
  const cookie = request.cookies.get("bandit-admin");
  if (!cookie || !cookie.value) return false;
  const expectedToken = generateToken(ADMIN_PASSWORD!);
  return cookie.value === expectedToken;
}

/**
 * GET /api/admin/calls
 * Returns the 100 most recent calls with their full transcripts joined in.
 * Shape is back-compat with the existing dashboard CallEvent interface.
 */
export async function GET(request: NextRequest) {
  try {
    const authenticated = await isAuthenticated(request);
    if (!authenticated) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = getSupabaseAdmin();

    // Pull recent calls
    const { data: calls, error } = await supabase
      .from("calls")
      .select(
        "id, conversation_id, call_sid, created_at, from_number, to_number, duration_seconds, status, outcome, current_agent, elevenlabs_agent_id, agents_handled, escalated, escalation_reason, escalation_urgency, recording_url, transcript_summary, lead_id, account_id"
      )
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) {
      console.error("[admin/calls] supabase error:", error);
      return NextResponse.json({ error: "Failed to fetch calls" }, { status: 500 });
    }

    if (!calls || calls.length === 0) {
      return NextResponse.json([]);
    }

    // Pull turns for these calls in a single query
    const callIds = calls.map((c) => c.id);
    const { data: turns } = await supabase
      .from("call_turns")
      .select("call_id, turn_index, role, agent_name, text, tool_name")
      .in("call_id", callIds)
      .order("turn_index", { ascending: true });

    const turnsByCall = new Map<string, typeof turns>();
    for (const t of turns ?? []) {
      const arr = turnsByCall.get(t.call_id) ?? [];
      arr.push(t);
      turnsByCall.set(t.call_id, arr);
    }

    // Map to dashboard-friendly shape
    const mapped = calls.map((c) => {
      const cTurns = turnsByCall.get(c.id) ?? [];
      const transcript = cTurns
        .map((t) => {
          if (t.role === "user" || t.role === "caller") return `Caller: ${t.text ?? ""}`;
          if (t.role === "tool") return `[tool:${t.tool_name ?? "?"}] ${t.text ?? ""}`;
          return `${(t.agent_name ?? "agent").toString()}: ${t.text ?? ""}`;
        })
        .join("\n");

      return {
        id: c.id,
        created_at: c.created_at,
        caller_phone: c.from_number,
        to_number: c.to_number,
        duration_seconds: c.duration_seconds ?? 0,
        sentiment: c.escalated ? "negative" : "neutral",
        outcome:
          c.outcome ??
          (c.status === "completed" ? "completed" : c.status ?? "in_progress"),
        transcript: transcript || c.transcript_summary || "(no transcript)",
        summary: c.transcript_summary,
        current_agent: c.current_agent,
        elevenlabs_agent_id: c.elevenlabs_agent_id,
        agents_handled: c.agents_handled,
        escalated: c.escalated,
        escalation_reason: c.escalation_reason,
        escalation_urgency: c.escalation_urgency,
        recording_url: c.recording_url,
        conversation_id: c.conversation_id,
        call_sid: c.call_sid,
        lead_id: c.lead_id,
        account_id: c.account_id,
      };
    });

    return NextResponse.json(mapped);
  } catch (err) {
    console.error("[admin/calls] unhandled:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
