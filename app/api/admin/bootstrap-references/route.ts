import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { bootstrapReferences } from "@/lib/imageGen";
import fs from "fs/promises";
import path from "path";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const TOKEN_SALT = process.env.TOKEN_SALT || "bandit-salt";

function generateToken(pw: string) {
  return crypto.createHash("sha256").update(pw + TOKEN_SALT).digest("hex");
}

function isAuthorized(req: NextRequest): boolean {
  const cookie = req.cookies.get("bandit-admin");
  if (!cookie?.value || !ADMIN_PASSWORD) return false;
  return cookie.value === generateToken(ADMIN_PASSWORD);
}

// POST /api/admin/bootstrap-references
// Reads public/reference/bandit-*-1k.png from the Vercel deployment bundle
// and uploads them to the Supabase Storage "reference" bucket so the main
// image generator has a stable URL to fetch from.
export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const refDir = path.join(process.cwd(), "public", "reference");
  let mascotBuffer: Buffer;
  let balerBuffer: Buffer;
  try {
    mascotBuffer = await fs.readFile(path.join(refDir, "bandit-mascot-1k.png"));
    balerBuffer = await fs.readFile(path.join(refDir, "bandit-baler-1k.png"));
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: `Reference PNGs missing in deployment: ${e.message}` },
      { status: 500 }
    );
  }

  const result = await bootstrapReferences({ mascotBuffer, balerBuffer });
  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.error }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    mascotUrl: result.mascotUrl,
    balerUrl: result.balerUrl,
  });
}
