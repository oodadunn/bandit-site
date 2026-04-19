/**
 * Bandit Image Generation
 * Calls Gemini 2.5 Flash Image with mascot + baler reference images attached
 * for character consistency. Built directly on the REST API to avoid an extra
 * SDK dependency.
 *
 * Style bible: /Bandit_Visual_Style_Bible.md (§8 scaffold + §9 category prompts)
 */

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY!;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Service-role client — bypasses RLS for admin-side writes (storage + table updates)
function svc() {
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
}

// ─── Style bible §8/§9 ─────────────────────────────────────────────────────
// Category baselines from Bandit_Visual_Style_Bible.md §9. Keep these in sync
// with the bible — when the bible changes, update here too.

const CATEGORY_SCENE: Record<string, string> = {
  "Maintenance":
    "Bandit kneeling next to a vertical industrial baler, one paw holding a wrench, the other touching a hydraulic line. Focused expression, one eyebrow raised slightly. Setting: softly blurred warehouse floor with a forklift in the background.",
  "Equipment":
    "Three-quarter hero shot of the Bandit-branded vertical baler — matte black body with neon green #39FF14 accent wiring and glowing status LEDs. Bandit stands at mid-frame next to the machine with one paw resting on the frame, confident closed-mouth smile. Setting: clean industrial studio floor, soft shadow grounding, slight low angle.",
  "Industry Tips":
    "Bandit mid-explanation, one paw gesturing outward, open warm smile with small teeth visible, holding a clipboard in his other paw. Behind him, softly blurred, a neat stack of cardboard bales and a coil of bale wire.",
  "Recycling Education":
    "Bandit standing next to three cleanly sorted materials — a compact cardboard bale on his left, a coil of 14-gauge bale wire on a spool in the middle, and a smaller bale of clean plastic on his right. He gestures at the materials with one paw, warm closed-mouth smile. Setting: clean recycling facility floor, softly blurred.",
  "News":
    "Bandit standing in front of a large softly-blurred USA map on a warehouse wall, a handful of neon-green #39FF14 pins marking service locations. He holds a rolled newspaper labeled 'The Bandit Dispatch' in one paw. Confident small smile, looking at camera.",
};

const DEFAULT_SCENE =
  "Bandit standing in a softly blurred warehouse environment, hands on hips, confident closed-mouth smile.";

const CHARACTER_SHEET = `Bandit is a confident adult raccoon mascot, Pixar-style, ~3.5 heads tall. Classic raccoon mask — jet black around the eyes with a clean cream outline. Gray-brown fur with visible strand detail and subsurface scattering. Large warm amber-brown eyes with soft catchlights. Ringed tail with 5–6 bands. He wears a matte black tool belt with a neon green #39FF14 buckle (or a black work vest with a neon green BANDIT chest patch).`;

const NEGATIVE = `no text in image, no watermarks, no second raccoon, no trash, no dumpster, no weapons, no crowbars, no burglar sack, no Halloween props, no multiple characters, no humans as primary subject, no other greens, no flat 2D, no angry expression`;

export function buildPrompt(opts: {
  title: string;
  excerpt: string;
  category: string;
  override?: string;
}): string {
  if (opts.override?.trim()) return opts.override.trim();

  const scene = CATEGORY_SCENE[opts.category] ?? DEFAULT_SCENE;

  return [
    `Pixar-style 3D animation still, cinematic render.`,
    ``,
    `BLOG POST CONTEXT: "${opts.title}" — ${opts.excerpt}`,
    `Generate a hero image that visually relates to this specific post topic while staying on-brand.`,
    ``,
    `SCENE: ${scene}`,
    ``,
    `CHARACTER: ${CHARACTER_SHEET}`,
    ``,
    `LIGHTING: Cinematic three-point. Soft warm key, cool neon-green #39FF14 rim light, subtle fill. Grounded shadows. Shallow depth of field on Bandit.`,
    ``,
    `PALETTE: matte black #0A0A0A and neon green #39FF14 accents only, warm cardboard tan #C8A97E where applicable. No other greens.`,
    ``,
    `COMPOSITION: aspect ratio 16:9, ~10% quiet space at the top edge for headline overlay.`,
    ``,
    `STYLE: Pixar-grade 3D, PBR materials, subsurface-scattered fur. Match the attached reference images for the character (the raccoon) and the equipment (the matte-black neon-green baler).`,
    ``,
    `NEGATIVE: ${NEGATIVE}.`,
  ].join("\n");
}

// ─── Budget guard ─────────────────────────────────────────────────────────

