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

// Pose library — instead of one fixed scene per category, we pick randomly
// from a pool of 6–8 poses. This keeps Bandit's identity consistent (same
// character) while letting his pose, expression, framing, and props vary
// post-to-post and even regen-to-regen on the same post.
//
// Each entry blends pose + expression + setting + props.
const CATEGORY_POSES: Record<string, string[]> = {
  "Maintenance": [
    "Bandit kneeling beside a vertical baler, focused expression with one eyebrow raised, holding a wrench in one paw and resting the other on a hydraulic line. Forklift softly blurred in background.",
    "Bandit standing in front of an open baler control panel, clipboard in one paw, the other paw scratching his chin in thought. Status LEDs glowing in the background.",
    "Bandit mid-fix, sleeves of his vest rolled up, hands deep in a hydraulic cylinder, gentle concern on his face. Toolbox open at his feet.",
    "Bandit on a step-ladder beside a baler, holding a flashlight and pointing it at a part overhead. Focused, slight squint.",
    "Bandit standing back from a freshly-fixed baler, proud thumbs-up, big satisfied open-mouth smile. Wrench tucked into his tool belt.",
    "Bandit crouched low, examining the underside of a baler, headlamp on, both paws on the frame. Determined expression.",
  ],
  "Equipment": [
    "Three-quarter hero shot of the Bandit-branded vertical baler. Bandit at mid-frame, one paw on the frame, confident closed-mouth smile. Slight low angle.",
    "Bandit walking toward camera from beside the baler, clipboard under arm, easy smile. Baler softly behind him on his left.",
    "Bandit gesturing up at the size of a horizontal baler with both paws, mouth open in 'wow' expression. Camera low.",
    "Bandit operating the green-lit control panel of a baler, focused expression, one paw on a button. Profile view.",
    "Bandit standing on top of a forklift platform alongside an upright baler, surveying the scene with a confident look.",
    "Front view of Bandit leaning casually with one paw on the lower door of a baler, ankles crossed, relaxed smile.",
  ],
  "Industry Tips": [
    "Bandit mid-explanation gesturing outward with one paw, holding a clipboard in the other. Stack of cardboard bales softly blurred behind him.",
    "Bandit holding a coil of bale wire up to camera with both paws like a prize, big proud smile.",
    "Bandit sitting cross-legged on top of a stack of cardboard bales, casual relaxed smile, paws on knees.",
    "Bandit pointing at a single completed bale beside him, focused 'pay attention to this' expression. Other paw on hip.",
    "Bandit walking through an aisle of stacked bales, looking back over his shoulder at camera with a grin.",
    "Bandit counting on his fingers as if listing tips, three fingers raised, mouth open mid-word.",
    "Bandit tapping a clipboard with a pen, raised eyebrow, gentle 'let me explain' expression.",
    "Bandit leaning against a coil of bale wire on a spool, ankles crossed, casual smile, one paw resting on the wire.",
  ],
  "Recycling Education": [
    "Bandit standing between two material piles — clean cardboard on one side, sorted plastic on the other — gesturing at both with arms wide. Warm explanatory smile.",
    "Bandit holding up a sample piece of clean cardboard to inspect it, magnifying glass in the other paw, focused look.",
    "Bandit pointing at a labeled sorting bin, eager 'this one' expression, paw extended.",
    "Bandit walking through a recycling facility with a handful of bale wire, looking at camera with an inviting smile.",
    "Bandit at a sorting line conveyor, plucking out a contaminant with a 'gotcha' grin.",
    "Bandit kneeling next to a pile of OCC cardboard, examining a flake, gentle curious expression.",
  ],
  "News": [
    "Bandit standing in front of a large softly-blurred USA map on a warehouse wall, neon-green #39FF14 pins marking service locations. Holds a rolled newspaper labeled 'The Bandit Dispatch' in one paw. Confident small smile.",
    "Bandit at a podium-style desk reading from the rolled-up Bandit Dispatch, news-anchor pose, looking at camera.",
    "Bandit pointing at a chart on a wall showing a green upward trend line, proud smile.",
    "Bandit in mid-thought, pen to lips, considering something on a whiteboard with diagrams behind him.",
    "Bandit walking briskly through a busy facility, newspaper tucked under arm, looking purposeful.",
    "Bandit standing with paws on hips in front of a row of three different baler models, surveying the lineup.",
  ],
};

