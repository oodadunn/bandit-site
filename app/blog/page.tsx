import type { Metadata } from "next";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Clock, Tag, ArrowRight, Rss } from "lucide-react";

export const metadata: Metadata = {
  title: "Blog — Baler Tips, Recycling Industry News | Bandit Recycling",
  description:
    "Baler maintenance guides, recycling industry tips, wire selection help, and nationwide recycling news from the Bandit Recycling team.",
  keywords: [
    "baler maintenance tips", "recycling industry news", "bale wire guide",
    "baler repair tips", "OCC recycling", "nationwide recycling",
    "baler troubleshooting", "recycling operations",
  ],
};

const CATEGORY_COLORS: Record<string, string> = {
  "Industry Tips":       "text-[#39FF14] bg-[#39FF14]/10 border-[#39FF14]/20",
  "Maintenance":         "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
  "Recycling Education": "text-blue-400 bg-blue-500/10 border-blue-500/20",
  "Equipment":           "text-purple-400 bg-purple-500/10 border-purple-500/20",
  "News":                "text-orange-400 bg-orange-500/10 border-orange-500/20",
};

function categoryColor(cat: string) {
  return CATEGORY_COLORS[cat] ?? "text-gray-400 bg-white/5 border-white/10";
}

// Returns the post's Gemini-generated image_url, or empty string if none yet
// (rendered as a dark placeholder by the parent JSX).
function postImage(post: Post): string {
  return post.image_url || "";
}

interface Post {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  tags: string[];
  read_time: number;
  featured: boolean;
  published_at: string;
  author: string;
  image_url?: string;
}

async function getPosts(): Promise<Post[]> {
  try {
    const { data, error } = await supabase
      .from("blog_posts")
      .select("id,slug,title,excerpt,category,tags,read_time,featured,published_at,author,image_url")
      .eq("status", "published")
      .order("published_at", { ascending: false });
    if (error) throw error;
    return (data as Post[]) ?? [];
  } catch {
    return [];
  }
}

export const revalidate = 300;