export async function checkBudget(): Promise<{
  ok: boolean;
  reason?: string;
  enabled?: boolean;
  dailyUsed?: number;
  monthlyUsed?: number;
  config?: { daily_cap: number; monthly_cap: number; model: string };
}> {
  const sb = svc();

  const { data: cfg } = await sb
    .from("image_gen_config")
    .select("enabled, daily_cap, monthly_cap, model")
    .eq("id", 1)
    .single();

  if (!cfg) return { ok: false, reason: "Config row missing — run migration" };
  if (!cfg.enabled) return { ok: false, reason: "Image generation disabled (kill switch on)", enabled: false };

  const dayAgo = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
  const monthStart = new Date();
  monthStart.setUTCDate(1);
  monthStart.setUTCHours(0, 0, 0, 0);

  const { count: dailyCount } = await sb
    .from("image_gen_log")
    .select("id", { head: true, count: "exact" })
    .eq("status", "success")
    .gte("created_at", dayAgo);

  const { count: monthlyCount } = await sb
    .from("image_gen_log")
    .select("id", { head: true, count: "exact" })
    .eq("status", "success")
    .gte("created_at", monthStart.toISOString());

  const daily = dailyCount ?? 0;
  const monthly = monthlyCount ?? 0;

  if (daily >= cfg.daily_cap)
    return { ok: false, reason: `Daily cap reached (${daily}/${cfg.daily_cap})`, dailyUsed: daily, monthlyUsed: monthly, config: cfg };
  if (monthly >= cfg.monthly_cap)
    return { ok: false, reason: `Monthly cap reached (${monthly}/${cfg.monthly_cap})`, dailyUsed: daily, monthlyUsed: monthly, config: cfg };

  return { ok: true, enabled: true, dailyUsed: daily, monthlyUsed: monthly, config: cfg };
}

// ─── Reference image fetching ─────────────────────────────────────────────
// Fetch from Supabase Storage and convert to base64 inlineData parts.

async function fetchAsBase64(publicUrl: string): Promise<{ data: string; mimeType: string }> {
  const r = await fetch(publicUrl);
  if (!r.ok) throw new Error(`Failed to fetch reference: ${publicUrl} (${r.status})`);
  const buf = Buffer.from(await r.arrayBuffer());
  const mime = r.headers.get("content-type") ?? "image/png";
  return { data: buf.toString("base64"), mimeType: mime };
}

// Dynamic reference loading: every PNG in the Supabase `reference` bucket is
// attached to every Gemini call (capped at MAX_REFS). Drop a new PNG into the
// bucket → next generation uses it, no code change needed.
const MAX_REFS = 5;

async function loadReferenceImages(): Promise<{ data: string; mimeType: string }[]> {
  const sb = svc();

  // List all files in the reference bucket
  const { data: files, error } = await sb.storage
    .from("reference")
    .list("", { limit: 20, sortBy: { column: "created_at", order: "asc" } });

  if (error) throw new Error(`Failed to list reference bucket: ${error.message}`);

  // Filter out folders / non-image files; take up to MAX_REFS
  const pngs = (files ?? [])
    .filter((f) => f.name && f.name.toLowerCase().endsWith(".png") && !f.name.startsWith("."))
    .slice(0, MAX_REFS);

  if (pngs.length === 0) {
    throw new Error(
      "No reference images found in Supabase 'reference' bucket. Run 'Bootstrap brand references' from /admin/blog first."
    );
  }

  // Fetch and base64-encode all refs in parallel
  const refs = await Promise.all(
    pngs.map((f) => {
      const url = sb.storage.from("reference").getPublicUrl(f.name).data.publicUrl;
      return fetchAsBase64(url);
    })
  );

  return refs;
}

// ─── Gemini call ──────────────────────────────────────────────────────────

interface GenerateResult {
  imageBuffer: Buffer;
  mimeType: string;
}

