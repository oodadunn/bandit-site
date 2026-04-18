import type { Metadata } from "next";
import Link from "next/link";
import { Phone, AlertTriangle, CheckCircle, Clock, Zap, MapPin } from "lucide-react";
import QuoteForm from "@/components/QuoteForm";

export const metadata: Metadata = {
  title: "Emergency Baler Repair — 24/7 Dispatch | Nationwide",
  description:
    "24/7 emergency baler repair nationwide. Rapid technician dispatch when your baler goes down. All makes and models. Call 857-422-6348.",
  keywords: ["emergency baler repair", "baler down", "24 hour baler service", "emergency baler service nationwide"],
};

const SE_STATES = [
  { state: "Georgia", code: "GA", metros: "Atlanta, Savannah, Augusta, Macon" },
  { state: "Florida", code: "FL", metros: "Jacksonville, Tampa, Miami, Orlando" },
  { state: "Alabama", code: "AL", metros: "Birmingham, Huntsville, Montgomery, Mobile" },
  { state: "South Carolina", code: "SC", metros: "Columbia, Charleston, Greenville, Spartanburg" },
  { state: "North Carolina", code: "NC", metros: "Charlotte, Raleigh, Greensboro, Winston-Salem" },
  { state: "Tennessee", code: "TN", metros: "Nashville, Memphis, Knoxville, Chattanooga" },
];

const WHAT_HAPPENS = [
  { step: "01", time: "Step 1", title: "You Call or Submit", desc: "Call 857-422-6348 or submit the emergency form below. A real person answers 24/7." },
  { step: "02", time: "Step 2", title: "Dispatch Confirmed", desc: "We confirm the nearest available technician and provide an ETA. You'll get a text update." },
  { step: "03", time: "Step 3", title: "Technician On-Site", desc: "Our tech arrives with a fully stocked service vehicle and begins diagnosis immediately." },
  { step: "04", time: "Step 4", title: "Back Online", desc: "We work to get you back online as quickly as possible, and test the full cycle before leaving." },
];

const COMMON_EMERGENCIES = [
  "Hydraulic pump failure",
  "Ram won't cycle or retract",
  "Baler won't power on",
  "Wire tie failure / missed ties",
  "Control panel error codes",
  "Oil leaks — hydraulic or gear",
  "Door latch or interlock failure",
  "Motor overload / tripped breakers",
  "Conveyor jam or belt failure",
  "Structural failure / bent ram",
];

