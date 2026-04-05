import type { Metadata } from "next";
import Link from "next/link";
import { Database, Wrench } from "lucide-react";
import BalersClient from "./BalersClient";
import { BALERS, ALL_MAKES } from "./data";

export const metadata: Metadata = {
  title: "Baler Database — Makes, Models, Specs & Wire Guide | Bandit Recycling",
  description:
    "Find your baler by make and model. Harmony, Harris, International Baler, Maren, Bramidan, Marathon, Bollegraaf, and more. Wire compatibility, specs, and Bandit repair services for every baler.",
  keywords: [
    "baler database", "baler wire guide", "baler compatibility", "Harmony baler wire",
    "Harris baler specs", "International Baler wire", "baler repair Southeast US",
    "vertical baler wire", "horizontal baler wire", "auto-tie box wire", "single loop bale ties",
    "double loop bale ties", "baler maintenance", "baler specs guide",
  ],
};

const STATS = [
  { val: `${BALERS.length}+`, label: "Baler models listed" },
  { val: `${ALL_MAKES.length}`, label: "Manufacturers covered" },
  { val: "3", label: "Wire format types" },
  { val: "All Makes", label: "Repair & service" },
];

export default function BalersPage() {
  return (
    <>
      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <section className="relative bg-[#0A0A0A] overflow-hidden pt-24 pb-16">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(#39FF14 1px, transparent 1px), linear-gradient(90deg, #39FF14 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
        <div className="absolute top-0 left-1/3 w-[600px] h-[400px] bg-[#39FF14]/4 rounded-full blur-[140px] pointer-events-none" />

        <div className="container-site relative">
          <div className="badge-green mb-5 flex items-center gap-2 w-fit">
            <Database size={13} /> Baler Reference Database
          </div>
          <h1 className="text-5xl sm:text-6xl font-black text-white leading-none tracking-tight mb-5">
            Find Your Baler.{" "}
            <span className="text-[#39FF14]">Get the Right Wire.</span>
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mb-8 leading-relaxed">
            Database of baler makes, models, specs, and wire compatibility. Find your exact machine,
            get the wire spec it needs, and connect with Bandit for repair, maintenance, or a new unit —
            all makes and models, Southeast US.
          </p>

          {/* Quick Links */}
          <div className="flex flex-wrap gap-3 mb-10">
            <Link href="/wire" className="btn-primary text-sm">
              Shop Bale Wire →
            </Link>
            <Link href="/quote" className="btn-ghost-green text-sm">
              Service Quote
            </Link>
            <a href="tel:+18004226348" className="btn-ghost-green text-sm">
              Call 1-800-4BANDIT
            </a>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap gap-8 pt-8 border-t border-white/8">
            {STATS.map((s) => (
              <div key={s.label}>
                <div className="text-3xl font-black text-[#39FF14]">{s.val}</div>
                <div className="text-sm text-gray-500 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW TO USE ────────────────────────────────────────────────────── */}
      <section className="bg-[#050505] border-y border-white/8 py-10">
        <div className="container-site">
          <p className="text-xs text-gray-600 uppercase tracking-widest font-bold mb-6">How to use this database</p>
          <div className="grid sm:grid-cols-3 gap-5">
            {[
              {
                step: "01",
                title: "Find Your Baler",
                desc: "Search by make, model name, or the type of material you're baling. Filter by baler type or wire format.",
              },
              {
                step: "02",
                title: "Confirm Your Wire",
                desc: "Each baler card shows the exact wire format, gauge, and finish recommended. Click to order from Bandit's wire catalog.",
              },
              {
                step: "03",
                title: "Get Service or Equipment",
                desc: "Need repair, PM, or a new/used baler? Every card links directly to a service quote or our sales line.",
              },
            ].map((item) => (
              <div key={item.step} className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#39FF14]/10 border border-[#39FF14]/20 flex items-center justify-center">
                  <span className="text-xs font-black text-[#39FF14]">{item.step}</span>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white mb-1">{item.title}</h3>
                  <p className="text-xs text-gray-400 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BANDIT SERVICE CALLOUT ─────────────────────────────────────────── */}
      <section className="bg-[#0A0A0A] border-b border-white/8 py-6">
        <div className="container-site">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#111111] border border-[#39FF14]/15 rounded-2xl px-6 py-5">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#39FF14]/10 flex items-center justify-center flex-shrink-0">
                <Wrench size={18} className="text-[#39FF14]" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">Bandit services all makes and models</p>
                <p className="text-xs text-gray-400">Don't see your baler? We still service it. Call for a same-day quote.</p>
              </div>
            </div>
            <div className="flex gap-3 flex-shrink-0">
              <Link href="/quote" className="btn-primary text-sm">
                Get a Quote
              </Link>
              <a href="tel:+18004226348" className="btn-ghost-green text-sm">
                Call Now
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── INTERACTIVE DATABASE ──────────────────────────────────────────── */}
      <div className="bg-[#0A0A0A] min-h-screen">
        <BalersClient />
      </div>

      {/* ── BOTTOM CTA ────────────────────────────────────────────────────── */}
      <section className="py-20 bg-[#0A0A0A] border-t border-white/8">
        <div className="container-site text-center">
          <h2 className="text-3xl font-black text-white mb-4">
            Ready to order wire or book a service call?
          </h2>
          <p className="text-gray-400 mb-8 max-w-xl mx-auto">
            Southeast US baler experts — repair, PM, wire supply, and equipment sales. All makes and models.
            Same-day emergency service in GA, FL, AL, SC, NC, and TN.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/wire" className="btn-primary">
              Shop Bale Wire
            </Link>
            <Link href="/quote" className="btn-ghost-green">
              Request a Service Quote →
            </Link>
            <a href="tel:+18004226348" className="btn-ghost-green">
              Call 1-800-4BANDIT
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
