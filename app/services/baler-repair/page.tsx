import type { Metadata } from "next";
import Link from "next/link";
import { Phone, Wrench, CheckCircle, ChevronRight, Clock, Shield, Zap, AlertTriangle } from "lucide-react";
import QuoteForm from "@/components/QuoteForm";

export const metadata: Metadata = {
  title: "Baler Repair Service — All Makes & Models | Nationwide",
  description:
    "Professional baler repair for vertical and horizontal balers nationwide. Hydraulic, electrical, and structural repairs. 24/7 emergency dispatch available.",
  keywords: ["baler repair", "baler repair nationwide", "vertical baler repair", "horizontal baler repair", "hydraulic baler repair", "baler service"],
};

const MAKES = [
  "Harris", "International Baler", "Maren", "Balemaster",
  "Macpresse", "PTR Baler", "Pakrite", "Harmony",
  "American Baler", "Sennebogen", "Bollegraaf", "Mil-tek",
];

const REPAIR_TYPES = [
  {
    icon: Wrench,
    title: "Hydraulic Systems",
    items: ["Cylinder leaks & seals", "Pump replacement", "Valve block repair", "Hose & fitting replacement", "Fluid analysis & flush"],
  },
  {
    icon: Zap,
    title: "Electrical & Controls",
    items: ["PLC diagnostics & repair", "Motor starter replacement", "Control panel troubleshooting", "Safety circuit repair", "Sensor & limit switch replacement"],
  },
  {
    icon: Shield,
    title: "Structural & Mechanical",
    items: ["Ram & door alignment", "Wire tier repair", "Wear plate replacement", "Conveyor belt service", "Frame welding & reinforcement"],
  },
  {
    icon: AlertTriangle,
    title: "Emergency Repairs",
    items: ["24/7 emergency dispatch", "Rapid technician arrival", "All makes & models", "Parts sourcing & expediting", "Temporary fix while parts arrive"],
  },
];

const PROCESS = [
  { step: "01", title: "Call or Submit", desc: "Contact us by phone or submit a quote request. We'll confirm availability and dispatch timing as quickly as we can." },
  { step: "02", title: "Technician Arrives", desc: "Our certified technician arrives on-site with a fully stocked service vehicle. Most common parts are on the truck." },
  { step: "03", title: "Diagnose & Quote", desc: "We perform a full diagnostic and provide a clear written estimate before any work begins. No hidden charges." },
  { step: "04", title: "Repair & Test", desc: "We complete the repair and run the baler through a full test cycle before signing off. You see it work before we leave." },
];

