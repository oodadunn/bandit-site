"use client";

import { useState, useMemo } from "react";
import { Search, ChevronDown, ChevronUp, X, BookOpen, Phone } from "lucide-react";
import { MATERIALS, CATEGORY_META, SUBCATEGORIES, type Material, type MaterialCategory } from "./data";

// Keyword-based Unsplash source URLs — each entry returns a photo matching
// those exact search terms, so corrugated shows cardboard, copper shows wire, etc.
const SUBCATEGORY_IMAGES: Record<string, string[]> = {
  "Corrugated": [
    "https://source.unsplash.com/480x360/?corrugated+cardboard+boxes",
    "https://source.unsplash.com/480x360/?cardboard+bales+recycling+warehouse",
  ],
  "Mixed Paper": [
    "https://source.unsplash.com/480x360/?mixed+paper+recycling+pile",
    "https://source.unsplash.com/480x360/?paper+waste+sorting+recycling",
  ],
  "Office Paper": [
    "https://source.unsplash.com/480x360/?office+paper+white+stack",
    "https://source.unsplash.com/480x360/?paper+documents+office+white",
  ],
  "Newsprint": [
    "https://source.unsplash.com/480x360/?newspaper+stack+pile+print",
    "https://source.unsplash.com/480x360/?old+newspapers+recycling+pile",
  ],
  "Magazines & Coated": [
    "https://source.unsplash.com/480x360/?magazines+colorful+glossy+pile",
    "https://source.unsplash.com/480x360/?glossy+magazine+stack+reading",
  ],
  "Premium Grades": [
    "https://source.unsplash.com/480x360/?clean+white+copy+paper+office",
    "https://source.unsplash.com/480x360/?premium+white+paper+printing",
  ],
  "PET #1": [
    "https://source.unsplash.com/480x360/?plastic+bottles+recycling+clear+PET",
    "https://source.unsplash.com/480x360/?crushed+plastic+bottles+waste",
  ],
  "HDPE #2": [
    "https://source.unsplash.com/480x360/?milk+jug+plastic+container+HDPE",
    "https://source.unsplash.com/480x360/?plastic+bottles+jugs+containers",
  ],
  "LDPE #4": [
    "https://source.unsplash.com/480x360/?plastic+bags+film+wrap+LDPE",
    "https://source.unsplash.com/480x360/?plastic+film+stretch+wrap+roll",
  ],
  "PP #5": [
    "https://source.unsplash.com/480x360/?plastic+food+containers+polypropylene",
    "https://source.unsplash.com/480x360/?plastic+yogurt+container+cap+PP",
  ],
  "PVC #3": [
    "https://source.unsplash.com/480x360/?PVC+pipe+plumbing+plastic",
    "https://source.unsplash.com/480x360/?vinyl+siding+pipe+material",
  ],
  "PS #6": [
    "https://source.unsplash.com/480x360/?styrofoam+foam+cups+polystyrene",
    "https://source.unsplash.com/480x360/?foam+packaging+peanuts+box",
  ],
  "Mixed": [
    "https://source.unsplash.com/480x360/?mixed+plastic+waste+sorting",
    "https://source.unsplash.com/480x360/?plastic+recycling+facility+bins",
  ],
  "Aluminum": [
    "https://source.unsplash.com/480x360/?aluminum+cans+crushed+recycling",
    "https://source.unsplash.com/480x360/?aluminium+scrap+metal+bales",
  ],
  "Copper": [
    "https://source.unsplash.com/480x360/?copper+wire+scrap+electrical",
    "https://source.unsplash.com/480x360/?copper+pipes+fittings+plumbing",
  ],
  "Brass & Red Metals": [
    "https://source.unsplash.com/480x360/?brass+fittings+valves+metal",
    "https://source.unsplash.com/480x360/?bronze+brass+copper+alloy+scrap",
  ],
  "Ferrous": [
    "https://source.unsplash.com/480x360/?steel+scrap+metal+pile+industrial",
    "https://source.unsplash.com/480x360/?iron+scrap+metal+recycling+yard",
  ],
  "Lead": [
    "https://source.unsplash.com/480x360/?lead+acid+battery+car+recycling",
    "https://source.unsplash.com/480x360/?old+batteries+automotive+scrap",
  ],
  "Rubber": [
    "https://source.unsplash.com/480x360/?rubber+tires+pile+scrap+used",
    "https://source.unsplash.com/480x360/?used+tires+rubber+recycling+stack",
  ],
};

