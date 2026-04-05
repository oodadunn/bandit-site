import type { Metadata } from "next";
import Link from "next/link";
import { Phone, CheckCircle, ChevronRight, Wrench, Shield, Package, Zap } from "lucide-react";

export const metadata: Metadata = {
  title: "About Bandit Recycling — Why a Raccoon Runs a Recycling Company",
  description:
    "Meet Bandit — the recycling-obsessed raccoon behind Southeast US's fastest baler repair and maintenance service. Our story, mission, and why we exist.",
};

const VALUES = [
  {
    icon: Wrench,
    title: "Fix It Right the First Time",
    desc: "No callbacks, no half-measures. Our techs carry the parts, run the diagnostics, and don't leave until your baler cycles cleanly.",
  },
  {
    icon: Shield,
    title: "Prevent Before You Repair",
    desc: "Emergency calls are expensive for everyone. We'd rather put you on a PM schedule that means you never need us urgently.",
  },
  {
    icon: Zap,
    title: "Fast or It Doesn't Count",
    desc: "Response time is everything in an emergency. We measure our success in hours, not days.",
  },
  {
    icon: Package,
    title: "Every Bale Matters",
    desc: "Recyclables in dumpsters and landfills are a failure of infrastructure. A working baler is how you fix that.",
  },
];

const SERVICES_QUICK = [
  { name: "Baler Repair", href: "/services/baler-repair", desc: "All makes & models, on-site" },
  { name: "Emergency Repair", href: "/services/emergency-repair", desc: "24/7, same-day dispatch" },
  { name: "Preventive Maintenance", href: "/services/preventive-maintenance", desc: "Monthly, bi-monthly, quarterly" },
  { name: "Vertical Baler Service", href: "/services/vertical-baler-repair", desc: "Retail, grocery, distribution" },
  { name: "Horizontal Baler Service", href: "/services/horizontal-baler-repair", desc: "Industrial, MRF, fulfillment" },
  { name: "Bale Wire Supply", href: "/wire", desc: "All gauges, bulk pricing" },
];