export default function BalerRepairPage() {
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
              <div className="badge-green mb-6">Baler Repair</div>
              <h1 className="text-5xl sm:text-6xl font-black text-white leading-none tracking-tight mb-6">
                Expert Baler Repair,{" "}
                <span className="text-[#39FF14]">Any Make or Model.</span>
              </h1>
              <p className="text-lg text-gray-400 mb-8 max-w-xl leading-relaxed">
                Hydraulic failures, electrical faults, structural damage — our certified technicians fix it right the first time. Serving all 50 states with 24/7 emergency response.
              </p>
              <div className="flex flex-wrap gap-3 mb-10">
                <a href="tel:+18574226348" className="btn-primary">
                  <Phone size={16} /> Call 857-422-6348
                </a>
                <Link href="/services/emergency-repair" className="btn-ghost-green">
                  Emergency Repair <ChevronRight size={16} />
                </Link>
              </div>
              <div className="flex flex-wrap gap-4">
                {["All Makes & Models", "24/7 Emergency", "On-Site Service", "Licensed & Insured"].map((t) => (
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
                title="Request a Repair Quote"
                subtitle="We'll respond as fast as we can. Emergencies escalated immediately."
                ctaLabel="Get My Repair Quote"
                showEquipment
                showUrgency
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── REPAIR TYPES ──────────────────────────────────────────────── */}
      <section className="py-24 bg-[#050505]">
        <div className="container-site">
          <div className="text-center mb-14">
            <div className="badge-green mb-4">What We Fix</div>
            <h2 className="section-heading text-white mb-4">Full-Spectrum Baler Repair</h2>
            <p className="text-gray-400 max-w-xl mx-auto">
              From a leaking hydraulic line to a failed PLC — we carry the expertise and parts to handle every system in your baler.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {REPAIR_TYPES.map((rt) => (
              <div key={rt.title} className="card-dark">
                <div className="w-10 h-10 rounded-lg bg-[#39FF14]/10 flex items-center justify-center mb-4">
                  <rt.icon size={20} className="text-[#39FF14]" />
                </div>
                <h3 className="font-bold text-white mb-3 text-sm">{rt.title}</h3>
                <ul className="space-y-1.5">
                  {rt.items.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-xs text-gray-400">
                      <span className="text-[#39FF14] mt-0.5 shrink-0">›</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PROCESS ────────────────────────────────────────────────────── */}
      <section className="py-24 bg-[#0A0A0A]">
        <div className="container-site">
          <div className="text-center mb-14">
            <div className="badge-green mb-4">How It Works</div>
            <h2 className="section-heading text-white">From Call to Fixed in 4 Steps</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {PROCESS.map((p, i) => (
              <div key={p.step} className="relative">
                {i < PROCESS.length - 1 && (
                  <div className="hidden lg:block absolute top-6 left-full w-full h-px bg-gradient-to-r from-[#39FF14]/30 to-transparent z-0" />
                )}
                <div className="relative z-10">
                  <div className="text-5xl font-black text-[#39FF14]/20 font-mono mb-3">{p.step}</div>
                  <h3 className="font-bold text-white mb-2 text-sm">{p.title}</h3>
                  <p className="text-xs text-gray-400 leading-relaxed">{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BRANDS WE SERVICE ─────────────────────────────────────────── */}
      <section className="py-20 bg-[#050505]">
        <div className="container-site">
          <div className="text-center mb-10">
            <div className="badge-green mb-4">All Makes & Models</div>
            <h2 className="section-heading text-white mb-4">Brands We Service</h2>
            <p className="text-gray-400 max-w-md mx-auto">
              Don't see your make listed? We service virtually every commercial baler on the market. Call us to confirm.
            </p>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3">
            {MAKES.map((make) => (
              <div key={make} className="card-dark text-center py-4 hover:border-[#39FF14]/30 transition-colors">
                <span className="text-xs font-semibold text-gray-300">{make}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── RESPONSE TIMES ────────────────────────────────────────────── */}
      <section className="py-20 bg-[#0A0A0A]">
        <div className="container-site">
          <div className="max-w-3xl mx-auto">
            <div className="card-dark border-[#39FF14]/20">
              <div className="flex items-center gap-3 mb-6">
                <Clock size={20} className="text-[#39FF14]" />
                <h2 className="text-xl font-bold text-white">How We Prioritize</h2>
              </div>
              <div className="space-y-0 divide-y divide-[#1F2937]">
                {[
                  { type: "Emergency — Baler Down", time: "Escalated first", note: "Baler-down calls are our top priority", color: "text-[#39FF14]" },
                  { type: "Urgent — Intermittent Failure", time: "High priority", note: "Next available dispatch", color: "text-yellow-400" },
                  { type: "Standard — Planned Repair", time: "Standard queue", note: "Scheduled at your convenience", color: "text-blue-400" },
                  { type: "Maintenance Visit", time: "Scheduled", note: "Per your service contract schedule", color: "text-gray-300" },
                ].map((r) => (
                  <div key={r.type} className="flex items-center justify-between py-4">
                    <div>
                      <div className="text-sm font-semibold text-white">{r.type}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{r.note}</div>
                    </div>
                    <div className={`text-sm font-bold ${r.color} text-right`}>{r.time}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── BOTTOM CTA ────────────────────────────────────────────────── */}
      <section className="py-20 bg-[#39FF14]">
        <div className="container-site text-center">
          <h2 className="text-3xl sm:text-4xl font-black text-[#0A0A0A] mb-4">
            Baler down right now?
          </h2>
          <p className="text-[#0A0A0A]/70 mb-8 max-w-md mx-auto">
            Every hour offline costs you production. Call now and we'll dispatch a technician today.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a href="tel:+18574226348" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#0A0A0A] text-white font-bold rounded-md text-base hover:bg-black transition-colors">
              <Phone size={18} /> Call 857-422-6348
            </a>
            <Link href="/services/preventive-maintenance" className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-[#0A0A0A] text-[#0A0A0A] font-bold rounded-md text-base hover:bg-[#0A0A0A] hover:text-[#39FF14] transition-colors">
              Prevent Future Downtime
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
