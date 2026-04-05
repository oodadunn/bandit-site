"use client";
import { useState, useMemo } from "react";
import Link from "next/link";
import { Search, Zap, Wrench, ShoppingCart, ChevronDown, ChevronUp, Filter } from "lucide-react";
import {
  BALERS,
  ALL_MAKES,
  WIRE_FORMAT_LABELS,
  WIRE_FORMAT_DESCRIPTIONS,
  TYPE_LABELS,
  TIER_LABELS,
  TYPE_DESCRIPTIONS,
  type BalerType,
  type WireFormat,
  type Baler,
} from "./data";

// ─── WIRE FORMAT COLORS ────────────────────────────────────────────────────────
const WIRE_COLORS: Record<WireFormat, { bg: string; text: string; border: string }> = {
  "single-loop": { bg: "bg-blue-500/10", text: "text-blue-400", border: "border-blue-500/30" },
  "double-loop": { bg: "bg-purple-500/10", text: "text-purple-400", border: "border-purple-500/30" },
  "auto-tie-box": { bg: "bg-[#39FF14]/10", text: "text-[#39FF14]", border: "border-[#39FF14]/30" },
};

const TIER_COLORS: Record<string, string> = {
  entry: "text-gray-400 bg-white/5 border border-white/10",
  mid: "text-blue-400 bg-blue-500/10 border border-blue-500/20",
  commercial: "text-yellow-400 bg-yellow-500/10 border border-yellow-500/20",
  industrial: "text-red-400 bg-red-500/10 border border-red-500/20",
};

const TYPE_BADGE_COLORS: Record<BalerType, string> = {
  vertical: "text-cyan-400 bg-cyan-500/10 border border-cyan-500/20",
  horizontal: "text-orange-400 bg-orange-500/10 border border-orange-500/20",
  "two-ram": "text-pink-400 bg-pink-500/10 border border-pink-500/20",
};

