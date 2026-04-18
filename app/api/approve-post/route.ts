import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

const AUTOGEN_SECRET = process.env.AUTOGEN_SECRET;

// Fire-and-forget image generation. Does not block the approval response.
// If Gemini is slow or fails, the post still publishes; admin can manually
// regenerate from /admin/blog.
async function fireAutoGenerate(postId: string, req: NextRequest) {
  if (!AUTOGEN_SECRET) return; // Not configured → skip silently
  const origin = new URL(req.url).origin;
  try {
    // Don't await — kick it off and let the runtime handle it. Vercel keeps
    // the function warm long enough for short fire-and-forgets.
    await fetch(`${origin}/api/admin/generate-post-image`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-autogen-secret": AUTOGEN_SECRET,
      },
      body: JSON.stringify({ postId, trigger: "auto_publish" }),
    }).catch(() => {}); // Best effort — do not throw
  } catch {
    // Swallow — approval flow succeeds regardless
  }
}

// Uses a SECURITY DEFINER RPC function so the anon key can publish/reject posts
// without needing the service role key in production.
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  const action = req.nextUrl.searchParams.get("action") ?? "publish";

  if (!token) {
    return new NextResponse("Missing token", { status: 400 });
  }

  const { data, error } = await supabase.rpc("approve_blog_post", {
    p_token: token,
    p_action: action,
  });

  if (error || !data) {
    return new NextResponse(
      approvalPage("Invalid Link", "This approval link is invalid or has already been used.", false),
      { status: 404, headers: { "Content-Type": "text/html" } }
    );
  }

  if (!data.success) {
    return new NextResponse(
      approvalPage("Invalid Link", "This approval link is invalid or has already been used.", false),
      { status: 404, headers: { "Content-Type": "text/html" } }
    );
  }

  if (data.already_published) {
    return new NextResponse(
      approvalPage("Already Published", `"${data.title}" is already live on the site.`, true, data.slug),
      { headers: { "Content-Type": "text/html" } }
    );
  }

  if (data.action === "rejected") {
    return new NextResponse(
      approvalPage("Post Skipped", `"${data.title}" was skipped and won't be published.`, false),
      { headers: { "Content-Type": "text/html" } }
    );
  }

  // Fire-and-forget auto image generation. Look up post_id by slug since the
  // RPC may not return it.
  if (data.slug) {
    supabase
      .from("blog_posts")
      .select("id, image_url")
      .eq("slug", data.slug)
      .single()
      .then(({ data: post }) => {
        // Only auto-generate if there's no image yet (avoid re-rolling on
        // re-approval).
        if (post?.id && !post.image_url) {
          fireAutoGenerate(post.id, req);
        }
      });
  }

  return new NextResponse(
    approvalPage("✅ Published!", `"${data.title}" is now live on banditrecycling.com.`, true, data.slug),
    { headers: { "Content-Type": "text/html" } }
  );
}

function approvalPage(heading: string, message: string, success: boolean, slug?: string) {
  const blogLink = slug
    ? `<a href="https://banditrecycling.com/blog/${slug}" style="display:inline-block;margin-top:16px;padding:10px 24px;background:#39FF14;color:#000;font-weight:700;border-radius:8px;text-decoration:none;">View Live Post →</a>`
    : `<a href="https://banditrecycling.com/blog" style="display:inline-block;margin-top:16px;padding:10px 24px;background:#333;color:#fff;font-weight:700;border-radius:8px;text-decoration:none;">Back to Blog</a>`;

  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${heading} — Bandit Recycling</title></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:system-ui,sans-serif;min-height:100vh;display:flex;align-items:center;justify-content:center;">
  <div style="text-align:center;padding:40px;max-width:480px;">
    <div style="font-size:48px;margin-bottom:16px;">${success ? "🦝" : "✕"}</div>
    <h1 style="color:${success ? "#39FF14" : "#ef4444"};font-size:28px;font-weight:900;margin:0 0 12px;">${heading}</h1>
    <p style="color:#9ca3af;font-size:16px;line-height:1.6;margin:0 0 8px;">${message}</p>
    ${blogLink}
  </div>
</body></html>`;
}
