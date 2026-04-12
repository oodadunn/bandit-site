import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const category = (formData.get("category") as string) || "general";
    const sessionId = (formData.get("sessionId") as string) || "unknown";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File too large. Maximum 10MB." },
        { status: 400 }
      );
    }

    // Validate mime type
    const allowed = [
      "image/jpeg",
      "image/png",
      "image/heic",
      "image/heif",
      "image/webp",
    ];
    if (!allowed.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Accepted: JPEG, PNG, HEIC, WebP." },
        { status: 400 }
      );
    }

    // Generate unique filename
    const ext = file.name.split(".").pop() || "jpg";
    const timestamp = Date.now();
    const random = Math.random().toString(36).slice(2, 8);
    const path = `${sessionId}/${category}/${timestamp}-${random}.${ext}`;

    // Convert File to ArrayBuffer for Supabase upload
    const buffer = Buffer.from(await file.arrayBuffer());

    const sb = getSupabaseAdmin();
    const { error: uploadError } = await sb.storage
      .from("site-survey-photos")
      .upload(path, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error("Storage upload error:", uploadError);
      return NextResponse.json(
        { error: "Upload failed: " + uploadError.message },
        { status: 500 }
      );
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = sb.storage.from("site-survey-photos").getPublicUrl(path);

    return NextResponse.json({ ok: true, url: publicUrl, path });
  } catch (err) {
    console.error("Upload route error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
