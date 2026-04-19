"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

/**
 * HeroMascot — decorative Pixar-style transparent PNG element.
 * Reads the asset URL from page_assets keyed by slug. Renders as a normal
 * inline <img> with whatever className the parent provides — letting each
 * page hero own the layout (typically a 2-column grid where the mascot
 * occupies the right column).
 *
 * Usage:
 *   <HeroMascot slug="services" className="w-full max-w-md mx-auto" />
 */
export default function HeroMascot({
  slug,
  className = "w-full max-w-md mx-auto",
}: {
  slug: string;
  className?: string;
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
    /* eslint-disable-next-line @next/next/no-img-element */
    <img
      src={url}
      alt=""
      className={`select-none drop-shadow-[0_0_40px_rgba(57,255,20,0.08)] ${className}`}
      loading="eager"
      aria-hidden="true"
    />
  );
}