async function callGemini(prompt: string, model: string, refs: Awaited<ReturnType<typeof loadReferenceImages>>): Promise<GenerateResult> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

  const body = {
    contents: [
      {
        role: "user",
        parts: [
          { text: prompt },
          ...refs.map((r) => ({ inlineData: { mimeType: r.mimeType, data: r.data } })),
        ],
      },
    ],
    generationConfig: {
      temperature: 1.0,
      // Gemini image models return image data as inline parts in the response.
      responseModalities: ["IMAGE"],
      // 16:9 widescreen — prevents banner hero from cropping Bandit's face.
      // Thumbnail on /blog uses the same image, just CSS-scaled.
      imageConfig: {
        aspectRatio: "16:9",
      },
    },
  };

  const r = await fetch(url, {
    method: "POST",
    headers: {
      "x-goog-api-key": GEMINI_API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!r.ok) {
    const errText = await r.text();
    throw new Error(`Gemini API error ${r.status}: ${errText.substring(0, 500)}`);
  }

  const json = await r.json();
  const parts = json?.candidates?.[0]?.content?.parts ?? [];
  const imagePart = parts.find((p: any) => p?.inlineData?.data);
  if (!imagePart) {
    throw new Error(`Gemini returned no image. Response: ${JSON.stringify(json).substring(0, 500)}`);
  }
  return {
    imageBuffer: Buffer.from(imagePart.inlineData.data, "base64"),
    mimeType: imagePart.inlineData.mimeType ?? "image/png",
  };
}

// ─── Storage upload ───────────────────────────────────────────────────────

async function uploadToStorage(slug: string, buffer: Buffer, mime: string): Promise<string> {
  const sb = svc();
  const ext = mime.includes("jpeg") ? "jpg" : "png";
  const path = `${slug}/${Date.now()}.${ext}`;
  const { error } = await sb.storage.from("blog-images").upload(path, buffer, {
    contentType: mime,
    upsert: true,
  });
  if (error) throw new Error(`Storage upload failed: ${error.message}`);
  return sb.storage.from("blog-images").getPublicUrl(path).data.publicUrl;
}

// ─── Public entrypoint ────────────────────────────────────────────────────

export interface GenerateOptions {
  postId: string;
  trigger: "manual" | "auto_publish" | "backfill" | "bootstrap";
  promptOverride?: string;
}

export async function generatePostImage(opts: GenerateOptions): Promise<{
  ok: boolean;
  imageUrl?: string;
  error?: string;
  prompt?: string;
}> {
  const sb = svc();
  const t0 = Date.now();

  // 1. Budget check
  const budget = await checkBudget();
  if (!budget.ok) {
    await sb.from("image_gen_log").insert({
      post_id: opts.postId,
      prompt: "(blocked — budget)",
      model: budget.config?.model ?? "n/a",
      status: "blocked",
      error: budget.reason,
      trigger: opts.trigger,
    });
    return { ok: false, error: budget.reason };
  }

  // 2. Load post
  const { data: post, error: postErr } = await sb
    .from("blog_posts")
    .select("id, slug, title, excerpt, category")
    .eq("id", opts.postId)
    .single();
  if (postErr || !post) return { ok: false, error: `Post not found: ${postErr?.message ?? "unknown"}` };

  // 3. Build prompt
  const prompt = buildPrompt({
    title: post.title,
    excerpt: post.excerpt,
    category: post.category,
    override: opts.promptOverride,
  });

  // 4. Load reference images dynamically from the Supabase reference bucket.
  //    Every PNG in the bucket is attached (capped at MAX_REFS=5).
  let refs;
  try {
    refs = await loadReferenceImages();
  } catch (e: any) {
    await sb.from("image_gen_log").insert({
      post_id: opts.postId,
      post_slug: post.slug,
      prompt,
      model: budget.config!.model,
      status: "failed",
      error: `Reference load: ${e.message}`,
      trigger: opts.trigger,
    });
    return { ok: false, error: `Reference load failed: ${e.message}` };
  }

  // 5. Call Gemini
  let gen;
  try {
    gen = await callGemini(prompt, budget.config!.model, refs);
  } catch (e: any) {
    await sb.from("image_gen_log").insert({
      post_id: opts.postId,
      post_slug: post.slug,
      prompt,
      model: budget.config!.model,
      status: "failed",
      error: e.message,
      trigger: opts.trigger,
      duration_ms: Date.now() - t0,
    });
    return { ok: false, error: e.message };
  }

  // 6. Upload
  let imageUrl;
  try {
    imageUrl = await uploadToStorage(post.slug, gen.imageBuffer, gen.mimeType);
  } catch (e: any) {
    await sb.from("image_gen_log").insert({
      post_id: opts.postId,
      post_slug: post.slug,
      prompt,
      model: budget.config!.model,
      status: "failed",
      error: `Upload: ${e.message}`,
      trigger: opts.trigger,
      duration_ms: Date.now() - t0,
    });
    return { ok: false, error: `Upload failed: ${e.message}` };
  }

  // 7. Update blog_posts.image_url + log success
  const { error: updateErr } = await sb
    .from("blog_posts")
    .update({ image_url: imageUrl })
    .eq("id", opts.postId);

  if (updateErr) {
    await sb.from("image_gen_log").insert({
      post_id: opts.postId,
      post_slug: post.slug,
      prompt,
      model: budget.config!.model,
      status: "failed",
      error: `DB update: ${updateErr.message}`,
      image_url: imageUrl,
      trigger: opts.trigger,
      duration_ms: Date.now() - t0,
    });
    return { ok: false, error: `DB update failed (image was generated): ${updateErr.message}` };
  }

  await sb.from("image_gen_log").insert({
    post_id: opts.postId,
    post_slug: post.slug,
    prompt,
    model: budget.config!.model,
    status: "success",
    image_url: imageUrl,
    trigger: opts.trigger,
    duration_ms: Date.now() - t0,
  });

  // Invalidate the cached blog list + this specific post page so the new
  // image shows up immediately (no 5-minute ISR wait).
  try {
    revalidatePath("/blog");
    revalidatePath(`/blog/${post.slug}`);
  } catch {
    // Non-fatal if called outside a request context (e.g. tests).
  }

  return { ok: true, imageUrl, prompt };
}

// Bootstrap logic now lives in /api/admin/bootstrap-references/route.ts —
// it uploads every *-1k.png in public/reference/ to Supabase Storage in one
// pass, so new references only need a file drop + button click, no code change.
