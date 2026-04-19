import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { generatePageAsset } from "@/lib/imageGen";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const TOKEN_SALT = process.env.TOKEN_SALT || "bandit-salt";

function generateToken(pw: string) {
  return crypto.createHash("sha256").update(pw + TOKEN_SALT).digest("hex");
}

function isAuthed(req: NextRequest) {
  const cookie = req.cookies.get("bandit-admin");
  if (!cookie?.value || !ADMIN_PASSWORD) return false;
  return cookie.value === generateToken(ADMIN_PASSWORD);
}

export async function POST(req: NextRequest) {
  if (!isAuthed(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: { slug?: string };
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  if (!body.slug) return NextResponse.json({ error: "Missing slug" }, { status: 400 });

  const result = await generatePageAsset(body.slug);
  if (!result.ok) return NextResponse.json({ ok: false, error: result.error }, { status: 500 });

  return NextResponse.json({ ok: true, url: result.url });
}

export const maxDuration = 60;