// ─── BALER CARD ────────────────────────────────────────────────────────────────
function BalerCard({ baler }: { baler: Baler }) {
  const [expanded, setExpanded] = useState(false);
  const wire = WIRE_COLORS[baler.wireFormat];

  return (
    <div className="card-dark hover:border-[#39FF14]/20 transition-colors">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${TYPE_BADGE_COLORS[baler.type]}`}>
              {TYPE_LABELS[baler.type]}
            </span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${TIER_COLORS[baler.tier]}`}>
              {TIER_LABELS[baler.tier]}
            </span>
          </div>
          <p className="text-xs text-gray-500 font-mono uppercase tracking-widest mb-0.5">{baler.make}</p>
          <h3 className="text-xl font-black text-white leading-tight">{baler.model}</h3>
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex-shrink-0 p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors mt-1"
          aria-label={expanded ? "Collapse" : "Expand"}
        >
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>

      {/* Key Specs Grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-white/3 rounded-lg p-3">
          <p className="text-[10px] text-gray-600 uppercase tracking-widest mb-1">Bale Size</p>
          <p className="text-sm font-bold text-white">{baler.baleWidth}″ × {baler.baleDepth}″</p>
          <p className="text-[10px] text-gray-500 mt-0.5">width × depth</p>
        </div>
        <div className="bg-white/3 rounded-lg p-3">
          <p className="text-[10px] text-gray-600 uppercase tracking-widest mb-1">Bale Weight</p>
          <p className="text-sm font-bold text-white">{baler.baleWeightMin.toLocaleString()}–{baler.baleWeightMax.toLocaleString()} lbs</p>
          <p className="text-[10px] text-gray-500 mt-0.5">typical range</p>
        </div>
        <div className="bg-white/3 rounded-lg p-3">
          <p className="text-[10px] text-gray-600 uppercase tracking-widest mb-1">Motor</p>
          <p className="text-sm font-bold text-white">{baler.motorHP}</p>
          <p className="text-[10px] text-gray-500 mt-0.5">drive power</p>
        </div>
        <div className="bg-white/3 rounded-lg p-3">
          <p className="text-[10px] text-gray-600 uppercase tracking-widest mb-1">Throughput</p>
          <p className="text-sm font-bold text-white">{baler.throughput}</p>
          <p className="text-[10px] text-gray-500 mt-0.5">est. capacity</p>
        </div>
      </div>

      {/* Wire Compatibility — Primary Value Add */}
      <div className={`rounded-xl border p-4 mb-4 ${wire.bg} ${wire.border}`}>
        <div className="flex items-center gap-2 mb-2">
          <Zap size={14} className={wire.text} />
          <p className={`text-xs font-bold uppercase tracking-wider ${wire.text}`}>Wire Compatibility</p>
        </div>
        <p className="text-white font-bold text-sm mb-1">{WIRE_FORMAT_LABELS[baler.wireFormat]}</p>
        <p className="text-xs text-gray-400 mb-1">{baler.wireGauge} · {baler.wireFinish === "either" ? "Black Annealed or Galvanized" : baler.wireFinish === "black-annealed" ? "Black Annealed" : "Galvanized"}</p>
        <p className="text-xs text-gray-500 mb-3">{baler.wiresPerBale} wires per bale</p>
        <Link
          href={`/wire#${baler.wireProductAnchor}`}
          className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors ${
            baler.wireFormat === "auto-tie-box"
              ? "bg-[#39FF14]/20 text-[#39FF14] hover:bg-[#39FF14]/30"
              : baler.wireFormat === "double-loop"
              ? "bg-purple-500/20 text-purple-300 hover:bg-purple-500/30"
              : "bg-blue-500/20 text-blue-300 hover:bg-blue-500/30"
          }`}
        >
          <ShoppingCart size={12} />
          Order {WIRE_FORMAT_LABELS[baler.wireFormat]} →
        </Link>
      </div>

      {/* Common Materials */}
      <div className="mb-4">
        <p className="text-[10px] text-gray-600 uppercase tracking-widest mb-2">Common Materials</p>
        <div className="flex flex-wrap gap-1.5">
          {baler.commonMaterials.map((m) => (
            <span key={m} className="text-[10px] text-gray-400 bg-white/5 border border-white/8 px-2 py-0.5 rounded-full">
              {m}
            </span>
          ))}
        </div>
      </div>

      {/* Expanded Content */}
      {expanded && (
        <div className="mt-2 pt-4 border-t border-white/8 space-y-4">
          {/* Typical Users */}
          <div>
            <p className="text-[10px] text-gray-600 uppercase tracking-widest mb-2">Typical Users</p>
            <div className="flex flex-wrap gap-1.5">
              {baler.typicalUsers.map((u) => (
                <span key={u} className="text-[10px] text-gray-300 bg-white/5 border border-white/8 px-2 py-0.5 rounded-full">
                  {u}
                </span>
              ))}
            </div>
          </div>

          {/* Features */}
          <div>
            <p className="text-[10px] text-gray-600 uppercase tracking-widest mb-2">Key Features</p>
            <ul className="space-y-1">
              {baler.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-xs text-gray-400">
                  <span className="text-[#39FF14] mt-0.5 flex-shrink-0">▸</span>
                  {f}
                </li>
              ))}
            </ul>
          </div>

          {/* Service Notes */}
          <div className="bg-yellow-500/5 border border-yellow-500/15 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Wrench size={13} className="text-yellow-400" />
              <p className="text-xs font-bold text-yellow-400 uppercase tracking-wider">Bandit Service Notes</p>
            </div>
            <p className="text-xs text-gray-300 leading-relaxed">{baler.serviceNotes}</p>
          </div>
        </div>
      )}

      {/* CTAs */}
      <div className="flex gap-2 mt-4 pt-4 border-t border-white/8">
        <Link href="/quote" className="flex-1 text-center text-xs font-bold py-2 px-3 rounded-lg bg-[#39FF14]/10 text-[#39FF14] border border-[#39FF14]/20 hover:bg-[#39FF14]/20 transition-colors">
          Get Service Quote
        </Link>
        <a href="tel:+18004226348" className="flex-1 text-center text-xs font-bold py-2 px-3 rounded-lg bg-white/5 text-gray-300 border border-white/10 hover:bg-white/10 hover:text-white transition-colors">
          Call 1-800-4BANDIT
        </a>
      </div>
    </div>
  );
}

// ─── MAIN CLIENT COMPONENT ─────────────────────────────────────────────────────
export default function BalersClient() {
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<BalerType | "all">("all");
  const [wireFilter, setWireFilter] = useState<WireFormat | "all">("all");
  const [makeFilter, setMakeFilter] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return BALERS.filter((b) => {
      if (typeFilter !== "all" && b.type !== typeFilter) return false;
      if (wireFilter !== "all" && b.wireFormat !== wireFilter) return false;
      if (makeFilter !== "all" && b.make !== makeFilter) return false;
      if (!q) return true;
      return (
        b.make.toLowerCase().includes(q) ||
        b.model.toLowerCase().includes(q) ||
        b.fullName.toLowerCase().includes(q) ||
        b.commonMaterials.some((m) => m.toLowerCase().includes(q)) ||
        b.typicalUsers.some((u) => u.toLowerCase().includes(q)) ||
        (b.tags ?? []).some((t) => t.includes(q)) ||
        TYPE_LABELS[b.type].toLowerCase().includes(q) ||
        WIRE_FORMAT_LABELS[b.wireFormat].toLowerCase().includes(q)
      );
    });
  }, [query, typeFilter, wireFilter, makeFilter]);

  const counts = useMemo(() => ({
    all: BALERS.length,
    vertical: BALERS.filter((b) => b.type === "vertical").length,
    horizontal: BALERS.filter((b) => b.type === "horizontal").length,
    "two-ram": BALERS.filter((b) => b.type === "two-ram").length,
  }), []);

  const activeFilters = (typeFilter !== "all" ? 1 : 0) + (wireFilter !== "all" ? 1 : 0) + (makeFilter !== "all" ? 1 : 0);

  return (
    <div className="container-site py-10">
      {/* ── WIRE FORMAT QUICK-FIND ─────────────────────────────────────────── */}
      <div className="mb-10">
        <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">Find by Wire Type</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          {(["single-loop", "double-loop", "auto-tie-box"] as WireFormat[]).map((fmt) => {
            const c = WIRE_COLORS[fmt];
            const count = BALERS.filter((b) => b.wireFormat === fmt).length;
            const isActive = wireFilter === fmt;
            return (
              <button
                key={fmt}
                onClick={() => setWireFilter(isActive ? "all" : fmt)}
                className={`text-left p-4 rounded-xl border transition-all ${
                  isActive
                    ? `${c.bg} ${c.border} ring-1 ring-current`
                    : "bg-[#111111] border-white/8 hover:border-white/20"
                }`}
              >
                <p className={`text-sm font-bold mb-1 ${isActive ? c.text : "text-white"}`}>
                  {WIRE_FORMAT_LABELS[fmt]}
                </p>
                <p className="text-xs text-gray-500 leading-relaxed mb-2">{WIRE_FORMAT_DESCRIPTIONS[fmt]}</p>
                <p className={`text-xs font-semibold ${isActive ? c.text : "text-gray-600"}`}>
                  {count} balers →
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── SEARCH & FILTERS ───────────────────────────────────────────────── */}
      <div className="sticky top-16 z-30 bg-[#0A0A0A]/95 backdrop-blur-sm py-4 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 mb-6 border-b border-white/8">
        <div className="flex gap-3 items-center">
          {/* Search */}
          <div className="flex-1 relative">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Search by make, model, material, or user type…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-[#111111] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#39FF14]/50 focus:ring-1 focus:ring-[#39FF14]/20 transition-colors"
            />
          </div>
          {/* Filter toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium transition-colors ${
              activeFilters > 0 || showFilters
                ? "bg-[#39FF14]/10 border-[#39FF14]/30 text-[#39FF14]"
                : "bg-[#111111] border-white/10 text-gray-400 hover:text-white hover:border-white/20"
            }`}
          >
            <Filter size={14} />
            Filters
            {activeFilters > 0 && (
              <span className="bg-[#39FF14] text-black text-[10px] font-black px-1.5 rounded-full leading-5">
                {activeFilters}
              </span>
            )}
          </button>
        </div>

        {/* Expanded filters */}
        {showFilters && (
          <div className="mt-3 grid sm:grid-cols-3 gap-3">
            {/* Type filter */}
            <div>
              <p className="text-[10px] text-gray-600 uppercase tracking-widest mb-1.5">Baler Type</p>
              <div className="flex flex-wrap gap-1.5">
                {(["all", "vertical", "horizontal", "two-ram"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTypeFilter(t)}
                    className={`text-xs px-3 py-1 rounded-full border transition-colors font-medium ${
                      typeFilter === t
                        ? "bg-[#39FF14]/20 text-[#39FF14] border-[#39FF14]/40"
                        : "bg-white/5 text-gray-400 border-white/10 hover:text-white hover:border-white/20"
                    }`}
                  >
                    {t === "all" ? `All (${counts.all})` : t === "vertical" ? `Vertical (${counts.vertical})` : t === "horizontal" ? `Horizontal (${counts.horizontal})` : `Two-Ram (${counts["two-ram"]})`}
                  </button>
                ))}
              </div>
            </div>

            {/* Wire format filter */}
            <div>
              <p className="text-[10px] text-gray-600 uppercase tracking-widest mb-1.5">Wire Format</p>
              <div className="flex flex-wrap gap-1.5">
                {(["all", "single-loop", "double-loop", "auto-tie-box"] as const).map((w) => (
                  <button
                    key={w}
                    onClick={() => setWireFilter(w)}
                    className={`text-xs px-3 py-1 rounded-full border transition-colors font-medium ${
                      wireFilter === w
                        ? "bg-[#39FF14]/20 text-[#39FF14] border-[#39FF14]/40"
                        : "bg-white/5 text-gray-400 border-white/10 hover:text-white hover:border-white/20"
                    }`}
                  >
                    {w === "all" ? "All Formats" : WIRE_FORMAT_LABELS[w].split(" ").slice(0, 2).join(" ")}
                  </button>
                ))}
              </div>
            </div>

            {/* Make filter */}
            <div>
              <p className="text-[10px] text-gray-600 uppercase tracking-widest mb-1.5">Manufacturer</p>
              <select
                value={makeFilter}
                onChange={(e) => setMakeFilter(e.target.value)}
                className="w-full bg-[#111111] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#39FF14]/50 transition-colors"
              >
                <option value="all">All Manufacturers</option>
                {ALL_MAKES.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* ── RESULTS HEADER ─────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-gray-500">
          Showing <span className="text-white font-bold">{filtered.length}</span> of {BALERS.length} balers
          {activeFilters > 0 && (
            <button
              onClick={() => { setTypeFilter("all"); setWireFilter("all"); setMakeFilter("all"); setQuery(""); }}
              className="ml-3 text-xs text-[#39FF14] hover:underline"
            >
              Clear all filters
            </button>
          )}
        </p>
      </div>

      {/* ── BALER GRID ─────────────────────────────────────────────────────── */}
      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-4xl mb-4">🦝</p>
          <p className="text-gray-400 mb-2">No balers match your search.</p>
          <p className="text-sm text-gray-600 mb-6">
            Don't see your baler? Call us — we service all makes and models.
          </p>
          <a href="tel:+18004226348" className="btn-primary">
            Call 1-800-4BANDIT
          </a>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((b) => (
            <BalerCard key={b.id} baler={b} />
          ))}
        </div>
      )}

      {/* ── BALER TYPE EXPLAINER ───────────────────────────────────────────── */}
      <div className="mt-16 pt-10 border-t border-white/8">
        <h2 className="text-2xl font-black text-white mb-2">Understanding Baler Types</h2>
        <p className="text-gray-400 text-sm mb-8 max-w-2xl">
          Choosing the right baler type affects which wire you need, how you manage your recycling, and what Bandit can do for you.
        </p>
        <div className="grid md:grid-cols-3 gap-5">
          {(["vertical", "horizontal", "two-ram"] as BalerType[]).map((t) => {
            const info = TYPE_DESCRIPTIONS[t];
            const count = BALERS.filter((b) => b.type === t).length;
            return (
              <div key={t} className="card-dark">
                <div className="text-3xl mb-3">{info.icon}</div>
                <h3 className="text-lg font-bold text-white mb-2">{TYPE_LABELS[t]}</h3>
                <p className="text-sm text-gray-400 leading-relaxed mb-3">{info.description}</p>
                <p className="text-xs text-gray-600 italic mb-3">"{info.typical}"</p>
                <button
                  onClick={() => { setTypeFilter(t); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                  className="text-xs text-[#39FF14] font-semibold hover:underline"
                >
                  Browse {count} {TYPE_LABELS[t]}s →
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── DON'T SEE YOUR BALER ──────────────────────────────────────────── */}
      <div className="mt-12 bg-[#111111] border border-white/8 rounded-2xl p-8 text-center">
        <div className="text-4xl mb-3">🔧</div>
        <h3 className="text-xl font-black text-white mb-2">Don't See Your Baler?</h3>
        <p className="text-gray-400 text-sm max-w-xl mx-auto mb-6">
          We service and supply wire for <strong className="text-white">all makes and models</strong> — not just the ones in this database.
          If you're unsure what wire your baler takes, or need a service quote for a model we haven't listed, just call or get a quote.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link href="/quote" className="btn-primary">
            Request a Service Quote
          </Link>
          <a href="tel:+18004226348" className="btn-ghost-green">
            Call 1-800-4BANDIT
          </a>
          <Link href="/wire" className="btn-ghost-green">
            Browse All Wire Products
          </Link>
        </div>
      </div>
    </div>
  );
}
