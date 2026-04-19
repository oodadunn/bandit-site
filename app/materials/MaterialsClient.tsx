"use client";

import { useState, useMemo, useEffect } from "react";
import { Search, X, BookOpen, Phone } from "lucide-react";
import { MATERIALS, CATEGORY_META, SUBCATEGORIES, type Material, type MaterialCategory } from "./data";

// ── AI-generated images stored in Supabase Storage (generated via Imagen 4). ──
const IMG = (f: string) =>
  `https://cerozvtggvwixeyqcgkz.supabase.co/storage/v1/object/public/site-images/${f}`;
const SUBCATEGORY_IMAGES: Record<string, string[]> = {
  "Corrugated":        [IMG("material-corrugated.png")],
  "Mixed Paper":       [IMG("material-mixed-paper.png")],
  "Office Paper":      [IMG("material-office-paper.png")],
  "Newsprint":         [IMG("material-newsprint.png")],
  "Magazines & Coated":[IMG("material-magazines.png")],
  "Premium Grades":    [IMG("material-premium-paper.png")],
  "PET #1":            [IMG("material-pet-plastic.png")],
  "HDPE #2":           [IMG("material-hdpe-plastic.png")],
  "LDPE #4":           [IMG("material-ldpe-film.png")],
  "PP #5":             ["https://picsum.photos/seed/pp-plastic-a/480/360"],
  "PVC #3":            ["https://picsum.photos/seed/pvc-plastic-a/480/360"],
  "PS #6":             ["https://picsum.photos/seed/ps-plastic-a/480/360"],
  "Mixed":             [IMG("material-mixed-plastic.png")],
  "Aluminum":          [IMG("material-aluminum.png")],
  "Copper":            [IMG("material-copper.png")],
  "Brass & Red Metals":[IMG("material-brass.png")],
  "Ferrous":           [IMG("material-ferrous.png")],
  "Lead":              ["https://picsum.photos/seed/lead-battery-a/480/360"],
  "Rubber":            ["https://picsum.photos/seed/rubber-tires-a/480/360"],
};

// Variable aspect ratio — makes masonry feel organic (Pinterest-y)
function aspectFor(id: string): string {
  const aspects = ["4/5", "3/4", "1/1", "4/3", "4/5", "3/4"];
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return aspects[h % aspects.length];
}

const VALUE_COLORS: Record<string, string> = {
  high: "text-[#39FF14]",
  medium: "text-yellow-400",
  low: "text-gray-400",
};

const DIFF_COLOR: Record<string, string> = {
  Easy: "text-[#39FF14]",
  Moderate: "text-yellow-400",
  Difficult: "text-red-400",
};

// ── Masonry tile: single material ─────────────────────────────────────
function MaterialTile({ mat, onOpen }: { mat: Material; onOpen: () => void }) {
  const img = mat.imageUrl || SUBCATEGORY_IMAGES[mat.subcategory]?.[0];
  const aspect = aspectFor(mat.id);
  const [failed, setFailed] = useState(false);

  return (
    <button onClick={onOpen} className="tile group block w-full text-left">
      <div
        className="relative w-full overflow-hidden"
        style={{ aspectRatio: aspect, background: "var(--bg-card-hi)" }}
      >
        {img && !failed ? (
          <img
            src={img}
            alt={mat.commonName}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.05]"
            onError={() => setFailed(true)}
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center text-4xl"
            style={{ background: `${mat.colorAccent}15` }}
          >
            {mat.icon}
          </div>
        )}

        {/* Corner ISRI badge */}
        <div
          className="absolute top-3 left-3 px-2 py-1 text-[9px] font-bold tracking-[0.2em] uppercase rounded-sm"
          style={{
            background: "rgba(0,0,0,0.7)",
            color: "var(--green-accent)",
            border: "1px solid var(--green-border)",
            fontFamily: "'JetBrains Mono', monospace",
            backdropFilter: "blur(4px)",
          }}
        >
          {mat.isriCode}
        </div>

        {/* Value tag bottom-right */}
        <div
          className={`absolute bottom-3 right-3 px-2 py-1 text-[10px] font-bold rounded-sm ${VALUE_COLORS[mat.valueTier]}`}
          style={{
            background: "rgba(0,0,0,0.7)",
            backdropFilter: "blur(4px)",
          }}
        >
          {mat.valueRange}
        </div>
      </div>

      <div className="tile-body">
        <div
          className="text-[9px] font-bold tracking-[0.28em] uppercase mb-2"
          style={{ color: "var(--green-accent)", fontFamily: "'JetBrains Mono', monospace" }}
        >
          ◢ {mat.subcategory}
        </div>
        <h3
          className="text-sm font-black uppercase tracking-[0.01em] leading-snug mb-1"
          style={{ color: "var(--text-primary)" }}
        >
          {mat.commonName}
        </h3>
        <p className="text-[11px] mb-2" style={{ color: "var(--text-tertiary)" }}>
          {mat.isriName}
        </p>
        <p className="text-xs leading-relaxed line-clamp-2" style={{ color: "var(--text-secondary)" }}>
          {mat.description}
        </p>
      </div>
    </button>
  );
}