const VALUE_COLORS: Record<string, string> = {
  high: "text-[#39FF14]",
  medium: "text-yellow-400",
  low: "text-gray-400",
};

const VALUE_BG: Record<string, string> = {
  high: "bg-[#39FF14]/10 border-[#39FF14]/30",
  medium: "bg-yellow-400/10 border-yellow-400/30",
  low: "bg-gray-400/10 border-gray-400/30",
};

const DIFF_COLOR: Record<string, string> = {
  Easy: "text-[#39FF14]",
  Moderate: "text-yellow-400",
  Difficult: "text-red-400",
};

// Single image — shows a dark tinted placeholder on load error instead of disappearing
function MaterialImage({ src, alt }: { src: string; alt: string }) {
  const [status, setStatus] = useState<"loading" | "ok" | "failed">("loading");
  return (
    <>
      {status === "failed" && (
        <div className="w-full h-full flex items-center justify-center bg-[#111] text-gray-600 text-xs text-center px-3">
          {alt}
        </div>
      )}
      <img
        src={src}
        alt={alt}
        className={`w-full h-full object-cover transition-opacity duration-300 ${status === "ok" ? "opacity-100" : "opacity-0 absolute inset-0"}`}
        onLoad={() => setStatus("ok")}
        onError={() => setStatus("failed")}
      />
    </>
  );
}

