import type { Metadata } from "next";
import Link from "next/link";
import { Phone, Shield, CheckCircle, ChevronRight, Calendar, TrendingDown, DollarSign, ClipboardList } from "lucide-react";
import QuoteForm from "@/components/QuoteForm";

export const metadata: Metadata = {
  title: "Baler Preventive Maintenance Plans | Southeast US",
  description:
    "Scheduled baler maintenance plans designed to eliminate unplanned downtime. Monthly, bi-monthly, and quarterly PM programs for Southeast US operations.",
  keywords: ["baler preventive maintenance", "baler PM plan", "baler maintenance contract", "scheduled baler service", "baler maintenance Southeast US"],
};

const PLANS = [
  {
    name: "Quarterly",
    freq: "Every 3 months",
    price: "From $299/visit",
    badge: null,
    features: [
      "Full hydraulic inspection",
      "Electrical & control check",
      "Ram & door alignment",
      "Lubrication service",
      "Wear component assessment",
      "Written service report",
    ],
    desc: "Best for lower-volume operations or newer equipment in good condition.",
    cta: "Get Quarterly Plan",
  },
  {
    name: "Bi-Monthly",
    freq: "Every 2 months",
    price: "From $249/visit",
    badge: "Most Popular",
    features: [
      "Everything in Quarterly",
      "Hydraulic fluid analysis",
      "Filter inspection & replacement",
      "Wire tier system service",
      "Belt & conveyor check",
      "Parts inventory recommendation",
    ],
    desc: "Ideal for mid-volume operations running 1–2 shifts. Best value for most facilities.",
    cta: "Get Bi-Monthly Plan",
  },
  {
    name: "Monthly",
    freq: "Every month",
    price: "From $199/visit",
    badge: "Best for High Volume",
    features: [
      "Everything in Bi-Monthly",
      "Priority emergency dispatch",
      "Dedicated technician",
      "Parts pre-stocking on-site",
      "Quarterly performance review",
      "10% discount on all repairs",
    ],
    desc: "For high-volume operations running 2–3 shifts where any downtime is critical.",
    cta: "Get Monthly Plan",
  },
];

const CHECKLIST = [
  { category: "Hydraulic System", items: ["Check fluid level and condition", "Inspect all hoses for wear/leaks", "Test pump pressure & flow", "Inspect cylinder seals", "Check valve operation"] },
  { category: "Electrical & Controls", items: ["Test all limit switches", "Inspect motor connections", "Check control panel for fault codes", "Test emergency stop function", "Verify safety interlocks"] },
  { category: "Mechanical", items: ["Lubricate all grease points", "Inspect ram alignment", "Check door latch and hinges", "Inspect wire tier mechanism", "Measure wear on plates"] },
  { category: "Documentation", items: ["Record all measurements", "Photo-document wear items", "Recommend upcoming repairs", "Update service log", "Deliver written report"] },
];

const DOWNTIME_COSTS = [
  { type: "Retail Distribution", downtime: "$500–1,500/hr", note: "Based on cardboard volume lost" },
  { type: "Grocery / Supermarket", downtime: "$800–2,000/hr", note: "Includes labor and compliance costs" },
  { type: "Industrial Manufacturing", downtime: "$1,500–5,000/hr", note: "Production line impact" },
  { type: "Recycling Center", downtime: "$1,000–3,000/hr", note: "Volume and commodity price dependent" },
];

