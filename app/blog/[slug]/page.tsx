import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import { markdownToHtml } from "@/lib/markdown";
import { Clock, Tag, ArrowLeft, ArrowRight } from "lucide-react";

interface Post {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  tags: string[];
  read_time: number;
  author: string;
  published_at: string;
  seo_title: string | null;
  seo_description: string | null;
}

async function getPost(slug: string): Promise<Post | null> {
  try {
    const supabase = createClient();
    const { data } = await supabase
      .from("blog_posts")
      .select("*")
      .eq("slug", slug)
      .eq("status", "published")
      .single();
    return (data as Post) ?? null;
  } catch {
    return null;
  }
}

async function getRelated(category: string, currentSlug: string): Promise<Pick<Post, "slug" | "title" | "category" | "read_time" | "published_at">[]> {
  try {
    const supabase = createClient();
    const { data } = await supabase
      .from("blog_posts")
      .select("slug,title,category,read_time,published_at")
      .eq("status", "published")
      .eq("category", category)
      .neq("slug", currentSlug)
      .limit(3);
    return data ?? [];
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return { title: "Post Not Found | Bandit Recycling" };
  return {
    title: post.seo_title ?? `${post.title} | Bandit Recycling`,
    description: post.seo_description ?? post.excerpt,
    openGraph: {
      title: post.seo_title ?? post.title,
      description: post.seo_description ?? post.excerpt,
      type: "article",
      publishedTime: post.published_at,
      authors: [post.author],
    },
  };
}

export const revalidate = 300;

const CATEGORY_COLORS: Record<string, string> = {
  "Industry Tips":       "text-[#39FF14] bg-[#39FF14]/10 border-[#39FF14]/20",
  "Maintenance":         "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
  "Recycling Education": "text-blue-400 bg-blue-500/10 border-blue-500/20",
  "Equipment":           "text-purple-400 bg-purple-500/10 border-purple-500/20",
  "News":                "text-orange-400 bg-orange-500/10 border-orange-500/20",
};
function catColor(cat: string) {
  return CATEGORY_COLORS[cat] ?? "text-gray-400 bg-white/5 border-white/10";
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [post, related] = await Promise.all([getPost(slug), getPost(slug).then((p) => p ? getRelated(p.category, slug) : [])]);

  if (!post) notFound();

  const htmlContent = markdownToHtml(post.content);
  const pubDate = new Date(post.published_at).toLocaleDateString("en-US", {
    month: "long", day: "numeric", year: "numeric",
  });

  return (
    <>
      {/* ── HEADER ────────────────────────────────────────────────────────── */}
      <section className="relative bg-[#0A0A0A] overflow-hidden pt-24 pb-12 border-b border-white/8">
        <div className="container-site relative max-w-3xl">
          <Link href="/blog" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[#39FF14] transition-colors mb-6">
            <ArrowLeft size={14} /> Back to Blog
          </Link>

          <div className="flex flex-wrap items-center gap-3 mb-5">
            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border uppercase tracking-wider ${catColor(post.category)}`}>
              {post.category}
            </span>
            <span className="text-xs text-gray-500 flex items-center gap-1">
              <Clock size={11} /> {post.read_time} min read
            </span>
            <span className="text-xs text-gray-600">{pubDate}</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-black text-white leading-tight mb-5">
            {post.title}
          </h1>
          <p className="text-lg text-gray-400 leading-relaxed mb-6">{post.excerpt}</p>

          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm text-gray-600">By {post.author}</span>
            {post.tags.map((t) => (
              <span key={t} className="text-[10px] text-gray-500 bg-white/5 border border-white/8 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Tag size={9} /> {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── CONTENT ───────────────────────────────────────────────────────── */}
      <div className="bg-[#0A0A0A] py-14">
        <div className="container-site max-w-3xl">
          {/* Article body */}
          <article
            className="prose-bandit"
            dangerouslySetInnerHTML={{ __html: htmlContent }}
          />

          {/* Tags */}
          <div className="mt-12 pt-8 border-t border-white/8 flex flex-wrap gap-2">
            {post.tags.map((t) => (
              <span key={t} className="text-xs text-gray-400 bg-white/5 border border-white/10 px-3 py-1 rounded-full">
                #{t}
              </span>
            ))}
          </div>

          {/* Service CTA */}
          <div className="mt-12 bg-[#111] border border-[#39FF14]/15 rounded-2xl p-8">
            <p className="text-2xl font-black text-white mb-2">Need baler service or wire?</p>
            <p className="text-gray-400 text-sm mb-5">
              Bandit covers the full Southeast US — Georgia, Florida, Alabama, South Carolina,
              North Carolina, and Tennessee. Same-day emergency service available.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/quote" className="btn-primary">Get a Free Quote</Link>
              <Link href="/wire" className="btn-ghost-green">Shop Bale Wire</Link>
              <a href="tel:+18574226348" className="btn-ghost-green">Call 857-422-6348</a>
            </div>
          </div>

          {/* Related Posts */}
          {related.length > 0 && (
            <div className="mt-14">
              <h2 className="text-xl font-black text-white mb-5">Related Articles</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {related.map((r) => (
                  <Link key={r.slug} href={`/blog/${r.slug}`} className="group block card-dark hover:border-[#39FF14]/20 transition-all">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider mb-2 inline-block ${catColor(r.category)}`}>
                      {r.category}
                    </span>
                    <h3 className="text-sm font-bold text-white group-hover:text-[#39FF14] transition-colors leading-snug mb-2">
                      {r.title}
                    </h3>
                    <p className="text-xs text-[#39FF14] flex items-center gap-1 group-hover:gap-1.5 transition-all">
                      Read article <ArrowRight size={11} />
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div className="mt-10">
            <Link href="/blog" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[#39FF14] transition-colors">
              <ArrowLeft size={14} /> All articles
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
