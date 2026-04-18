import type { Metadata } from "next";
import Link from "next/link";
import { Phone, CheckCircle, ChevronRight, Factory, Recycle, Truck } from "lucide-react";
import QuoteForm from "@/components/QuoteForm";

export const metadata: Metadata = {
  title: "Horizontal Baler Repair Service | Nationwide",
  description:
    "Expert horizontal baler repair for industrial, manufacturing, and recycling operations nationwide. Two-ram, closed-door, and auto-tie balers. 24/7 emergency dispatch.",
  keywords: ["horizontal baler repair", "two ram baler repair", "industrial baler repair", "horizontal baler service nationwide", "auto-tie baler repair"],
};

const INDUSTRIES = [
  { icon: Factory, name: "Manufacturing Plants", desc: "Industrial-scale OCC, plastic, and metal scrap. We service high-tonnage horizontal balers that run 24/7 on production floors." },
  { icon: Recycle, name: "Recycling Centers & MRFs", desc: "Multi-stream balers processing mixed paper, plastics, and fiber. We understand MRF throughput requirements." },
  { icon: Truck, name: "Logistics & Fulfillment", desc: "High-speed e-commerce fulfillment centers processing massive cardboard volume. Downtime costs are enormous — we get there fast." },
];

const BALER_TYPES = [
  {
    type: "Two-Ram Balers",
    desc: "The workhorse of high-volume recycling. We service all two-ram configurations — cross-belt, inline, and rotary styles.",
    repairs: ["Ram seal and cylinder service", "Cross-belt conveyor repair", "Pushers and kickers", "Auto-tie wire system", "PLC programming and diagnostics"],
  },
  {
    type: "Closed-Door (Single-Ram) Balers",
    desc: "Common in mid-volume industrial applications. Fast, reliable, and demanding on hydraulics and wire tie systems.",
    repairs: ["Hydraulic pump and motor service", "Door latch and cylinder repair", "Wire tier alignment and timing", "Control panel diagnostics", "Conveyor and infeed service"],
  },
  {
    type: "Open-End Extrusion Balers",
    desc: "Used in high-speed paper and fiber processing. Complex hydraulic circuits and precise alignment requirements.",
    repairs: ["Knife and cutting system service", "Chamber pressure issues", "Infeed auger repair", "Hydraulic valve and manifold", "Safety door interlocks"],
  },
];

const COMMON_ISSUES = [
  "Ram won't extend or retract fully",
  "Slow cycle times / loss of pressure",
  "Auto-tie wire system missed ties",
  "Conveyor belt failure or tracking issue",
  "Oil contamination or major hydraulic leak",
  "PLC faults and error codes",
  "Motor overloads or electrical faults",
  "Knife or shear bar replacement",
  "Chamber alignment and calibration",
  "Emergency stop won't reset",
];

const MAKES = [
  { make: "Harris", note: "H Series, HRB, Marathon" },
  { make: "Macpresse", note: "MAC, MPC Series" },
  { make: "Bollegraaf", note: "HBC, RAS Series" },
  { make: "Sennebogen", note: "MRF balers" },
  { make: "International Baler", note: "IBC Series" },
  { make: "American Baler", note: "All series" },
  { make: "Maren", note: "CF, HR Series" },
  { make: "Balemaster", note: "All series" },
];