export default function PreventiveMaintenancePage() {
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
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#39FF14]/4 rounded-full blur-[120px] pointer-events-none" />

        <div className="container-site relative py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="badge-green mb-6">Preventive Maintenance</div>
              <h1 className="text-5xl sm:text-6xl font-black text-white leading-none tracking-tight mb-6">
                Stop Reacting.{" "}
                <span className="text-[#39FF14]">Start Preventing.</span>
              </h1>
              <p className="text-lg text-gray-400 mb-8 max-w-xl leading-relaxed">
                Scheduled PM plans that catch small issues before they become costly breakdowns. Monthly, bi-monthly, and quarterly programs designed around your operation's pace.
              </p>
              <div className="flex flex-wrap gap-3 mb-10">
                <Link href="#plans" className="btn-primary">
                  View PM Plans <ChevronRight size={16} />
                </Link>
                <a href="tel:+18574226348" className="btn-ghost-green">
                  <Phone size={16} /> Talk to a Tech
                </a>
              </div>
              <div className="flex flex-wrap gap-4">
                {["Eliminate Unplanned Downtime", "Written Reports Every Visit", "Dedicated Technician", "Southeast US Coverage"].map((t) => (
                  <div key={t} className="flex items-center gap-1.5 text-xs text-gray-400">
                    <CheckCircle size={13} className="text-[#39FF14]" />
                    {t}
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:max-w-md ml-auto w-full">
              <QuoteForm
                formType="maintenance"
                title="Get a Maintenance Quote"
                subtitle="Tell us about your equipment and we'll recommend the right plan."
                ctaLabel="Get My PM Quote"
                showEquipment
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── COST OF DOWNTIME ──────────────────────────────────────────── */}
      <section className="py-16 bg-[#050505]">
        <div className="container-site">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="badge-green mb-4">The Cost of Downtime</div>
              <h2 className="section-heading text-white mb-4">
                How Much Does an Unplanned Breakdown Cost You?
              </h2>
              <p className="text-gray-400 mb-6">
                Most facilities dramatically underestimate the true cost of baler downtime. Beyond the repair bill, you're paying for labor displacement, compliance risk, and commodity revenue lost.
              </p>
              <p className="text-gray-400">
                A quarterly PM plan typically costs less than a single emergency repair call — and prevents the emergency entirely.
              </p>
            </div>
            <div className="card-dark">
              <div className="flex items-center gap-2 mb-5">
                <TrendingDown size={16} className="text-[#39FF14]" />
                <span className="text-sm font-semibold text-white">Estimated Downtime Cost by Operation Type</span>
              </div>
              <div className="space-y-0 divide-y divide-[#1F2937]">
                {DOWNTIME_COSTS.map((d) => (
                  <div key={d.type} className="py-4 flex justify-between items-center">
                    <div>
                      <div className="text-sm font-semibold text-white">{d.type}</div>
                      <div className="text-xs text-gray-500">{d.note}</div>
                    </div>
                    <div className="text-sm font-black text-red-400">{d.downtime}</div>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-3 bg-[#39FF14]/5 border border-[#39FF14]/20 rounded-lg">
                <p className="text-xs text-[#39FF14]">
                  <strong>PM plans start at $199/visit</strong> — typically 10–50x less than a single emergency event.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PLANS ─────────────────────────────────────────────────────── */}
      <section id="plans" className="py-24 bg-[#0A0A0A]">
        <div className="container-site">
          <div className="text-center mb-14">
            <div className="badge-green mb-4">PM Plans</div>
            <h2 className="section-heading text-white mb-4">Choose Your Maintenance Cadence</h2>
            <p className="text-gray-400 max-w-xl mx-auto">
              All plans include written service reports, wear assessments, and priority emergency access. Pricing based on single baler — multi-unit discounts available.
            </p>
          </div>
          <div className="grid lg:grid-cols-3 gap-6">
            {PLANS.map((plan) => (
              <div
                key={plan.name}
                className={`card-dark flex flex-col ${plan.badge === "Most Popular" ? "border-[#39FF14]/50 relative" : ""}`}
              >
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="px-3 py-1 bg-[#39FF14] text-[#0A0A0A] text-xs font-bold rounded-full whitespace-nowrap">
                      {plan.badge}
                    </span>
                  </div>
                )}
                <div className="mb-6">
                  <div className="text-xs font-mono text-[#39FF14] mb-1">{plan.freq}</div>
                  <h3 className="text-2xl font-black text-white mb-1">{plan.name}</h3>
                  <div className="text-sm text-gray-400">{plan.price}</div>
                </div>
                <p className="text-xs text-gray-400 mb-6 leading-relaxed">{plan.desc}</p>
                <ul className="space-y-2 mb-8 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-xs text-gray-300">
                      <CheckCircle size={13} className="text-[#39FF14] mt-0.5 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/quote" className={plan.badge === "Most Popular" ? "btn-primary justify-center" : "btn-ghost-green justify-center"}>
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
          <p className="text-center text-xs text-gray-600 mt-6">
            Multi-unit, multi-location, and custom contracts available. <a href="tel:+18574226348" className="text-[#39FF14] hover:underline">Call us</a> to discuss.
          </p>
        </div>
      </section>

      {/* ── WHAT WE DO ────────────────────────────────────────────────── */}
      <section className="py-24 bg-[#050505]">
        <div className="container-site">
          <div className="text-center mb-14">
            <div className="badge-green mb-4">PM Checklist</div>
            <h2 className="section-heading text-white mb-4">What We Do on Every Visit</h2>
            <p className="text-gray-400 max-w-xl mx-auto">
              Our PM visits follow a standardized 40-point inspection protocol — not a quick once-over.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {CHECKLIST.map((cat, i) => (
              <div key={cat.category} className="card-dark">
                <div className="w-8 h-8 rounded-lg bg-[#39FF14]/10 flex items-center justify-center mb-4">
                  {i === 0 && <Shield size={16} className="text-[#39FF14]" />}
                  {i === 1 && <Zap size={16} className="text-[#39FF14]" />}
                  {i === 2 && <ClipboardList size={16} className="text-[#39FF14]" />}
                  {i === 3 && <Calendar size={16} className="text-[#39FF14]" />}
                </div>
                <h3 className="font-bold text-white mb-3 text-sm">{cat.category}</h3>
                <ul className="space-y-1.5">
                  {cat.items.map((item) => (
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

      {/* ── BOTTOM CTA ────────────────────────────────────────────────── */}
      <section className="py-20 bg-[#0A0A0A]">
        <div className="container-site">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div>
              <div className="badge-green mb-4">Get Started</div>
              <h2 className="section-heading text-white mb-4">
                Ready to Eliminate Unplanned Downtime?
              </h2>
              <p className="text-gray-400 mb-6">
                We'll assess your current baler condition, recommend the right PM frequency, and get you on a schedule that protects your operation.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link href="/quote" className="btn-primary">
                  <DollarSign size={16} /> Get a PM Quote
                </Link>
                <a href="tel:+18574226348" className="btn-ghost-green">
                  <Phone size={16} /> 857-422-6348
                </a>
              </div>
            </div>
            <div className="card-dark border-[#39FF14]/20">
              <h3 className="font-bold text-white mb-4 text-sm">Already have a baler issue?</h3>
              <p className="text-sm text-gray-400 mb-4">
                If your baler needs repair before we can start a PM program, we'll combine the repair visit with an initial assessment at no additional charge.
              </p>
              <Link href="/services/baler-repair" className="text-sm text-[#39FF14] hover:underline flex items-center gap-1">
                Schedule a repair first <ChevronRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

// Import missing icon
import { Zap } from "lucide-react";
