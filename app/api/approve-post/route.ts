import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Use service role key so we can bypass RLS and publish the post
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  const action = req.nextUrl.searchParams.get("action") ?? "publish"; // publish | reject

  if (!token) {
    return new NextResponse("Missing token", { status: 400 });
  }

  // Look up the post by review token
  const { data: post, error: findError } = await supabase
    .from("blog_posts")
    .select("id, title, slug, status")
    .eq("review_token", token)
    .single();

  if (findError || !post) {
    return new NextResponse(approvalPage("Invalid Link", "This approval link is invalid or has already been used.", false), {
      status: 404,
      headers: { "Content-Type": "text/html" },
    });
  }

  if (post.status === "published") {
    return new NextResponse(
      approvalPage("Already Published", `"${post.title}" is already live on the site.`, true, post.slug),
      { headers: { "Content-Type": "text/html" } }
    );
  }

  if (action === "reject") {
    await supabase
      .from("blog_posts")
      .update({ status: "rejected", review_token: null })
      .eq("id", post.id);

    return new NextResponse(
      approvalPage("Post Rejected", `"${post.title}" has been rejected and will not be published.`, false),
      { headers: { "Content-Type": "text/html" } }
    );
  }

  // Publish it
  const { error: updateError } = await supabase
    .from("blog_posts")
    .update({
      status: "published",
      published_at: new Date().toISOString(),
      review_token: null, // consume the token
    })
    .eq("id", post.id);

  if (updateError) {
    return new NextResponse("Failed to publish post. Please try again.", { status: 500 });
  }

  return new NextResponse(
    approvalPage("✅ Published!", `"${post.title}" is now live on banditrecycling.com.`, true, post.slug),
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
    <div style="font-size:48px;margin-bottom:16px;">${success ? "🦝" : "❌"}</div>
    <h1 style="color:${success ? "#39FF14" : "#ef4444"};font-size:28px;font-weight:900;margin:0 0 12px;">${heading}</h1>
    <p style="color:#9ca3af;font-size:16px;line-height:1.6;margin:0 0 8px;">${message}</p>
    ${blogLink}
  </div>
</body></html>`;
}
