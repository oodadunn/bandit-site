import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { rekeyExistingPageAsset } from "@/lib/imageGen";

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

// POST { slug?: string }  — no slug = re-key all Bandit-mascot slots in one shot.
export async function POST(req: NextRequest) {
  if (!isAuthed(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: { slug?: string } = {};
  try { body = await req.json(); } catch {}

  const slugs = body.slug
    ? [body.slug]
    : ["services", "service-area", "partners", "materials", "equipment", "wire"];

  const results = [];
  for (const slug of slugs) {
    const r = await rekeyExistingPageAsset(slug);
    results.push({ slug, ...r });
  }

  const anyFail = results.some((r) => !r.ok);
  return NextResponse.json({ ok: !anyFail, results }, { status: anyFail ? 207 : 200 });
}

export const maxDuration = 60;
