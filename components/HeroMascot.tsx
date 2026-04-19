"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

/**
 * HeroMascot — decorative Pixar-style element placed inside a page hero.
 * Reads the asset URL from page_assets keyed by slug. Positioned absolute
 * bottom-right of its containing relative ancestor (the page hero).
 *
 * Usage inside a hero <section className="relative ...">:
 *   <HeroMascot slug="services" />
 *
 * Rendering:
 *   - pointer-events-none so it never blocks CTAs
 *   - hidden below lg by default to avoid overlapping centered text on mobile
 *   - 420px wide on large screens, visually anchored bottom-right
 *   - client component because we need to work inside both server and client
 *     pages (e.g. /partners is a client component)
 */
export default function HeroMascot({
  slug,
  className = "",
  widthClass = "w-[260px] sm:w-[340px] lg:w-[420px]",
  hiddenBelow = "hidden lg:block",
}: {
  slug: string;
  className?: string;
  widthClass?: string;
  hiddenBelow?: string;
}) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    supabase
      .from("page_assets")
      .select("url")
      .eq("slug", slug)
      .single()
      .then(({ data }) => {
        if (!cancelled) setUrl(data?.url ?? null);
      });
    return () => { cancelled = true; };
  }, [slug]);

  if (!url) return null;

  return (
    <div
      className={`pointer-events-none absolute bottom-0 right-0 ${hiddenBelow} ${widthClass} ${className}`}
      aria-hidden="true"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={url}
        alt=""
        className="w-full h-auto select-none drop-shadow-[0_0_40px_rgba(57,255,20,0.08)]"
        loading="eager"
      />
    </div>
  );
}