const DEFAULT_POSES = [
  "Bandit standing in a softly blurred warehouse, hands on hips, confident closed-mouth smile.",
  "Bandit walking toward camera from a softly blurred warehouse aisle, easy smile.",
  "Bandit leaning against a stack of cardboard bales, casual smile.",
];

// Hash the slug so different posts deterministically pick different poses,
// and add a per-call random salt so REGENERATING the same post gives a
// fresh pose each time. (Best of both: variety across posts AND across regens.)
function pickPose(slug: string, category: string): string {
  const pool = CATEGORY_POSES[category] ?? DEFAULT_POSES;
  const idx = Math.floor(Math.random() * pool.length);
  return pool[idx];
}

const CHARACTER_SHEET = `Bandit is a confident adult raccoon mascot, Pixar-style, ~3.5 heads tall. Classic raccoon mask — jet black around the eyes with a clean cream outline. Gray-brown fur with visible strand detail and subsurface scattering. Large warm amber-brown eyes with soft catchlights. Ringed tail with 5–6 bands. He wears a matte black tool belt with a neon green #39FF14 buckle (or a black work vest with a neon green BANDIT chest patch).`;

const NEGATIVE = `no text in image, no watermarks, no second raccoon, no trash, no dumpster, no weapons, no crowbars, no burglar sack, no Halloween props, no multiple characters, no humans as primary subject, no other greens, no flat 2D, no angry expression`;

