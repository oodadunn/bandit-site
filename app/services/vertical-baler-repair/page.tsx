import type { Metadata } from "next";
import Link from "next/link";
import { Phone, CheckCircle, ChevronRight, Package, Users, Building2 } from "lucide-react";
import QuoteForm from "@/components/QuoteForm";

export const metadata: Metadata = {
  title: "Vertical Baler Repair Service | Southeast US",
  description:
    "Expert vertical baler repair for retail, grocery, and distribution operations across the Southeast US. All makes and models. Same-day emergency service available.",
  keywords: ["vertical baler repair", "cardboard baler repair", "retail baler service", "vertical baler service Southeast", "baler repair Georgia Florida"],
};

const INDUSTRIES = [
  { icon: Building2, name: "Retail & Big Box", desc: "High-volume cardboard from receiving docks. We service balers in distribution centers, department stores, and warehouse clubs." },
  { icon: Package, name: "Grocery & Supermarket", desc: "Compliance-driven operations where downtime means cardboard piling up in the back room. Fast dispatch is our specialty." },
  { icon: Users, name: "Distribution Centers", desc: "Multi-shift operations requiring reliable uptime. We offer PM contracts to keep your vertical baler running every shift." },
];

const COMMON_REPAIRS = [
  "Ram won't descend or retract",
  "Hydraulic leak (cylinder, hose, or pump)",
  "Baler won't power on or trips breaker",
  "Auto-tie wire system failure",
  "Door interlock or safety circuit issue",
  "Control panel error codes",
  "Slow cycle time",
  "Excessive noise during operation",
  "Ram sticking mid-stroke",
  "Oil contamination or fluid change",
];

const TOP_MAKES = [
  { make: "Harris", models: "VH Series, GH Series" },
  { make: "Balemaster", models: "Challenger, Elite Series" },
  { make: "Maren", models: "CF Series, M-20, M-30" },
  { make: "Pakrite", models: "All models" },
  { make: "PTR Baler", models: "All models" },
  { make: "Harmony", models: "All models" },
  { make: "American Baler", models: "VB Series" },
  { make: "Mil-tek", models: "All models" },
];

