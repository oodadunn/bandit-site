import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";
import fs from "fs/promises";
import path from "path";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const TOKEN_SALT = process.env.TOKEN_SALT || "bandit-salt";
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

function generateToken(pw: string) {
  return crypto.createHash("sha256").update(pw + TOKEN_SALT).digest("hex");
}

function isAuthorized(req: NextRequest): boolean {
  const cookie = req.cookies.get("bandit-admin");
  if (!cookie?.value || !ADMIN_PASSWORD) return false;
  return cookie.value === generateToken(ADMIN_PASSWORD);
}

// POST /api/admin/bootstrap-references
// Uploads every *-1k.png file in public/reference/ to the Supabase Storage
// "reference" bucket. Idempotent — re-upserts every time, safe to re-run.
export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const refDir = path.join(process.cwd(), "public", "reference");
  const sb = createClient(SUPABASE_URL, SERVICE_KEY);

  let files: string[];
  try {
    const entries = await fs.readdir(refDir);
    // Only upload the 1k-downscaled PNGs (skip the originals to keep Supabase
    // storage lean and keep API calls fast).
    files = entries.filter((f) => f.endsWith("-1k.png"));
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: `Reference dir missing: ${e.message}` },
      { status: 500 }
    );
  }

  if (files.length === 0) {
    return NextResponse.json(
      { ok: false, error: "No *-1k.png files in public/reference/" },
      { status: 500 }
    );
  }

  const uploaded: Array<{ name: string; url: string }> = [];
  const errors: Array<{ name: string; error: string }> = [];

  for (const fname of files) {
    try {
      const buf = await fs.readFile(path.join(refDir, fname));
      const { error } = await sb.storage
        .from("reference")
        .upload(fname, buf, { contentType: "image/png", upsert: true });
      if (error) throw new Error(error.message);
      uploaded.push({
        name: fname,
        url: sb.storage.from("reference").getPublicUrl(fname).data.publicUrl,
      });
    } catch (e: any) {
      errors.push({ name: fname, error: e.message });
    }
  }

  return NextResponse.json({
    ok: errors.length === 0,
    uploaded,
    errors,
    count: uploaded.length,
  });
}