// Trim markdown + whitespace from the content field so the model focuses on
// substance. Strips headers, code fences, inline formatting, and collapses
// whitespace. Returns the first N chars of the cleaned text.
function cleanContent(raw: string | null | undefined, maxLen = 450): string {
  if (!raw) return "";
  const cleaned = raw
    .replace(/```[\s\S]*?```/g, " ")     // code fences
    .replace(/^#+\s+/gm, "")             // markdown headers
    .replace(/\*\*(.+?)\*\*/g, "$1")     // bold
    .replace(/\*(.+?)\*/g, "$1")         // italic
    .replace(/\[(.+?)\]\(.+?\)/g, "$1")  // links: keep label only
    .replace(/\s+/g, " ")                // collapse whitespace
    .trim();
  return cleaned.length > maxLen ? cleaned.slice(0, maxLen).trimEnd() + "…" : cleaned;
}

export function buildPrompt(opts: {
  slug: string;
  title: string;
  excerpt: string;
  content?: string | null;
  category: string;
  override?: string;
}): string {
  if (opts.override?.trim()) return opts.override.trim();

  const pose = pickPose(opts.slug, opts.category);
  const contentSnippet = cleanContent(opts.content);

  return [
    `Pixar-style 3D animation still, cinematic render. Aspect ratio 16:9.`,
    ``,
    `=== BLOG POST (the image must feel SPECIFIC to this post, not generic) ===`,
    `TITLE: ${opts.title}`,
    `EXCERPT: ${opts.excerpt}`,
    contentSnippet ? `CONTENT OPENING: ${contentSnippet}` : ``,
    ``,
    `Task: From the post above, pick ONE concrete, specific visual detail — a tool, a part, a problem being solved, a scenario the author describes, a tangible object mentioned — and weave it into the scene below. Make THIS post's image distinguishable from every other ${opts.category} post's image. Do not just draw a generic recycling scene.`,
    ``,
    `=== BANDIT'S POSE FOR THIS IMAGE ===`,
    pose,
    ``,
    `=== CHARACTER (consistent across all images) ===`,
    CHARACTER_SHEET,
    ``,
    `=== STYLE ===`,
    `Lighting: Cinematic three-point — soft warm key, cool neon-green #39FF14 rim light, subtle fill. Grounded shadows. Shallow depth of field on Bandit.`,
    `Palette: matte black #0A0A0A and neon green #39FF14 accents only, warm cardboard tan #C8A97E where applicable. No other greens.`,
    `Composition: 16:9, leave ~10% quiet space at the top edge for headline overlay.`,
    `Style: Pixar-grade 3D, PBR materials, subsurface-scattered fur. Match the attached reference images for the character and any baler equipment.`,
    ``,
    `=== AVOID ===`,
    NEGATIVE,
  ].filter(Boolean).join("\n");
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

async function callGemini(
  prompt: string,
  model: string,
  refs: Awaited<ReturnType<typeof loadReferenceImages>>,
  aspectRatio: "16:9" | "1:1" | "4:3" | "3:4" | "9:16" = "16:9"
): Promise<GenerateResult> {
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
      responseModalities: ["IMAGE"],
      // Aspect ratio: blog heroes are 16:9; page header assets are 1:1.
      imageConfig: { aspectRatio },
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

  // 2. Load post (including content so we can ground the image in actual post substance)
  const { data: post, error: postErr } = await sb
    .from("blog_posts")
    .select("id, slug, title, excerpt, content, category")
    .eq("id", opts.postId)
    .single();
  if (postErr || !post) return { ok: false, error: `Post not found: ${postErr?.message ?? "unknown"}` };

  // 3. Build prompt (random pose + content-aware)
  const prompt = buildPrompt({
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    content: post.content,
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

// ─── Page-asset generation (transparent 1:1 header images) ────────────────
// Used by /admin/blog's Page Headers section and the /api/admin/generate-header-asset
// endpoint. Reads prompt from page_assets table, renders 1:1 with the same
// character references attached, uploads to the `headers` bucket at a stable
// filename (so menu pages can point to a canonical URL), updates page_assets.

export async function generatePageAsset(slug: string): Promise<{
  ok: boolean;
  url?: string;
  error?: string;
  prompt?: string;
}> {
  const sb = svc();
  const t0 = Date.now();

  // 1. Budget check (shared cap with blog images)
  const budget = await checkBudget();
  if (!budget.ok) {
    await sb.from("image_gen_log").insert({
      post_slug: `asset:${slug}`,
      prompt: "(blocked — budget)",
      model: budget.config?.model ?? "n/a",
      status: "blocked",
      error: budget.reason,
      trigger: "manual",
    });
    return { ok: false, error: budget.reason };
  }

  // 2. Load asset row (has the prompt)
  const { data: asset, error: assetErr } = await sb
    .from("page_assets")
    .select("slug, display_name, prompt")
    .eq("slug", slug)
    .single();
  if (assetErr || !asset) {
    return { ok: false, error: `page_assets row not found for slug='${slug}': ${assetErr?.message ?? "not found"}` };
  }

  // 3. Load references + call Gemini at 1:1
  let refs;
  try {
    refs = await loadReferenceImages();
  } catch (e: any) {
    await sb.from("image_gen_log").insert({
      post_slug: `asset:${slug}`, prompt: asset.prompt, model: budget.config!.model,
      status: "failed", error: `Reference load: ${e.message}`, trigger: "manual",
    });
    return { ok: false, error: `Reference load failed: ${e.message}` };
  }

  let gen;
  try {
    gen = await callGemini(asset.prompt, budget.config!.model, refs, "1:1");
  } catch (e: any) {
    await sb.from("image_gen_log").insert({
      post_slug: `asset:${slug}`, prompt: asset.prompt, model: budget.config!.model,
      status: "failed", error: e.message, trigger: "manual",
      duration_ms: Date.now() - t0,
    });
    return { ok: false, error: e.message };
  }

  // 4. Upload to headers/{slug}-{timestamp}.png (timestamp avoids CDN cache)
  const filename = `${slug}-${Date.now()}.png`;
  const { error: upErr } = await sb.storage
    .from("headers")
    .upload(filename, gen.imageBuffer, { contentType: "image/png", upsert: true });
  if (upErr) {
    await sb.from("image_gen_log").insert({
      post_slug: `asset:${slug}`, prompt: asset.prompt, model: budget.config!.model,
      status: "failed", error: `Storage upload: ${upErr.message}`, trigger: "manual",
      duration_ms: Date.now() - t0,
    });
    return { ok: false, error: `Upload failed: ${upErr.message}` };
  }

  const publicUrl = sb.storage.from("headers").getPublicUrl(filename).data.publicUrl;

  // 5. Update page_assets.url + log
  await sb.from("page_assets")
    .update({ url: publicUrl, updated_at: new Date().toISOString() })
    .eq("slug", slug);

  await sb.from("image_gen_log").insert({
    post_slug: `asset:${slug}`, prompt: asset.prompt, model: budget.config!.model,
    status: "success", image_url: publicUrl, trigger: "manual",
    duration_ms: Date.now() - t0,
  });

  // 6. Invalidate the menu page cache so the new asset shows up immediately
  try {
    const pagePath = slug === "materials" ? "/materials" : `/${slug}`;
    revalidatePath(pagePath);
  } catch {}

  return { ok: true, url: publicUrl, prompt: asset.prompt };
}