export default function AboutPage() {
  return (
    <>
      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <section className="relative min-h-[80vh] flex items-center bg-[#0A0A0A] overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: "linear-gradient(#39FF14 1px, transparent 1px), linear-gradient(90deg, #39FF14 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
        {/* Green glow lower left */}
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[#39FF14]/4 rounded-full blur-[150px] pointer-events-none" />

        <div className="container-site relative py-24">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="badge-green mb-6">Our Story</div>
              <h1 className="text-5xl sm:text-6xl font-black text-white leading-none tracking-tight mb-6">
                Why does a raccoon run a{" "}
                <span className="text-[#39FF14]">recycling company?</span>
              </h1>
              <p className="text-xl text-gray-300 mb-4 leading-relaxed">
                Turns out, raccoons are the original recycling advocates — just for completely selfish reasons.
              </p>
              <p className="text-gray-400 leading-relaxed mb-8">
                Bandit Recycling exists to keep baler infrastructure running across the Southeast US, so recyclable material ends up where it belongs: in bales, in commodity markets, and in the circular economy. Not in dumpsters, landfills, or the side of a road.
              </p>
              <div className="flex flex-wrap gap-3">
                <a href="tel:+18004226348" className="btn-primary">
                  <Phone size={16} /> Talk to Our Team
                </a>
                <Link href="/services/baler-repair" className="btn-ghost-green">
                  Our Services <ChevronRight size={16} />
                </Link>
              </div>
            </div>

            {/* Large character illustration */}
            <div className="flex justify-center lg:justify-end">
              <div className="relative">
                <div className="absolute inset-0 bg-[#39FF14]/5 rounded-full blur-3xl scale-125" />
                <img
                  src="/bandit-face.png"
                  alt="Bandit the Raccoon mascot"
                  className="relative w-72 sm:w-80 h-auto drop-shadow-[0_0_80px_rgba(57,255,20,0.25)]"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── THE ACTUAL STORY ──────────────────────────────────────────── */}
      <section className="py-24 bg-[#050505]">
        <div className="container-site">
          <div className="max-w-3xl mx-auto">
            <div className="badge-green mb-6">The Bandit Theory of Recycling</div>
            <h2 className="section-heading text-white mb-10">A raccoon walks into a dumpster...</h2>

            <div className="space-y-8">

              {/* Chapter 1 */}
              <div className="card-dark border-l-2 border-[#39FF14]">
                <div className="text-[#39FF14] text-xs font-mono font-bold mb-3 uppercase tracking-widest">The Problem</div>
                <h3 className="text-white font-bold text-lg mb-3">Recyclables belong in bales. Not dumpsters.</h3>
                <p className="text-gray-400 text-sm leading-relaxed mb-3">
                  Across the Southeast US, billions of pounds of recyclable material — cardboard, plastic film, aluminum, OCC — end up in landfills or general waste streams every year. Not because businesses don't care, but because their equipment fails.
                </p>
                <p className="text-gray-400 text-sm leading-relaxed">
                  A baler that's down isn't a maintenance problem. It's an environmental one. Cardboard piles up in back rooms, gets thrown in dumpsters, ends up in landfills. That's a downstream failure that starts with a hydraulic pump and a slow response time.
                </p>
              </div>

              {/* Raccoon interlude */}
              <div className="flex gap-4 items-start p-5 bg-[#39FF14]/5 border border-[#39FF14]/20 rounded-xl">
                <img
                  src="/bandit-circle.png"
                  alt="Bandit"
                  className="w-12 h-12 shrink-0 mt-1"
                />
                <div>
                  <div className="text-[#39FF14] text-xs font-mono font-bold mb-1">BANDIT SAYS</div>
                  <p className="text-gray-300 text-sm leading-relaxed italic">
                    &ldquo;Look, I&apos;m not going to pretend I care about carbon footprints. I care about dumpsters. And when your cardboard ends up in my dumpster instead of a bale, that&apos;s real estate I&apos;m losing to a flat box that&apos;s not even edible. Keep your baler running. For my sake.&rdquo;
                  </p>
                </div>
              </div>

              {/* Chapter 2 */}
              <div className="card-dark border-l-2 border-[#39FF14]">
                <div className="text-[#39FF14] text-xs font-mono font-bold mb-3 uppercase tracking-widest">The Solution</div>
                <h3 className="text-white font-bold text-lg mb-3">What Bandit Recycling actually does.</h3>
                <p className="text-gray-400 text-sm leading-relaxed mb-3">
                  We&apos;re a B2B baler lifecycle service company. That means we repair broken balers, prevent future breakdowns through scheduled maintenance, supply the bale wire you need to keep running, and sell or lease equipment to operations that need to start baling or upgrade.
                </p>
                <p className="text-gray-400 text-sm leading-relaxed mb-3">
                  We operate across six states in the Southeast US — Georgia, Florida, Alabama, South Carolina, North Carolina, and Tennessee — with technicians dispatched from within your state, not from a hub three hours away.
                </p>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Our customers are retail distribution centers, grocery chains, manufacturing plants, fulfillment centers, recycling facilities, and any other operation that produces significant recyclable waste and depends on baling equipment to manage it.
                </p>
              </div>

              {/* Chapter 3 */}
              <div className="card-dark border-l-2 border-[#39FF14]">
                <div className="text-[#39FF14] text-xs font-mono font-bold mb-3 uppercase tracking-widest">The Mission</div>
                <h3 className="text-white font-bold text-lg mb-3">Infrastructure that keeps the circular economy moving.</h3>
                <p className="text-gray-400 text-sm leading-relaxed mb-3">
                  Recycling doesn&apos;t happen by itself. It happens because someone&apos;s baler is running, someone&apos;s wire didn&apos;t run out, and someone showed up same-day when the hydraulic pump gave out at 3am before a big shipment.
                </p>
                <p className="text-gray-400 text-sm leading-relaxed">
                  We&apos;re building the infrastructure layer that makes recycling reliable — starting with repair and maintenance, expanding into equipment sales, and eventually into a commodity marketplace that connects recyclers with buyers across the region. One bale at a time.
                </p>
              </div>

              {/* Raccoon interlude 2 */}
              <div className="flex gap-4 items-start p-5 bg-[#39FF14]/5 border border-[#39FF14]/20 rounded-xl">
                <img
                  src="/bandit-circle.png"
                  alt="Bandit"
                  className="w-12 h-12 shrink-0 mt-1"
                />
                <div>
                  <div className="text-[#39FF14] text-xs font-mono font-bold mb-1">BANDIT SAYS</div>
                  <p className="text-gray-300 text-sm leading-relaxed italic">
                    &ldquo;I&apos;ve done the math. Every facility that properly bales their waste is a dumpster that&apos;s 40% more useful to me and my crew. I&apos;m not an environmentalist. I&apos;m an opportunist. But my interests and the planet&apos;s interests happen to align here, and I&apos;m comfortable with that.&rdquo;
                  </p>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* ── VALUES ────────────────────────────────────────────────────── */}
      <section className="py-24 bg-[#0A0A0A]">
        <div className="container-site">
          <div className="text-center mb-14">
            <div className="badge-green mb-4">How We Work</div>
            <h2 className="section-heading text-white mb-4">What Bandit stands for</h2>
            <p className="text-gray-400 max-w-xl mx-auto">
              Beyond the raccoon — the actual operating principles behind every service call, PM visit, and wire order.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {VALUES.map((v) => (
              <div key={v.title} className="card-dark">
                <div className="w-10 h-10 rounded-lg bg-[#39FF14]/10 flex items-center justify-center mb-4">
                  <v.icon size={20} className="text-[#39FF14]" />
                </div>
                <h3 className="font-bold text-white mb-2 text-sm">{v.title}</h3>
                <p className="text-xs text-gray-400 leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SERVICES QUICK LINKS ──────────────────────────────────────── */}
      <section className="py-20 bg-[#050505]">
        <div className="container-site">
          <div className="text-center mb-10">
            <div className="badge-green mb-4">What We Offer</div>
            <h2 className="section-heading text-white">The full Bandit lineup</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {SERVICES_QUICK.map((s) => (
              <Link key={s.href} href={s.href} className="card-dark group hover:border-[#39FF14]/40 transition-all flex items-center justify-between">
                <div>
                  <div className="font-bold text-white text-sm mb-0.5 group-hover:text-[#39FF14] transition-colors">{s.name}</div>
                  <div className="text-xs text-gray-500">{s.desc}</div>
                </div>
                <ChevronRight size={16} className="text-gray-600 group-hover:text-[#39FF14] transition-colors shrink-0 ml-4" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── COVERAGE ──────────────────────────────────────────────────── */}
      <section className="py-20 bg-[#0A0A0A]">
        <div className="container-site">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="badge-green mb-4">Where We Operate</div>
              <h2 className="section-heading text-white mb-4">Southeast US — all six states</h2>
              <p className="text-gray-400 mb-6 leading-relaxed">
                We maintain technician networks in Georgia, Florida, Alabama, South Carolina, North Carolina, and Tennessee. When you call for emergency service, we dispatch from within your state — not from across the region.
              </p>
              <p className="text-gray-400 mb-8 leading-relaxed">
                National scaling is on the roadmap. For now, we&apos;re going deep in the Southeast — building the technician depth and parts inventory to deliver on our response time promises before expanding.
              </p>
              <div className="grid grid-cols-3 gap-2">
                {["GA", "FL", "AL", "SC", "NC", "TN"].map((s) => (
                  <div key={s} className="card-dark text-center py-3 hover:border-[#39FF14]/30 transition-colors">
                    <span className="text-sm font-black text-[#39FF14] font-mono">{s}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Stat card */}
            <div className="space-y-4">
              {[
                { label: "Emergency Response", value: "Same Day", sub: "Technician on-site, not just a callback" },
                { label: "Baler Makes Serviced", value: "All", sub: "Vertical, horizontal, every major brand" },
                { label: "States Covered", value: "6", sub: "GA · FL · AL · SC · NC · TN" },
                { label: "Wire Gauges Stocked", value: "All", sub: "Single loop, double loop, black & galvanized" },
              ].map((s) => (
                <div key={s.label} className="card-dark flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold text-white">{s.label}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{s.sub}</div>
                  </div>
                  <div className="text-2xl font-black text-[#39FF14] font-mono ml-4">{s.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ─────────────────────────────────────────────────── */}
      <section className="py-20 bg-[#39FF14]">
        <div className="container-site">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-black text-[#0A0A0A] mb-4">
                Ready to keep your recyclables out of Bandit&apos;s dumpster?
              </h2>
              <p className="text-[#0A0A0A]/70 leading-relaxed">
                Get a quote for baler repair, a preventive maintenance plan, wire supply, or equipment. We&apos;ll respond within 2 hours. Emergencies dispatched immediately.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row lg:flex-col gap-3 lg:items-end">
              <a href="tel:+18004226348" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#0A0A0A] text-white font-bold rounded-md text-base hover:bg-black transition-colors">
                <Phone size={18} /> Call 1-800-4BANDIT
              </a>
              <Link href="/quote" className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-[#0A0A0A] text-[#0A0A0A] font-bold rounded-md text-base hover:bg-[#0A0A0A] hover:text-[#39FF14] transition-colors">
                Get a Free Quote
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