export default function HorizontalBalerRepairPage() {
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
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-[#39FF14]/4 rounded-full blur-[140px] pointer-events-none" />

        <div className="container-site relative py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="badge-green mb-6">Horizontal Baler Repair</div>
              <h1 className="text-5xl sm:text-6xl font-black text-white leading-none tracking-tight mb-6">
                Industrial Baler Repair{" "}
                <span className="text-[#39FF14]">Done Right.</span>
              </h1>
              <p className="text-lg text-gray-400 mb-8 max-w-xl leading-relaxed">
                Two-ram, closed-door, open-end — we repair every type of horizontal baler used in industrial and high-volume recycling operations. Nationwide coverage, 24/7 emergency dispatch.
              </p>
              <div className="flex flex-wrap gap-3 mb-10">
                <a href="tel:+18574226348" className="btn-primary">
                  <Phone size={16} /> Call 857-422-6348
                </a>
                <Link href="/services/emergency-repair" className="btn-ghost-green">
                  Emergency Dispatch <ChevronRight size={16} />
                </Link>
              </div>
              <div className="flex flex-wrap gap-4">
                {["All Horizontal Types", "Two-Ram & Single-Ram", "24/7 Emergency", "All 50 States"].map((t) => (
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
                title="Get a Horizontal Baler Quote"
                subtitle="Tell us your baler type and issue — we'll get back to you quickly."
                ctaLabel="Request Repair Quote"
                showEquipment
                showUrgency
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── BALER TYPES ───────────────────────────────────────────────── */}
      <section className="py-24 bg-[#050505]">
        <div className="container-site">
          <div className="text-center mb-14">
            <div className="badge-green mb-4">Baler Types</div>
            <h2 className="section-heading text-white mb-4">Every Horizontal Baler Type We Service</h2>
            <p className="text-gray-400 max-w-xl mx-auto">
              Horizontal balers are more complex than verticals — more hydraulic circuits, more conveyor systems, more to go wrong. We know them inside and out.
            </p>
          </div>
          <div className="grid lg:grid-cols-3 gap-6">
            {BALER_TYPES.map((bt) => (
              <div key={bt.type} className="card-dark">
                <h3 className="font-bold text-white mb-2 text-sm">{bt.type}</h3>
                <p className="text-xs text-gray-400 mb-4 leading-relaxed">{bt.desc}</p>
                <ul className="space-y-1.5">
                  {bt.repairs.map((r) => (
                    <li key={r} className="flex items-start gap-2 text-xs text-gray-400">
                      <span className="text-[#39FF14] mt-0.5 shrink-0">›</span>
                      {r}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── INDUSTRIES + ISSUES ───────────────────────────────────────── */}
      <section className="py-24 bg-[#0A0A0A]">
        <div className="container-site">
          <div className="grid lg:grid-cols-2 gap-12">
            <div>
              <div className="badge-green mb-4">Who We Serve</div>
              <h2 className="section-heading text-white mb-8">Industries That Rely on Horizontal Balers</h2>
              <div className="space-y-4">
                {INDUSTRIES.map((ind) => (
                  <div key={ind.name} className="card-dark flex gap-4">
                    <div className="w-10 h-10 rounded-lg bg-[#39FF14]/10 flex items-center justify-center shrink-0">
                      <ind.icon size={18} className="text-[#39FF14]" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white mb-1 text-sm">{ind.name}</h3>
                      <p className="text-xs text-gray-400 leading-relaxed">{ind.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div className="badge-green mb-4">Common Issues</div>
              <h2 className="section-heading text-white mb-8">Problems We Fix</h2>
              <div className="grid grid-cols-1 gap-2">
                {COMMON_ISSUES.map((issue) => (
                  <div key={issue} className="flex items-center gap-3 p-3 bg-[#111111] border border-[#1F2937] rounded-lg hover:border-[#39FF14]/20 transition-colors">
                    <span className="text-[#39FF14] font-bold">›</span>
                    <span className="text-sm text-gray-300">{issue}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── MAKES ─────────────────────────────────────────────────────── */}
      <section className="py-20 bg-[#050505]">
        <div className="container-site">
          <div className="text-center mb-10">
            <div className="badge-green mb-4">Brands We Service</div>
            <h2 className="section-heading text-white mb-4">Top Horizontal Baler Makes</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {MAKES.map((m) => (
              <div key={m.make} className="card-dark hover:border-[#39FF14]/30 transition-colors">
                <div className="font-bold text-white text-sm mb-1">{m.make}</div>
                <div className="text-xs text-gray-500 font-mono">{m.note}</div>
              </div>
            ))}
          </div>
          <p className="text-center text-xs text-gray-600 mt-6">
            Don't see your make? <a href="tel:+18574226348" className="text-[#39FF14] hover:underline">Call us</a> — we service virtually all commercial horizontal balers.
          </p>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────── */}
      <section className="py-20 bg-[#39FF14]">
        <div className="container-site text-center">
          <h2 className="text-3xl font-black text-[#0A0A0A] mb-4">Industrial baler issue? Call now.</h2>
          <p className="text-[#0A0A0A]/70 mb-8 max-w-md mx-auto">
            Horizontal baler downtime in a high-volume operation is expensive. We dispatch nationwide, 24/7 — baler-down calls get prioritized.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a href="tel:+18574226348" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#0A0A0A] text-white font-bold rounded-md text-base hover:bg-black transition-colors">
              <Phone size={18} /> Call 857-422-6348
            </a>
            <Link href="/services/preventive-maintenance" className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-[#0A0A0A] text-[#0A0A0A] font-bold rounded-md text-base hover:bg-[#0A0A0A] hover:text-[#39FF14] transition-colors">
              Explore PM Plans
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