function MaterialCard({ mat, isExpanded, onToggle }: {
  mat: Material;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  // Prefer material-specific imageUrl, then fall back to subcategory images
  const images: string[] = mat.imageUrl
    ? [mat.imageUrl, ...(SUBCATEGORY_IMAGES[mat.subcategory] ?? []).slice(0, 1)]
    : (SUBCATEGORY_IMAGES[mat.subcategory] ?? []);

  return (
    <div
      className={`rounded-xl border transition-all duration-200 overflow-hidden ${
        isExpanded
          ? "border-[#39FF14]/40 bg-[#111]"
          : "border-white/8 bg-[#0d0d0d] hover:border-white/20 hover:bg-[#111] cursor-pointer"
      }`}
    >
      {/* Card Header — always visible */}
      <button
        onClick={onToggle}
        className="w-full text-left p-5 flex items-start gap-4"
      >
        {/* Icon */}
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 mt-0.5"
          style={{ backgroundColor: `${mat.colorAccent}20`, border: `1px solid ${mat.colorAccent}40` }}
        >
          {mat.icon}
        </div>

        {/* Main info */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="font-mono text-xs text-[#39FF14] bg-[#39FF14]/10 px-2 py-0.5 rounded border border-[#39FF14]/20">
              {mat.isriCode}
            </span>
            {mat.balerRelevant && (
              <span className="text-xs text-white/40 bg-white/5 px-2 py-0.5 rounded border border-white/10">
                🗜 Baler Required
              </span>
            )}
          </div>
          <h3 className="text-white font-bold text-base leading-snug">{mat.commonName}</h3>
          <p className="text-gray-500 text-xs mt-0.5">{mat.isriName}</p>
          <p className="text-gray-400 text-sm mt-2 line-clamp-2">{mat.description}</p>
        </div>

        {/* Value + expand */}
        <div className="shrink-0 text-right ml-2">
          <div className={`text-sm font-bold ${VALUE_COLORS[mat.valueTier]}`}>{mat.valueRange}</div>
          <div className="text-gray-600 text-xs mt-0.5">est. /ton</div>
          <div className="mt-3 text-gray-500">
            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </div>
        </div>
      </button>

      {/* Expanded detail panel */}
      {isExpanded && (
        <div className="border-t border-white/8 p-5 space-y-6">

          {/* Photo gallery */}
          {images.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-[#39FF14] uppercase tracking-wider mb-2">What It Looks Like</h4>
              <div className={`grid gap-2 ${images.length > 1 ? "grid-cols-2" : "grid-cols-1"}`}>
                {images.slice(0, 2).map((src, i) => (
                  <div
                    key={i}
                    className="relative rounded-lg overflow-hidden bg-[#0A0A0A] border border-white/5"
                    style={{ aspectRatio: "4/3" }}
                  >
                    <MaterialImage src={src} alt={`${mat.commonName} example ${i + 1}`} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick stats row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Value Tier", val: mat.valueTier.charAt(0).toUpperCase() + mat.valueTier.slice(1), color: VALUE_COLORS[mat.valueTier] },
              { label: "Recyclability", val: mat.recyclability, color: mat.recyclability === "High" ? "text-[#39FF14]" : mat.recyclability === "Medium" ? "text-yellow-400" : "text-red-400" },
              { label: "Processing", val: mat.processingDifficulty, color: DIFF_COLOR[mat.processingDifficulty] },
              { label: "Baler", val: mat.balerRelevant ? (mat.balerType === "both" ? "Vertical or Horiz." : mat.balerType === "vertical" ? "Vertical" : mat.balerType === "horizontal" ? "Horizontal" : "Yes") : "Not Required", color: mat.balerRelevant ? "text-[#39FF14]" : "text-gray-500" },
            ].map((s) => (
              <div key={s.label} className="bg-[#0A0A0A] rounded-lg p-3 border border-white/5">
                <div className="text-gray-600 text-xs mb-1">{s.label}</div>
                <div className={`text-sm font-semibold ${s.color}`}>{s.val}</div>
              </div>
            ))}
          </div>

          {/* ISRI Spec */}
          <div>
            <h4 className="text-xs font-semibold text-[#39FF14] uppercase tracking-wider mb-2">ISRI Specification</h4>
            <p className="text-sm text-gray-300 bg-[#0A0A0A] rounded-lg p-3 border border-white/5 leading-relaxed font-mono">
              {mat.isriSpec}
            </p>
          </div>

          {/* Aliases */}
          {mat.aliases.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-[#39FF14] uppercase tracking-wider mb-2">Also Known As</h4>
              <div className="flex flex-wrap gap-2">
                {mat.aliases.map((a) => (
                  <span key={a} className="text-xs bg-white/5 text-white/60 px-2 py-1 rounded border border-white/8">
                    {a}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 3-col: Sources / Buyers / End Uses */}
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <h4 className="text-xs font-semibold text-[#39FF14] uppercase tracking-wider mb-2">Common Sources</h4>
              <ul className="space-y-1">
                {mat.commonSources.map((s) => (
                  <li key={s} className="text-xs text-gray-400 flex items-start gap-1.5">
                    <span className="text-[#39FF14] mt-0.5">›</span> {s}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-semibold text-[#39FF14] uppercase tracking-wider mb-2">End Buyers</h4>
              <ul className="space-y-1">
                {mat.endBuyers.map((b) => (
                  <li key={b} className="text-xs text-gray-400 flex items-start gap-1.5">
                    <span className="text-[#39FF14] mt-0.5">›</span> {b}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-semibold text-[#39FF14] uppercase tracking-wider mb-2">Becomes</h4>
              <ul className="space-y-1">
                {mat.endUses.map((u) => (
                  <li key={u} className="text-xs text-gray-400 flex items-start gap-1.5">
                    <span className="text-[#39FF14] mt-0.5">›</span> {u}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Kevin Notes */}
          <div className="bg-[#39FF14]/5 border border-[#39FF14]/20 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Phone size={13} className="text-[#39FF14]" />
              <span className="text-xs font-bold text-[#39FF14] uppercase tracking-wider">Kevin's Call Notes</span>
            </div>
            <p className="text-sm text-white/70 leading-relaxed">{mat.kevinNotes}</p>
          </div>

          {/* Baler callout if relevant */}
          {mat.balerRelevant && (
            <div className="bg-white/3 border border-white/8 rounded-xl p-4 flex items-start gap-3">
              <span className="text-xl">🗜</span>
              <div>
                <p className="text-sm font-semibold text-white mb-1">Baler Recommended</p>
                <p className="text-xs text-gray-400">
                  {mat.balerType === "vertical" && "A vertical baler is the standard choice for this material. Compact footprint, good for mid-volume generators."}
                  {mat.balerType === "horizontal" && "A horizontal auto-tie baler is ideal for high-volume operations handling this material."}
                  {mat.balerType === "both" && "Both vertical and horizontal balers work for this material. Vertical balers suit retail and mid-volume; horizontal auto-tie for high-volume distribution and manufacturing."}
                </p>
                <a
                  href="/wire"
                  className="text-xs text-[#39FF14] hover:underline mt-1 inline-block"
                >
                  Need bale wire? → Shop wire supply
                </a>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function MaterialsClient() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<MaterialCategory | "all">("all");
  const [activeSubcategory, setActiveSubcategory] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

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

  return (
    <div>
      {/* ── SEARCH + FILTER BAR ─────────────────────────────────────────────── */}
      <div className="sticky top-16 z-30 bg-[#0A0A0A]/95 backdrop-blur-sm border-b border-white/8 py-4">
        <div className="container-site">
          {/* Search */}
          <div className="relative mb-4">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Search by material name, ISRI code, or alias (e.g. 'cardboard', 'Barley', 'milk jugs')..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#111] border border-white/10 rounded-xl pl-10 pr-10 py-3 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-[#39FF14]/50 focus:ring-1 focus:ring-[#39FF14]/20 transition-colors"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Category tabs */}
          <div className="flex items-center gap-2 flex-wrap">
            {(["all", "fiber", "plastic", "metal"] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setActiveCategory(cat);
                  setActiveSubcategory(null);
                }}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                  activeCategory === cat
                    ? "bg-[#39FF14] text-[#0A0A0A]"
                    : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/10"
                }`}
              >
                {cat === "all"
                  ? `All (${MATERIALS.length})`
                  : `${CATEGORY_META[cat].icon} ${CATEGORY_META[cat].label} (${MATERIALS.filter((m) => m.category === cat).length})`}
              </button>
            ))}

            {/* Subcategory pills */}
            {subcategoriesForActive.length > 0 && (
              <div className="flex items-center gap-1.5 ml-2 pl-2 border-l border-white/10">
                {subcategoriesForActive.map((sub) => (
                  <button
                    key={sub}
                    onClick={() =>
                      setActiveSubcategory(activeSubcategory === sub ? null : sub)
                    }
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      activeSubcategory === sub
                        ? "bg-white/20 text-white border border-white/30"
                        : "bg-white/5 text-gray-500 hover:text-gray-300 border border-white/8"
                    }`}
                  >
                    {sub}
                  </button>
                ))}
              </div>
            )}

            <div className="ml-auto text-xs text-gray-600">
              {filtered.length} material{filtered.length !== 1 ? "s" : ""}
            </div>
          </div>
        </div>
      </div>

      {/* ── MATERIALS GRID ──────────────────────────────────────────────────── */}
      <div className="container-site py-10">
        {filtered.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-gray-500 text-lg mb-2">No materials match "{search}"</p>
            <p className="text-gray-700 text-sm">Try an ISRI code, common name, or alias</p>
            <button
              onClick={() => { setSearch(""); setActiveCategory("all"); setActiveSubcategory(null); }}
              className="mt-4 text-[#39FF14] text-sm hover:underline"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <>
            {/* Group by subcategory */}
            {activeCategory === "all" || activeSubcategory
              ? (
                <div className="space-y-3">
                  {filtered.map((mat) => (
                    <MaterialCard
                      key={mat.id}
                      mat={mat}
                      isExpanded={expandedId === mat.id}
                      onToggle={() => setExpandedId(expandedId === mat.id ? null : mat.id)}
                    />
                  ))}
                </div>
              )
              : (
                <div className="space-y-12">
                  {subcategoriesForActive
                    .filter((sub) => filtered.some((m) => m.subcategory === sub))
                    .map((sub) => (
                      <div key={sub}>
                        <div className="flex items-center gap-3 mb-4">
                          <h2 className="text-lg font-bold text-white">{sub}</h2>
                          <div className="h-px flex-1 bg-white/8" />
                          <span className="text-xs text-gray-600">
                            {filtered.filter((m) => m.subcategory === sub).length} grades
                          </span>
                        </div>
                        <div className="space-y-3">
                          {filtered
                            .filter((m) => m.subcategory === sub)
                            .map((mat) => (
                              <MaterialCard
                                key={mat.id}
                                mat={mat}
                                isExpanded={expandedId === mat.id}
                                onToggle={() => setExpandedId(expandedId === mat.id ? null : mat.id)}
                              />
                            ))}
                        </div>
                      </div>
                    ))}
                </div>
              )}
          </>
        )}
      </div>

      {/* ── GLOSSARY ────────────────────────────────────────────────────────── */}
      <div className="border-t border-white/8 bg-[#050505]">
        <div className="container-site py-20">
          <div className="flex items-center gap-3 mb-10">
            <BookOpen size={20} className="text-[#39FF14]" />
            <h2 className="text-2xl font-black text-white">Industry Glossary</h2>
          </div>
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
              <div key={term} className="bg-[#0A0A0A] rounded-xl p-4 border border-white/8">
                <dt className="text-sm font-bold text-[#39FF14] mb-1">{term}</dt>
                <dd className="text-xs text-gray-400 leading-relaxed">{def}</dd>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
