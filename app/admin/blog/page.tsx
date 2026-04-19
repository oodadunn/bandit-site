"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ImageIcon, RefreshCw, Loader2, CheckCircle2, AlertCircle, Wand2 } from "lucide-react";

interface Post {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  status: string;
  image_url: string | null;
  published_at: string | null;
}

interface PageAsset {
  slug: string;
  display_name: string;
  prompt: string;
  url: string | null;
  updated_at: string | null;
}

export default function AdminBlogPage() {
  const router = useRouter();
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [assets, setAssets] = useState<PageAsset[]>([]);
  const [busy, setBusy] = useState<Record<string, boolean>>({});
  const [results, setResults] = useState<Record<string, { ok: boolean; msg: string }>>({});
  const [assetBusy, setAssetBusy] = useState<Record<string, boolean>>({});
  const [assetResults, setAssetResults] = useState<Record<string, { ok: boolean; msg: string }>>({});
  const [bootstrapBusy, setBootstrapBusy] = useState(false);
  const [bootstrapResult, setBootstrapResult] = useState<{ ok: boolean; msg: string } | null>(null);

  // Auth check (mirrors /admin/dashboard pattern)
  useEffect(() => {
    fetch("/api/admin/auth")
      .then((r) => setAuthed(r.ok))
      .catch(() => setAuthed(false));
  }, []);

  useEffect(() => {
    if (authed !== true) return;
    fetch("/api/admin/blog-posts")
      .then((r) => r.json())
      .then((d) => setPosts(d.posts ?? []))
      .catch(() => setPosts([]));
    fetch("/api/admin/page-assets")
      .then((r) => r.json())
      .then((d) => setAssets(d.assets ?? []))
      .catch(() => setAssets([]));
  }, [authed]);

  const generateAsset = async (slug: string) => {
    setAssetBusy((b) => ({ ...b, [slug]: true }));
    setAssetResults((r) => { const n = { ...r }; delete n[slug]; return n; });
    try {
      const r = await fetch("/api/admin/generate-header-asset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug }),
      });
      const d = await r.json();
      if (d.ok) {
        setAssetResults((res) => ({ ...res, [slug]: { ok: true, msg: "Generated" } }));
        setAssets((list) => list.map((a) => a.slug === slug ? { ...a, url: d.url, updated_at: new Date().toISOString() } : a));
      } else {
        setAssetResults((res) => ({ ...res, [slug]: { ok: false, msg: d.error ?? "Failed" } }));
      }
    } catch (e: any) {
      setAssetResults((res) => ({ ...res, [slug]: { ok: false, msg: e.message } }));
    } finally {
      setAssetBusy((b) => ({ ...b, [slug]: false }));
    }
  };

  if (authed === null) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center text-gray-400">
        Loading…
      </div>
    );
  }
  if (authed === false) {
    if (typeof window !== "undefined") router.replace("/admin");
    return null;
  }

  const generate = async (postId: string, regen: boolean) => {
    setBusy((b) => ({ ...b, [postId]: true }));
    setResults((r) => {
      const next = { ...r };
      delete next[postId];
      return next;
    });

    try {
      const r = await fetch("/api/admin/generate-post-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId, trigger: "manual" }),
      });
      const d = await r.json();
      if (d.ok) {
        setResults((res) => ({ ...res, [postId]: { ok: true, msg: regen ? "Regenerated" : "Generated" } }));
        setPosts((ps) => ps.map((p) => (p.id === postId ? { ...p, image_url: d.imageUrl } : p)));
      } else {
        setResults((res) => ({ ...res, [postId]: { ok: false, msg: d.error ?? "Failed" } }));
      }
    } catch (e: any) {
      setResults((res) => ({ ...res, [postId]: { ok: false, msg: e.message } }));
    } finally {
      setBusy((b) => ({ ...b, [postId]: false }));
    }
  };

  const bootstrap = async () => {
    setBootstrapBusy(true);
    setBootstrapResult(null);
    try {
      const r = await fetch("/api/admin/bootstrap-references", { method: "POST" });
      const d = await r.json();
      if (d.ok) {
        setBootstrapResult({ ok: true, msg: "References uploaded to Supabase Storage" });
      } else {
        setBootstrapResult({ ok: false, msg: d.error ?? "Failed" });
      }
    } catch (e: any) {
      setBootstrapResult({ ok: false, msg: e.message });
    } finally {
      setBootstrapBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-10">
        <Link href="/admin/dashboard" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-[#39FF14] mb-6">
          <ArrowLeft size={14} /> Back to dashboard
        </Link>

        <div className="flex items-start justify-between flex-wrap gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black">Blog Image Pipeline</h1>
            <p className="text-gray-400 mt-1 text-sm max-w-2xl">
              Generate Pixar-style hero images for blog posts via Gemini 2.5 Flash Image. The
              same image is used for the post hero AND the thumbnail. References (mascot + baler) are attached
              to every call for character consistency.
            </p>
          </div>

          <div className="flex flex-col items-end gap-2">
            <button
              onClick={bootstrap}
              disabled={bootstrapBusy}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-[#39FF14]/30 text-[#39FF14] text-sm font-bold hover:bg-[#39FF14]/10 disabled:opacity-50"
            >
              {bootstrapBusy ? <Loader2 size={14} className="animate-spin" /> : <Wand2 size={14} />}
              Bootstrap brand references
            </button>
            {bootstrapResult && (
              <p className={`text-xs ${bootstrapResult.ok ? "text-[#39FF14]" : "text-red-400"}`}>
                {bootstrapResult.msg}
              </p>
            )}
          </div>
        </div>

        {/* ── PAGE HEADER ASSETS ──────────────────────────────────────── */}
        {assets.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold">Page Header Art</h2>
              <span className="text-[10px] text-gray-600 uppercase tracking-wider">
                Transparent 1:1 PNGs · used as decorative element on each menu page
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {assets.map((a) => {
                const r = assetResults[a.slug];
                const isBusy = assetBusy[a.slug];
                return (
                  <div key={a.slug} className="card-dark p-3 flex flex-col">
                    <div
                      className="w-full aspect-square rounded bg-[#111] bg-contain bg-center bg-no-repeat mb-2 flex items-center justify-center text-gray-700"
                      style={a.url ? { backgroundImage: `url(${a.url})` } : undefined}
                    >
                      {!a.url && <ImageIcon size={20} />}
                    </div>
                    <p className="text-xs font-bold text-white mb-2">{a.display_name}</p>
                    <button
                      onClick={() => generateAsset(a.slug)}
                      disabled={isBusy}
                      className="inline-flex items-center justify-center gap-1.5 px-2 py-1.5 rounded text-[11px] font-bold bg-[#39FF14] text-black hover:bg-[#39FF14]/90 disabled:opacity-50"
                    >
                      {isBusy ? (
                        <><Loader2 size={11} className="animate-spin" /> Generating…</>
                      ) : a.url ? (
                        <><RefreshCw size={11} /> Regenerate</>
                      ) : (
                        <><Wand2 size={11} /> Generate</>
                      )}
                    </button>
                    {r && (
                      <p className={`text-[10px] mt-1 flex items-center gap-1 ${r.ok ? "text-[#39FF14]" : "text-red-400"}`}>
                        {r.ok ? <CheckCircle2 size={10} /> : <AlertCircle size={10} />}
                        {r.msg}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <h2 className="text-lg font-bold mb-3">Blog Posts</h2>
        {posts.length === 0 ? (
          <div className="card-dark p-12 text-center text-gray-500">No posts found.</div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {posts.map((p) => {
              const r = results[p.id];
              const isBusy = busy[p.id];
              return (
                <div key={p.id} className="card-dark p-4 flex gap-4 items-stretch min-w-0 overflow-hidden">
                  {/* Thumbnail */}
                  <div
                    className="w-32 h-20 shrink-0 rounded bg-[#111] bg-cover bg-center flex items-center justify-center text-gray-700"
                    style={p.image_url ? { backgroundImage: `url(${p.image_url})` } : undefined}
                  >
                    {!p.image_url && <ImageIcon size={20} />}
                  </div>

                  {/* Meta */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                        {p.category}
                      </span>
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          p.status === "published"
                            ? "bg-[#39FF14]/10 text-[#39FF14]"
                            : "bg-yellow-500/10 text-yellow-400"
                        }`}
                      >
                        {p.status}
                      </span>
                    </div>
                    <h3 className="font-bold text-white truncate">{p.title}</h3>
                    <p className="text-xs text-gray-500 truncate">{p.excerpt}</p>
                  </div>

                  {/* Action */}
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <button
                      onClick={() => generate(p.id, !!p.image_url)}
                      disabled={isBusy}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#39FF14] text-black text-sm font-bold hover:bg-[#39FF14]/90 disabled:opacity-50"
                    >
                      {isBusy ? (
                        <>
                          <Loader2 size={14} className="animate-spin" />
                          Generating…
                        </>
                      ) : p.image_url ? (
                        <>
                          <RefreshCw size={14} />
                          Regenerate
                        </>
                      ) : (
                        <>
                          <Wand2 size={14} />
                          Generate
                        </>
                      )}
                    </button>
                    {r && (
                      <p
                        className={`text-[11px] flex items-center gap-1 ${
                          r.ok ? "text-[#39FF14]" : "text-red-400"
                        }`}
                      >
                        {r.ok ? <CheckCircle2 size={11} /> : <AlertCircle size={11} />}
                        {r.msg}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <p className="text-xs text-gray-600 mt-8">
          Budget: 30 generations/day, 500/month. Kill switch: <code>image_gen_config.enabled</code> in Supabase.
        </p>
      </div>
    </div>
  );
}