export default async function BlogPage() {
  const posts = await getPosts();
  const featured = posts.find((p) => p.featured);
  const rest = posts.filter((p) => !p.featured || p.id !== featured?.id);

  return (
    <>
      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <section className="relative bg-[#0A0A0A] overflow-hidden pt-24 pb-14">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(#39FF14 1px, transparent 1px), linear-gradient(90deg, #39FF14 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
        <div className="container-site relative">
          <div className="badge-green mb-4 flex items-center gap-2 w-fit">
            <Rss size={13} /> Industry Insights
          </div>
          <h1 className="text-5xl sm:text-6xl font-black text-white leading-none tracking-tight mb-4">
            The Bandit{" "}
            <span className="text-[#39FF14]">Blog</span>
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl leading-relaxed">
            Baler maintenance tips, wire selection guides, recycling commodity education,
            and operational advice for recycling operations nationwide.
          </p>
        </div>
      </section>

      <div className="bg-[#0A0A0A] min-h-screen pb-20">
        <div className="container-site">

          {posts.length === 0 ? (
            <div className="text-center py-24">
              <p className="text-4xl mb-4">🦝</p>
              <p className="text-gray-400">Posts coming soon — check back shortly.</p>
            </div>
          ) : (
            <>
              {/* ── FEATURED POST ─────────────────────────────────────────── */}
              {featured && (
                <div className="mb-12 pt-10">
                  <p className="text-xs font-bold text-gray-600 uppercase tracking-widest mb-4">Featured</p>
                  <Link href={`/blog/${featured.slug}`} className="group block">
                    <div className="card-dark hover:border-[#39FF14]/30 transition-all overflow-hidden p-0">
                      {/* Cover image */}
                      <div
                        className="w-full h-56 sm:h-72 bg-cover bg-center bg-[#111] flex items-center justify-center"
                        style={postImage(featured) ? { backgroundImage: `url(${postImage(featured)})` } : undefined}
                      >
                        {!postImage(featured) && <span className="text-4xl opacity-30">🦝</span>}
                      </div>
                      <div className="p-8">
                        <div className="flex flex-wrap items-center gap-3 mb-4">
                          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border uppercase tracking-wider ${categoryColor(featured.category)}`}>
                            {featured.category}
                          </span>
                          <span className="text-xs text-gray-600 flex items-center gap-1">
                            <Clock size={11} /> {featured.read_time} min read
                          </span>
                          <span className="text-xs text-gray-600">
                            {new Date(featured.published_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                          </span>
                        </div>
                        <h2 className="text-3xl font-black text-white mb-3 group-hover:text-[#39FF14] transition-colors leading-tight">
                          {featured.title}
                        </h2>
                        <p className="text-gray-400 leading-relaxed mb-5 max-w-3xl">{featured.excerpt}</p>
                        <div className="flex flex-wrap items-center justify-between gap-4">
                          <div className="flex flex-wrap gap-1.5">
                            {featured.tags.slice(0, 4).map((t) => (
                              <span key={t} className="text-[10px] text-gray-500 bg-white/5 px-2 py-0.5 rounded-full border border-white/8">
                                {t}
                              </span>
                            ))}
                          </div>
                          <span className="text-sm font-bold text-[#39FF14] flex items-center gap-1 group-hover:gap-2 transition-all">
                            Read article <ArrowRight size={14} />
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              )}

              {/* ── POST GRID ─────────────────────────────────────────────── */}
              {rest.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-gray-600 uppercase tracking-widest mb-5">
                    {featured ? "More Articles" : "All Articles"}
                  </p>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {rest.map((post) => (
                      <Link key={post.id} href={`/blog/${post.slug}`} className="group block">
                        <div className="card-dark h-full hover:border-[#39FF14]/20 transition-all flex flex-col overflow-hidden p-0">
                          {/* Thumbnail — same image as the post hero, just scaled */}
                          <div
                            className="w-full h-44 bg-cover bg-center bg-[#111] shrink-0 flex items-center justify-center"
                            style={postImage(post) ? { backgroundImage: `url(${postImage(post)})` } : undefined}
                          >
                            {!postImage(post) && <span className="text-3xl opacity-30">🦝</span>}
                          </div>
                          <div className="p-5 flex flex-col flex-1">
                            <div className="flex flex-wrap items-center gap-2 mb-3">
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${categoryColor(post.category)}`}>
                                {post.category}
                              </span>
                              <span className="text-[10px] text-gray-600 flex items-center gap-1">
                                <Clock size={10} /> {post.read_time} min
                              </span>
                            </div>
                            <h3 className="text-lg font-bold text-white mb-2 group-hover:text-[#39FF14] transition-colors leading-snug flex-1">
                              {post.title}
                            </h3>
                            <p className="text-sm text-gray-400 leading-relaxed mb-4 line-clamp-3">{post.excerpt}</p>
                            <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/8">
                              <span className="text-[10px] text-gray-600">
                                {new Date(post.published_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                              </span>
                              <span className="text-xs font-semibold text-[#39FF14] flex items-center gap-1 group-hover:gap-1.5 transition-all">
                                Read <ArrowRight size={12} />
                              </span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* ── BOTTOM CTA ────────────────────────────────────────────────── */}
          <div className="mt-20 bg-[#111] border border-white/8 rounded-2xl p-10 text-center">
            <p className="text-3xl mb-3">🦝</p>
            <h2 className="text-2xl font-black text-white mb-2">Need baler service or wire today?</h2>
            <p className="text-gray-400 text-sm mb-6 max-w-md mx-auto">
              We cover all 50 states. 24/7 emergency service available.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link href="/quote" className="btn-primary">Get a Service Quote</Link>
              <Link href="/wire" className="btn-ghost-green">Shop Bale Wire</Link>
              <a href="tel:+18574226348" className="btn-ghost-green">Call 857-422-6348</a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
