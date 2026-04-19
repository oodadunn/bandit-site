import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen, Search } from "lucide-react";
import MaterialsClient from "./MaterialsClient";
import { MATERIALS, CATEGORY_META } from "./data";
import HeroMascot from "@/components/HeroMascot";

export const metadata: Metadata = {
  title: "Recyclable Materials Glossary — ISRI Grades & Specs | Bandit Recycling",
  description:
    "Complete guide to recyclable materials: ISRI codes, specifications, value ranges, common sources, and end buyers for fiber, plastics, and metals. Reference for recyclers nationwide.",
  keywords: [
    "ISRI scrap specifications", "recyclable materials guide", "OCC grade", "copper scrap grades",
    "baling wire materials", "recyclables glossary", "scrap metal grades",
    "paper recycling grades", "plastic recycling codes", "ReMA specifications",
  ],
};

const STATS = [
  { val: `${MATERIALS.length}+`, label: "ISRI grades covered" },
  { val: "3", label: "Material categories" },
  { val: "10+", label: "Subcategories" },
  { val: "2024", label: "ReMA specifications" },
];

export default function MaterialsPage() {
  return (
    <>
      {/* ── VIDEO BANNER ─────────────────────────────────────────────────── */}
      <section className="relative bg-[#0A0A0A] overflow-hidden pt-20">
        <div className="container-site relative">
          <div className="rounded-xl overflow-hidden border border-white/10">
            <video
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-[280px] sm:h-[360px] md:h-[420px] object-cover"
            >
              <source src="/videos/materials-hero.mp4" type="video/mp4" />
            </video>
          </div>
        </div>
      </section>

      {/* ── HERO TEXT ────────────────────────────────────────────────────── */}
      <section className="relative bg-[#0A0A0A] overflow-hidden pt-10 pb-16">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(#39FF14 1px, transparent 1px), linear-gradient(90deg, #39FF14 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
        <div className="absolute top-0 right-0 w-[600px] h-[400px] bg-[#39FF14]/4 rounded-full blur-[140px] pointer-events-none" />

        <div className="container-site relative">
          <div className="grid lg:grid-cols-[1fr_auto] gap-12 items-center">
            <div>
              <div className="badge-green mb-5 flex items-center gap-2 w-fit">
                <BookOpen size={13} /> Materials Reference
              </div>
              <h1 className="text-5xl sm:text-6xl font-black text-white leading-none tracking-tight mb-5">
                Recyclable Materials{" "}
                <span className="text-[#39FF14]">Glossary.</span>
              </h1>
              <p className="text-lg text-gray-400 max-w-2xl mb-8 leading-relaxed">
                Complete ISRI / ReMA specifications for fiber, plastics, and metals. Common names,
                grade codes, value ranges, who generates it, who buys it, and what it becomes.
                Built for recyclers, buyers, and anyone who needs to know what they're handling.
              </p>

              {/* Stats */}
              <div className="flex flex-wrap gap-8 mb-2 pt-8 border-t border-white/8">
                {STATS.map((s) => (
                  <div key={s.label}>
                    <div className="text-3xl font-black text-[#39FF14]">{s.val}</div>
                    <div className="text-sm text-gray-500 mt-0.5">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="hidden lg:flex justify-center items-center relative w-80">
              <div className="absolute inset-0 rounded-full bg-[#39FF14]/5 blur-3xl pointer-events-none" />
              <HeroMascot slug="materials" className="relative w-full max-w-sm" />
            </div>
          </div>
        </div>
      </section>

      {/* ── CATEGORY OVERVIEW ─────────────────────────────────────────────── */}
      <section className="bg-[#050505] border-y border-white/8 py-10">
        <div className="container-site">
          <div className="grid md:grid-cols-3 gap-5">
            {(["fiber", "plastic", "metal"] as const).map((cat) => {
              const meta = CATEGORY_META[cat];
              const count = MATERIALS.filter((m) => m.category === cat).length;
              return (
                <div key={cat} className="card-dark">
                  <div className="text-3xl mb-3">{meta.icon}</div>
                  <h3 className="text-lg font-bold text-white mb-1">{meta.label}</h3>
                  <p className="text-sm text-gray-400 mb-3 leading-relaxed">{meta.description}</p>
                  <p className="text-xs text-gray-600 italic mb-3">"{meta.stat}"</p>
                  <div className="text-xs text-[#39FF14] font-semibold">{count} grades covered</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── INTERACTIVE MATERIALS ─────────────────────────────────────────── */}
      <div className="bg-[#0A0A0A] min-h-screen">
        <MaterialsClient />
      </div>

      {/* ── BOTTOM CTA ────────────────────────────────────────────────────── */}
      <section className="py-20 bg-[#0A0A0A] border-t border-white/8">
        <div className="container-site text-center">
          <h2 className="text-3xl font-black text-white mb-4">
            Have material to bale or recycle?
          </h2>
          <p className="text-gray-400 mb-8 max-w-xl mx-auto">
            If it's on this list and it needs a baler, wire, or a recycling connection — we can help.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/quote" className="btn-primary">
              Get a Free Quote
            </Link>
            <Link href="/wire" className="btn-ghost-green">
              Shop Bale Wire →
            </Link>
            <a href="tel:+18574226348" className="btn-ghost-green">
              Call 857-422-6348
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