export default function EmergencyRepairPage() {
  return (
    <>
      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <section className="relative min-h-[80vh] flex items-center bg-[#0A0A0A] overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: "linear-gradient(#39FF14 1px, transparent 1px), linear-gradient(90deg, #39FF14 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        {/* Urgent pulse glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#39FF14]/3 rounded-full blur-[150px] pointer-events-none animate-pulse" />

        <div className="container-site relative py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-900/30 border border-red-600/40 text-red-400 text-xs font-mono font-medium mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                24/7 Emergency Dispatch Active
              </div>

              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white leading-none tracking-tight mb-6">
                Baler Down?{" "}
                <span className="text-[#39FF14]">We Come to You.</span>
              </h1>

              <p className="text-xl text-gray-300 mb-4 font-semibold">
                24/7 emergency repair nationwide.
              </p>
              <p className="text-lg text-gray-400 mb-8 max-w-xl leading-relaxed">
                Every hour your baler is offline, you&apos;re losing money. Our technicians are on-call around the clock — call us and we&apos;ll escalate and dispatch as fast as we can.
              </p>

              {/* Emergency phone CTA */}
              <a
                href="tel:+18574226348"
                className="flex items-center gap-4 p-5 bg-[#39FF14] rounded-xl hover:bg-[#22C55E] transition-colors group mb-6 max-w-sm"
              >
                <div className="w-12 h-12 rounded-full bg-[#0A0A0A]/20 flex items-center justify-center shrink-0">
                  <Phone size={24} className="text-[#0A0A0A]" />
                </div>
                <div>
                  <div className="text-[#0A0A0A] text-xs font-semibold uppercase tracking-wider">Emergency Line — 24/7</div>
                  <div className="text-[#0A0A0A] text-2xl font-black font-mono tracking-tight">857-422-6348</div>
                </div>
              </a>

              <div className="flex flex-wrap gap-4">
                {["24/7 Real-Person Answer", "Rapid Dispatch", "All 50 States", "All Makes & Models"].map((t) => (
                  <div key={t} className="flex items-center gap-1.5 text-xs text-gray-400">
                    <CheckCircle size={13} className="text-[#39FF14]" />
                    {t}
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:max-w-md ml-auto w-full">
              <QuoteForm
                formType="emergency"
                title="Emergency Repair Request"
                subtitle="Submit now and we'll call you back as fast as we can."
                ctaLabel="Dispatch a Technician"
                showEquipment
                showUrgency
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── WHAT HAPPENS ──────────────────────────────────────────────── */}
      <section className="py-24 bg-[#050505]">
        <div className="container-site">
          <div className="text-center mb-14">
            <div className="badge-green mb-4">The Process</div>
            <h2 className="section-heading text-white mb-4">What Happens After You Call</h2>
            <p className="text-gray-400 max-w-xl mx-auto">
              We've streamlined our emergency dispatch process so you spend less time explaining and more time getting back online.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {WHAT_HAPPENS.map((step, i) => (
              <div key={step.step} className="relative">
                {i < WHAT_HAPPENS.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-full w-full h-px bg-gradient-to-r from-[#39FF14]/30 to-transparent z-0" />
                )}
                <div className="relative z-10 card-dark h-full">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-4xl font-black text-[#39FF14]/20 font-mono">{step.step}</span>
                    <span className="text-xs font-mono text-[#39FF14] bg-[#39FF14]/10 px-2 py-1 rounded">{step.time}</span>
                  </div>
                  <h3 className="font-bold text-white mb-2 text-sm">{step.title}</h3>
                  <p className="text-xs text-gray-400 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── COMMON EMERGENCIES ────────────────────────────────────────── */}
      <section className="py-24 bg-[#0A0A0A]">
        <div className="container-site">
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            <div>
              <div className="badge-green mb-4">Common Issues</div>
              <h2 className="section-heading text-white mb-4">Issues We Solve Every Day</h2>
              <p className="text-gray-400 mb-8">
                If your baler is doing any of the following, we've seen it before and we know how to fix it. Call us or submit the form — don't wait.
              </p>
              <div className="grid grid-cols-1 gap-2">
                {COMMON_EMERGENCIES.map((issue) => (
                  <div key={issue} className="flex items-center gap-3 p-3 bg-[#111111] border border-[#1F2937] rounded-lg hover:border-[#39FF14]/20 transition-colors">
                    <AlertTriangle size={14} className="text-[#39FF14] shrink-0" />
                    <span className="text-sm text-gray-300">{issue}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="card-dark border-[#39FF14]/20">
                <div className="flex items-center gap-3 mb-4">
                  <Clock size={18} className="text-[#39FF14]" />
                  <h3 className="font-bold text-white">How We Prioritize</h3>
                </div>
                <div className="space-y-3">
                  {[
                    { label: "Emergency Dispatch", value: "ASAP", sub: "Baler down calls are escalated first", color: "text-[#39FF14]" },
                    { label: "24/7 Line", value: "Live", sub: "A real person answers any hour", color: "text-[#39FF14]" },
                    { label: "After-Hours Premium", value: "$0", sub: "No extra charge for nights/weekends", color: "text-gray-300" },
                  ].map((r) => (
                    <div key={r.label} className="flex justify-between items-center py-3 border-b border-[#1F2937] last:border-0">
                      <div>
                        <div className="text-sm text-white font-medium">{r.label}</div>
                        <div className="text-xs text-gray-500">{r.sub}</div>
                      </div>
                      <span className={`font-black text-lg ${r.color}`}>{r.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card-dark">
                <div className="flex items-center gap-3 mb-4">
                  <Zap size={18} className="text-[#39FF14]" />
                  <h3 className="font-bold text-white">What's On Our Trucks</h3>
                </div>
                <p className="text-sm text-gray-400 mb-4">
                  Our service vehicles are stocked with the most common baler parts so we can complete most repairs on the first visit.
                </p>
                <div className="grid grid-cols-2 gap-2 text-xs text-gray-400">
                  {["Hydraulic hoses & fittings", "Common seals & O-rings", "Proximity switches", "Motor contactors", "Bale wire (all gauges)", "Wear plates (common sizes)", "Control relays & fuses", "PLC diagnostic tools"].map((p) => (
                    <div key={p} className="flex items-center gap-2">
                      <span className="text-[#39FF14]">·</span>
                      {p}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SERVICE STATES ────────────────────────────────────────────── */}
      <section className="py-20 bg-[#050505]">
        <div className="container-site">
          <div className="text-center mb-10">
            <div className="badge-green mb-4">Coverage Area</div>
            <h2 className="section-heading text-white mb-4">Emergency Coverage by State</h2>
            <p className="text-gray-400 max-w-xl mx-auto">
              We dispatch from within your state — not from a central hub hundreds of miles away.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {SE_STATES.map((s) => (
              <Link
                key={s.code}
                href={`/service-area/${s.state.toLowerCase().replace(" ", "-")}`}
                className="card-dark hover:border-[#39FF14]/40 transition-all group"
              >
                <div className="flex items-center gap-3 mb-2">
                  <MapPin size={14} className="text-[#39FF14]" />
                  <div className="text-xs font-mono font-bold text-[#39FF14]">{s.code}</div>
                  <div className="font-semibold text-white text-sm">{s.state}</div>
                </div>
                <div className="text-xs text-gray-500">{s.metros}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ─────────────────────────────────────────────────── */}
      <section className="py-20 bg-[#0A0A0A]">
        <div className="container-site">
          <div className="card-dark border-[#39FF14]/30 text-center max-w-2xl mx-auto py-12">
            <div className="w-16 h-16 rounded-full bg-[#39FF14]/10 border border-[#39FF14]/30 flex items-center justify-center mx-auto mb-6 animate-pulse">
              <Phone size={28} className="text-[#39FF14]" />
            </div>
            <h2 className="text-3xl font-black text-white mb-3">Don't Wait. Call Now.</h2>
            <p className="text-gray-400 mb-8 max-w-md mx-auto">
              The sooner you call, the sooner we can get you back to production.
            </p>
            <a href="tel:+18574226348" className="btn-primary text-base px-10 py-4">
              <Phone size={18} /> 857-422-6348
            </a>
            <p className="text-xs text-gray-600 mt-4">Available 24 hours a day, 7 days a week</p>
          </div>
        </div>
      </section>
    </>
  );
}
