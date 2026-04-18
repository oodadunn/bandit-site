import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { generatePostImage } from "@/lib/imageGen";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const TOKEN_SALT = process.env.TOKEN_SALT || "bandit-salt";

// Additional "server-to-server" secret for the auto-publish hook to call this
// route without a cookie (used by the approve-post flow).
const AUTOGEN_SECRET = process.env.AUTOGEN_SECRET;

function generateToken(pw: string) {
  return crypto.createHash("sha256").update(pw + TOKEN_SALT).digest("hex");
}

function isAuthorized(req: NextRequest): boolean {
  // 1. Admin cookie (manual button from /admin/blog)
  const cookie = req.cookies.get("bandit-admin");
  if (cookie?.value && ADMIN_PASSWORD && cookie.value === generateToken(ADMIN_PASSWORD)) {
    return true;
  }
  // 2. Server-to-server secret (auto-on-publish hook)
  const header = req.headers.get("x-autogen-secret");
  if (AUTOGEN_SECRET && header === AUTOGEN_SECRET) {
    return true;
  }
  return false;
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { postId?: string; trigger?: string; promptOverride?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.postId) {
    return NextResponse.json({ error: "Missing postId" }, { status: 400 });
  }

  const trigger = (body.trigger ?? "manual") as "manual" | "auto_publish" | "backfill" | "bootstrap";

  const result = await generatePostImage({
    postId: body.postId,
    trigger,
    promptOverride: body.promptOverride,
  });

  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.error }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    imageUrl: result.imageUrl,
    prompt: result.prompt,
  });
}

// Run longer than the 10s Vercel default — Gemini image generation usually
// takes 15–30s.
export const maxDuration = 60;