// ── Detail modal — Pinterest pin detail takeover ──────────────────────
function MaterialDetail({ mat, onClose }: { mat: Material; onClose: () => void }) {
  const images: string[] = mat.imageUrl
    ? [mat.imageUrl, ...(SUBCATEGORY_IMAGES[mat.subcategory] ?? []).slice(0, 1)]
    : SUBCATEGORY_IMAGES[mat.subcategory] ?? [];

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto py-10 px-4"
      style={{ background: "rgba(0,0,0,0.82)", backdropFilter: "blur(8px)" }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-5xl rounded-3xl overflow-hidden my-auto"
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border-default)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full flex items-center justify-center transition-colors"
          style={{
            background: "rgba(0,0,0,0.6)",
            border: "1px solid var(--border-hi)",
            color: "var(--text-primary)",
            backdropFilter: "blur(8px)",
          }}
          aria-label="Close"
        >
          <X size={18} />
        </button>

        {/* Hero image band */}
        {images.length > 0 && (
          <div className="relative w-full grid grid-cols-1 sm:grid-cols-2 gap-1" style={{ background: "var(--bg-card-hi)" }}>
            {images.slice(0, 2).map((src, i) => (
              <div
                key={i}
                className="relative overflow-hidden"
                style={{ aspectRatio: "4/3", background: "var(--bg-card-hi)" }}
              >
                <img
                  src={src}
                  alt={`${mat.commonName} ${i + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.currentTarget.parentElement as HTMLElement).style.display = "none";
                  }}
                />
              </div>
            ))}
          </div>
        )}

        <div className="p-8 sm:p-12 space-y-10">
          {/* Header */}
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span
                className="px-3 py-1 text-[10px] font-bold tracking-[0.28em] uppercase rounded-sm"
                style={{
                  background: "var(--green-bg)",
                  color: "var(--green-accent)",
                  border: "1px solid var(--green-border)",
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              >
                {mat.isriCode}
              </span>
              {mat.balerRelevant && (
                <span
                  className="px-3 py-1 text-[10px] font-bold tracking-[0.28em] uppercase rounded-sm"
                  style={{
                    color: "var(--text-secondary)",
                    background: "var(--bg-card-hi)",
                    border: "1px solid var(--border-hi)",
                    fontFamily: "'JetBrains Mono', monospace",
                  }}
                >
                  🗜 Baler Required
                </span>
              )}
            </div>
            <h2
              className="font-black uppercase leading-[0.95] mb-3"
              style={{
                color: "var(--text-primary)",
                fontSize: "clamp(28px, 4.5vw, 52px)",
                letterSpacing: "0.005em",
              }}
            >
              {mat.commonName}
            </h2>
            <p className="text-sm mb-4" style={{ color: "var(--text-tertiary)" }}>
              {mat.isriName} · {mat.subcategory}
            </p>
            <p className="text-base leading-relaxed max-w-3xl" style={{ color: "var(--text-secondary)" }}>
              {mat.description}
            </p>
          </div>

          {/* Stat strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              {
                label: "Value Range",
                val: mat.valueRange,
                color:
                  mat.valueTier === "high"
                    ? "var(--green-accent)"
                    : mat.valueTier === "medium"
                    ? "#CA8A04"
                    : "var(--text-tertiary)",
              },
              {
                label: "Recyclability",
                val: mat.recyclability,
                color: mat.recyclability === "High" ? "var(--green-accent)" : mat.recyclability === "Medium" ? "#CA8A04" : "#DC2626",
              },
              {
                label: "Processing",
                val: mat.processingDifficulty,
                color: mat.processingDifficulty === "Easy" ? "var(--green-accent)" : mat.processingDifficulty === "Moderate" ? "#CA8A04" : "#DC2626",
              },
              {
                label: "Baler",
                val: mat.balerRelevant
                  ? mat.balerType === "both"
                    ? "Vertical / Horiz"
                    : mat.balerType === "vertical"
                    ? "Vertical"
                    : mat.balerType === "horizontal"
                    ? "Horizontal"
                    : "Yes"
                  : "Not Required",
                color: mat.balerRelevant ? "var(--green-accent)" : "var(--text-tertiary)",
              },
            ].map((s) => (
              <div
                key={s.label}
                className="rounded-xl p-4"
                style={{
                  background: "var(--bg-secondary)",
                  border: "1px solid var(--border-default)",
                }}
              >
                <div
                  className="text-[9px] font-bold tracking-[0.3em] uppercase mb-2"
                  style={{ color: "var(--text-tertiary)", fontFamily: "'JetBrains Mono', monospace" }}
                >
                  ◢ {s.label}
                </div>
                <div
                  className="text-base font-black uppercase tracking-[0.01em]"
                  style={{ color: s.color }}
                >
                  {s.val}
                </div>
              </div>
            ))}
          </div>

          {/* ISRI Spec */}
          <div>
            <div
              className="text-[10px] font-bold tracking-[0.3em] uppercase mb-3"
              style={{ color: "var(--green-accent)", fontFamily: "'JetBrains Mono', monospace" }}
            >
              ◢ ISRI Specification
            </div>
            <p
              className="text-sm leading-relaxed rounded-xl p-5"
              style={{
                background: "var(--bg-secondary)",
                border: "1px solid var(--border-default)",
                color: "var(--text-secondary)",
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              {mat.isriSpec}
            </p>
          </div>

          {/* Aliases */}
          {mat.aliases.length > 0 && (
            <div>
              <div
                className="text-[10px] font-bold tracking-[0.3em] uppercase mb-3"
                style={{ color: "var(--green-accent)", fontFamily: "'JetBrains Mono', monospace" }}
              >
                ◢ Also Known As
              </div>
              <div className="flex flex-wrap gap-2">
                {mat.aliases.map((a) => (
                  <span
                    key={a}
                    className="chip"
                    style={{ cursor: "default", pointerEvents: "none" }}
                  >
                    {a}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Sources / Buyers / End Uses */}
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { label: "Common Sources", items: mat.commonSources },
              { label: "End Buyers", items: mat.endBuyers },
              { label: "Becomes", items: mat.endUses },
            ].map((col) => (
              <div key={col.label}>
                <div
                  className="text-[10px] font-bold tracking-[0.3em] uppercase mb-3"
                  style={{ color: "var(--green-accent)", fontFamily: "'JetBrains Mono', monospace" }}
                >
                  ◢ {col.label}
                </div>
                <ul className="space-y-2">
                  {col.items.map((it) => (
                    <li
                      key={it}
                      className="text-xs flex items-start gap-2 leading-relaxed"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      <span style={{ color: "var(--green-accent)", marginTop: 2 }}>›</span>
                      {it}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Kevin's Call Notes */}
          <div
            className="rounded-2xl p-6"
            style={{
              background: "var(--green-bg)",
              border: "1px solid var(--green-border)",
            }}
          >
            <div className="flex items-center gap-2 mb-3">
              <Phone size={13} style={{ color: "var(--green-accent)" }} />
              <span
                className="text-[10px] font-bold tracking-[0.3em] uppercase"
                style={{ color: "var(--green-accent)", fontFamily: "'JetBrains Mono', monospace" }}
              >
                ◢ Kevin&apos;s Call Notes
              </span>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: "var(--text-primary)" }}>
              {mat.kevinNotes}
            </p>
          </div>

          {/* Baler callout */}
          {mat.balerRelevant && (
            <div
              className="rounded-2xl p-6 flex items-start gap-4"
              style={{
                background: "var(--bg-secondary)",
                border: "1px solid var(--border-default)",
              }}
            >
              <span className="text-3xl leading-none">🗜</span>
              <div>
                <p
                  className="text-sm font-black uppercase tracking-[0.05em] mb-2"
                  style={{ color: "var(--text-primary)" }}
                >
                  Baler Recommended
                </p>
                <p className="text-xs leading-relaxed mb-3" style={{ color: "var(--text-secondary)" }}>
                  {mat.balerType === "vertical" && "A vertical baler is the standard choice for this material. Compact footprint, good for mid-volume generators."}
                  {mat.balerType === "horizontal" && "A horizontal auto-tie baler is ideal for high-volume operations handling this material."}
                  {mat.balerType === "both" && "Both vertical and horizontal balers work for this material. Vertical balers suit retail and mid-volume; horizontal auto-tie for high-volume distribution and manufacturing."}
                </p>
                <a
                  href="/wire"
                  className="text-[10px] font-bold tracking-[0.22em] uppercase"
                  style={{ color: "var(--green-accent)" }}
                >
                  Need Bale Wire? → Shop Wire Supply
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function MaterialsClient() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<MaterialCategory | "all">("all");
  const [activeSubcategory, setActiveSubcategory] = useState<string | null>(null);
  const [openMatId, setOpenMatId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return MATERIALS.filter((m) => {
      if (activeCategory !== "all" && m.category !== activeCategory) return false;
      if (activeSubcategory && m.subcategory !== activeSubcategory) return false;
      if (!q) return true;
      return (
        m.commonName.toLowerCase().includes(q) ||
        m.isriCode.toLowerCase().includes(q) ||
        m.isriName.toLowerCase().includes(q) ||
        m.aliases.some((a) => a.toLowerCase().includes(q)) ||
        m.description.toLowerCase().includes(q) ||
        m.subcategory.toLowerCase().includes(q)
      );
    });
  }, [search, activeCategory, activeSubcategory]);

  const subcategoriesForActive =
    activeCategory !== "all" ? SUBCATEGORIES[activeCategory] : [];

  const openMat = openMatId ? MATERIALS.find((m) => m.id === openMatId) ?? null : null;

  return (
    <div>
      {/* ── STICKY SEARCH + FILTER BAR ────────────────────────────── */}
      <div
        className="sticky top-16 z-30 backdrop-blur-md"
        style={{
          background: "rgba(0,0,0,0.72)",
          borderBottom: "1px solid var(--border-default)",
        }}
      >
        <div className="container-site py-5">
          {/* Search */}
          <div className="relative mb-5">
            <Search
              size={14}
              className="absolute left-5 top-1/2 -translate-y-1/2"
              style={{ color: "var(--text-tertiary)" }}
            />
            <input
              type="text"
              placeholder="Search materials, ISRI codes, or aliases (OCC, Barley, milk jugs…)"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-full pl-12 pr-12 py-3.5 text-sm focus:outline-none transition-colors"
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border-default)",
                color: "var(--text-primary)",
              }}
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-5 top-1/2 -translate-y-1/2 transition-colors"
                style={{ color: "var(--text-tertiary)" }}
                aria-label="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Category chips */}
          <div className="flex items-center gap-2 flex-wrap">
            {(["all", "fiber", "plastic", "metal"] as const).map((cat) => {
              const count =
                cat === "all" ? MATERIALS.length : MATERIALS.filter((m) => m.category === cat).length;
              const on = activeCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => {
                    setActiveCategory(cat);
                    setActiveSubcategory(null);
                  }}
                  className={`chip ${on ? "chip-on" : ""}`}
                >
                  {cat === "all" ? `All · ${count}` : `${CATEGORY_META[cat].icon} ${CATEGORY_META[cat].label} · ${count}`}
                </button>
              );
            })}

            {subcategoriesForActive.length > 0 && (
              <div
                className="flex items-center gap-2 ml-3 pl-3 flex-wrap"
                style={{ borderLeft: "1px solid var(--border-default)" }}
              >
                {subcategoriesForActive.map((sub) => {
                  const on = activeSubcategory === sub;
                  return (
                    <button
                      key={sub}
                      onClick={() => setActiveSubcategory(on ? null : sub)}
                      className={`chip ${on ? "chip-on" : ""}`}
                      style={{ fontSize: 9, padding: "8px 14px" }}
                    >
                      {sub}
                    </button>
                  );
                })}
              </div>
            )}

            <div
              className="ml-auto text-[10px] font-bold tracking-[0.22em] uppercase"
              style={{ color: "var(--text-tertiary)", fontFamily: "'JetBrains Mono', monospace" }}
            >
              {filtered.length} material{filtered.length !== 1 ? "s" : ""}
            </div>
          </div>
        </div>
      </div>

      {/* ── MASONRY BOARD ─────────────────────────────────────────── */}
      <div className="container-site py-12">
        {filtered.length === 0 ? (
          <div className="text-center py-32">
            <p className="text-lg mb-2" style={{ color: "var(--text-secondary)" }}>
              No materials match &ldquo;{search}&rdquo;
            </p>
            <p className="text-sm mb-5" style={{ color: "var(--text-muted)" }}>
              Try an ISRI code, common name, or alias
            </p>
            <button
              onClick={() => {
                setSearch("");
                setActiveCategory("all");
                setActiveSubcategory(null);
              }}
              className="btn-secondary"
            >
              Clear Filters
            </button>
          </div>
        ) : activeCategory === "all" || activeSubcategory ? (
          <div className="masonry">
            {filtered.map((mat) => (
              <MaterialTile key={mat.id} mat={mat} onOpen={() => setOpenMatId(mat.id)} />
            ))}
          </div>
        ) : (
          <div className="space-y-16">
            {subcategoriesForActive
              .filter((sub) => filtered.some((m) => m.subcategory === sub))
              .map((sub) => (
                <div key={sub}>
                  <div className="flex items-center gap-4 mb-6">
                    <div
                      className="text-[10px] font-bold tracking-[0.3em] uppercase"
                      style={{ color: "var(--green-accent)", fontFamily: "'JetBrains Mono', monospace" }}
                    >
                      ◢ {sub}
                    </div>
                    <div
                      className="h-px flex-1"
                      style={{ background: "var(--border-default)" }}
                    />
                    <span
                      className="text-[10px] font-bold tracking-[0.22em] uppercase"
                      style={{ color: "var(--text-tertiary)", fontFamily: "'JetBrains Mono', monospace" }}
                    >
                      {filtered.filter((m) => m.subcategory === sub).length} grades
                    </span>
                  </div>
                  <div className="masonry">
                    {filtered
                      .filter((m) => m.subcategory === sub)
                      .map((mat) => (
                        <MaterialTile key={mat.id} mat={mat} onOpen={() => setOpenMatId(mat.id)} />
                      ))}
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* ── GLOSSARY ──────────────────────────────────────────────── */}
      <div
        className="border-t"
        style={{
          background: "var(--bg-secondary)",
          borderColor: "var(--border-default)",
        }}
      >
        <div className="container-site py-24">
          <div className="flex items-center gap-3 mb-10">
            <BookOpen size={18} style={{ color: "var(--green-accent)" }} />
            <div
              className="text-[10px] font-bold tracking-[0.3em] uppercase"
              style={{ color: "var(--green-accent)", fontFamily: "'JetBrains Mono', monospace" }}
            >
              ◢ Industry Glossary
            </div>
          </div>
          <h2 className="section-heading mb-10" style={{ color: "var(--text-primary)" }}>
            The Vocabulary
            <br />
            <span style={{ color: "var(--green-accent)" }}>Of Scrap.</span>
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { term: "ISRI / ReMA", def: "Institute of Scrap Recycling Industries (now Recycled Materials Association). Sets the standard commodity grades used industrywide." },
              { term: "OCC", def: "Old Corrugated Containers. Used cardboard boxes — the world's most traded paper grade by volume." },
              { term: "Prohibitives", def: "Materials that make an entire load unacceptable — hazardous, non-recyclable, or process-damaging content. Typically limited to <1% of a load." },
              { term: "Outthrows", def: "Materials in a bale that don't meet grade specs but are recyclable. Usually limited to 2–5% of a load." },
              { term: "Bale Wire", def: "Steel wire used to bind compressed bales for storage and transport. Auto-tie box wire for horizontal balers; single-loop ties for vertical balers." },
              { term: "MRF", def: "Material Recovery Facility. Plant that receives, sorts, and prepares commingled recyclables from curbside collection." },
              { term: "UBC", def: "Used Beverage Containers. Aluminum cans collected post-consumer. One of the most valuable and widely recycled materials." },
              { term: "HMS", def: "Heavy Melting Steel/Scrap. Ferrous steel grades categorized by thickness — HMS #1 (¼\" and over) and HMS #2 (lighter gauge)." },
              { term: "Bare Bright", def: "The highest copper grade — clean, stripped, un-tinned copper wire with no oxidation. Commands top market price." },
              { term: "RIC", def: "Resin Identification Code. The #1–7 numbering system on plastic containers identifying the resin type." },
              { term: "Ferrous", def: "Metals containing iron. Magnetic — can be separated with magnets. Includes steel and cast iron." },
              { term: "Non-Ferrous", def: "Metals without iron. Not magnetic. Includes aluminum, copper, brass, lead, zinc, and stainless steel." },
              { term: "Recovery Basis", def: "How insulated wire and some grades are priced — based on the percentage of recovered metal after processing." },
              { term: "Zorba", def: "Mixed shredded non-ferrous material from auto shredding, predominantly aluminum. Pre-cursor to Twitch grade." },
              { term: "Deinking", def: "Process of removing inks from recovered paper before it's pulped for reuse. Affects quality of recovered fiber." },
              { term: "Bale Density", def: "Weight per cubic foot of a finished bale. Higher density = lower transport cost per ton. Critical for OCC and cardboard economics." },
            ].map(({ term, def }) => (
              <div
                key={term}
                className="rounded-xl p-5"
                style={{
                  background: "var(--bg-card)",
                  border: "1px solid var(--border-default)",
                }}
              >
                <dt
                  className="text-[10px] font-bold tracking-[0.28em] uppercase mb-2"
                  style={{ color: "var(--green-accent)", fontFamily: "'JetBrains Mono', monospace" }}
                >
                  ◢ {term}
                </dt>
                <dd className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                  {def}
                </dd>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── DETAIL MODAL (Pinterest pin) ──────────────────────────── */}
      {openMat && <MaterialDetail mat={openMat} onClose={() => setOpenMatId(null)} />}
    </div>
  );
}