export default function VerticalBalerRepairPage() {
  return (
    <>
      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <section className="relative min-h-[70vh] flex items-center bg-[#0A0A0A] overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: "linear-gradient(#39FF14 1px, transparent 1px), linear-gradient(90deg, #39FF14 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#39FF14]/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="container-site relative py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex items-center gap-2 mb-6">
                <div className="badge-green">Vertical Baler Repair</div>
              </div>
              <h1 className="text-5xl sm:text-6xl font-black text-white leading-none tracking-tight mb-6">
                Vertical Baler Down?{" "}
                <span className="text-[#39FF14]">Back Up Today.</span>
              </h1>
              <p className="text-lg text-gray-400 mb-8 max-w-xl leading-relaxed">
                We specialize in vertical baler repair for retail, grocery, and distribution operations across the Southeast. All makes and models — same-day emergency service available.
              </p>
              <div className="flex flex-wrap gap-3 mb-10">
                <a href="tel:+18004226348" className="btn-primary">
                  <Phone size={16} /> Call 1-800-4BANDIT
                </a>
                <Link href="/services/emergency-repair" className="btn-ghost-green">
                  Emergency Dispatch <ChevronRight size={16} />
                </Link>
              </div>
              <div className="flex flex-wrap gap-4">
                {["All Vertical Makes & Models", "Same-Day Service", "Retail & Distribution Focus", "Licensed & Insured"].map((t) => (
                  <div key={t} className="flex items-center gap-1.5 text-xs text-gray-400">
                    <CheckCircle size={13} className="text-[#39FF14]" />
                    {t}
                  </div>
                ))}
              </div>
            </div>
            <div className="lg:max-w-md ml-auto w-full">
              <QuoteForm
                formType="service_quote"
                title="Get a Vertical Baler Repair Quote"
                subtitle="Tell us the make/model and issue — we'll respond within 2 hours."
                ctaLabel="Request Repair Quote"
                showEquipment
                showUrgency
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── INDUSTRIES ────────────────────────────────────────────────── */}
      <section className="py-20 bg-[#050505]">
        <div className="container-site">
          <div className="text-center mb-12">
            <div className="badge-green mb-4">Industries We Serve</div>
            <h2 className="section-heading text-white mb-4">Built for High-Volume Retail Operations</h2>
            <p className="text-gray-400 max-w-xl mx-auto">
              Vertical balers are the workhorse of retail recycling. We understand the uptime pressure your operation faces.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {INDUSTRIES.map((ind) => (
              <div key={ind.name} className="card-dark">
                <div className="w-10 h-10 rounded-lg bg-[#39FF14]/10 flex items-center justify-center mb-4">
                  <ind.icon size={20} className="text-[#39FF14]" />
                </div>
                <h3 className="font-bold text-white mb-2 text-sm">{ind.name}</h3>
                <p className="text-xs text-gray-400 leading-relaxed">{ind.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── COMMON REPAIRS + MAKES ─────────────────────────────────────── */}
      <section className="py-24 bg-[#0A0A0A]">
        <div className="container-site">
          <div className="grid lg:grid-cols-2 gap-12">
            <div>
              <div className="badge-green mb-4">Common Issues</div>
              <h2 className="section-heading text-white mb-6">Problems We Fix Every Day</h2>
              <div className="grid grid-cols-1 gap-2">
                {COMMON_REPAIRS.map((r) => (
                  <div key={r} className="flex items-center gap-3 p-3 bg-[#111111] border border-[#1F2937] rounded-lg hover:border-[#39FF14]/20 transition-colors">
                    <span className="text-[#39FF14] font-bold text-sm">›</span>
                    <span className="text-sm text-gray-300">{r}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div className="badge-green mb-4">Makes We Service</div>
              <h2 className="section-heading text-white mb-6">Top Vertical Baler Brands</h2>
              <div className="space-y-2">
                {TOP_MAKES.map((m) => (
                  <div key={m.make} className="flex items-center justify-between p-4 card-dark hover:border-[#39FF14]/30 transition-colors">
                    <span className="font-bold text-white text-sm">{m.make}</span>
                    <span className="text-xs text-gray-500 font-mono">{m.models}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-600 mt-3">Don't see your make? <a href="tel:+18004226348" className="text-[#39FF14] hover:underline">Call us</a> — we service virtually all models.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── RELATED SERVICES ──────────────────────────────────────────── */}
      <section className="py-16 bg-[#050505]">
        <div className="container-site">
          <div className="badge-green mb-6">Related Services</div>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { title: "Horizontal Baler Repair", desc: "For industrial and high-volume operations.", href: "/services/horizontal-baler-repair" },
              { title: "Preventive Maintenance", desc: "Stop breakdowns before they happen.", href: "/services/preventive-maintenance" },
              { title: "Bale Wire Supply", desc: "All gauges, bulk pricing, same-day ship.", href: "/wire" },
            ].map((s) => (
              <Link key={s.href} href={s.href} className="card-dark group hover:border-[#39FF14]/40 transition-all">
                <h3 className="font-bold text-white mb-2 text-sm group-hover:text-[#39FF14] transition-colors">{s.title}</h3>
                <p className="text-xs text-gray-400 mb-3">{s.desc}</p>
                <span className="text-xs text-[#39FF14] flex items-center gap-1 group-hover:gap-2 transition-all">
                  Learn more <ChevronRight size={12} />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────── */}
      <section className="py-20 bg-[#39FF14]">
        <div className="container-site text-center">
          <h2 className="text-3xl font-black text-[#0A0A0A] mb-4">Ready to get your vertical baler fixed?</h2>
          <p className="text-[#0A0A0A]/70 mb-8">Call now or submit a quote — same-day service available across the Southeast.</p>
          <a href="tel:+18004226348" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#0A0A0A] text-white font-bold rounded-md text-base hover:bg-black transition-colors">
            <Phone size={18} /> Call 1-800-4BANDIT
          </a>
        </div>
      </section>
    </>
  );
}
