import type { Metadata } from "next";
import Link from "next/link";
import { Phone, Package, ChevronRight, CheckCircle, Truck, RefreshCw, Shield, Zap, Star, Wrench } from "lucide-react";
import QuoteForm from "@/components/QuoteForm";

export const metadata: Metadata = {
  title: "Bale Wire Supply — Box Wire, Single & Double Loop | Southeast US",
  description:
    "Auto-tie box wire, single loop, and double loop bale ties for vertical and horizontal balers. Black annealed and galvanized. Delivered fast across the Southeast. Get a quote today.",
  keywords: [
    "bale wire", "baling wire Southeast", "auto-tie box wire", "single loop bale ties",
    "double loop bale ties", "black annealed baling wire", "galvanized bale wire",
    "baling wire Georgia", "baling wire Florida", "recycling wire supply",
  ],
};

const WIRE_TYPES = [
  {
    id: "auto-tie",
    name: "Auto-Tie Box Wire",
    tag: "Most Popular",
    tagColor: "bg-[#39FF14] text-[#0A0A0A]",
    description:
      "Continuous coiled wire designed for automatic horizontal single-ram balers. Feeds smoothly through wire guides with zero snags. Available in 50 lb and 100 lb boxes.",
    gauges: ["9 gauge", "10 gauge", "11 gauge", "12 gauge"],
    finishes: ["Black Annealed", "Galvanized"],
    packaging: ["50 lb box (45 boxes/pallet)", "100 lb box (36 boxes/pallet)"],
    bestFor: ["Horizontal auto-tie balers", "High-volume cardboard recycling", "OCC / paper recycling operations"],
    icon: "🔄",
  },
  {
    id: "single-loop",
    name: "Single Loop Bale Ties",
    tag: "Vertical Balers",
    tagColor: "bg-[#1a1a1a] text-[#39FF14] border border-[#39FF14]/40",
    description:
      "Pre-cut wire with a formed loop on one end for fast manual tying. The workhorse for retail backroom vertical balers. Available in multiple lengths to match your bale size.",
    gauges: ["11 gauge", "12 gauge", "13 gauge", "14 gauge"],
    finishes: ["Black Annealed"],
    packaging: ["Standard box (approx. 100 ties)", "Half-pallet & full-pallet quantities"],
    bestFor: ["Vertical balers (retail, grocery, distribution)", "Manual tying operations", "Cardboard, plastic film, textiles"],
    icon: "〰️",
  },
  {
    id: "double-loop",
    name: "Double Loop Bale Ties",
    tag: "Heavy Duty",
    tagColor: "bg-[#1a1a1a] text-[#39FF14] border border-[#39FF14]/40",
    description:
      "Square-lock double loop ties for heavy-duty applications and dense material bales. Fast feeding, superior tensile strength. Ideal when bales need to hold tight through rough handling.",
    gauges: ["9 gauge", "10 gauge", "11 gauge", "12 gauge", "13 gauge", "14 gauge"],
    finishes: ["Black Annealed", "Galvanized"],
    packaging: ["Standard box quantities", "Pallet pricing available"],
    bestFor: ["Industrial recycling operations", "Metal, tire, and dense material baling", "High-compression horizontal balers"],
    icon: "🔗",
  },
];

const MATERIALS = [
  {
    name: "Black Annealed",
    hex: "#222",
    border: "border-gray-700",
    pros: [
      "Highly flexible — fewer kinks and breaks during feeding",
      "Light oil coating for smooth baler pass-through",
      "Most popular finish for cardboard and paper recycling",
      "Cost-effective for high-volume operations",
    ],
    bestFor: "OCC, paper, plastic film, cardboard recycling",
  },
  {
    name: "Galvanized",
    hex: "#888",
    border: "border-[#39FF14]/30",
    pros: [
      "Zinc coating resists rust, corrosion, and moisture",
      "Longer lifespan in outdoor or humid environments",
      "Ideal when bales are stored outside before pickup",
      "Preferred for metals, tires, and e-waste baling",
    ],
    bestFor: "Metals, tires, e-waste, outdoor bale storage",
  },
];

const BALER_GUIDE = [
  {
    balerType: "Vertical Baler (Manual Tie)",
    examples: "Harris V-Series, Maren, Pakrite, Mil-tek 200–500",
    wireType: "Single Loop Bale Ties",
    gauge: "11–13 gauge",
    finish: "Black Annealed",
    notes: "Match tie length to your bale width + 18–24\". Ask us if unsure.",
  },
  {
    balerType: "Horizontal Auto-Tie Baler",
    examples: "Harris HRB, Balemaster, International Baler, PTR",
    wireType: "Auto-Tie Box Wire",
    gauge: "11–12 gauge",
    finish: "Black Annealed or Galvanized",
    notes: "Verify box diameter fits your wire guides. We'll confirm before shipping.",
  },
  {
    balerType: "Two-Ram Baler",
    examples: "Harris Two-Ram, Bollegraaf, Macpresse",
    wireType: "Double Loop Bale Ties",
    gauge: "9–11 gauge",
    finish: "Black Annealed or Galvanized",
    notes: "High-density bales require heavier gauge. Call for sizing help.",
  },
  {
    balerType: "Closed-Door / Vertical Auto-Tie",
    examples: "Harmony, American Baler, Maren Auto",
    wireType: "Auto-Tie Box Wire",
    gauge: "11–12 gauge",
    finish: "Black Annealed",
    notes: "Same coil format as horizontal auto-tie. Gauge may vary by model.",
  },
];

const WHY_BANDIT = [
  {
    icon: Wrench,
    title: "Wire Matched to Your Baler",
    body: "We repair balers for a living — which means we know exactly which gauge, finish, and format works in your machine. Generic wire sites guess. We know.",
  },
  {
    icon: Truck,
    title: "Fast Southeast Delivery",
    body: "Regional distribution means you're not waiting a week for a pallet. Most Southeast orders ship same or next business day.",
  },
  {
    icon: RefreshCw,
    title: "Auto-Replenish with PM Visits",
    body: "Bundle your wire delivery with your preventive maintenance schedule. We drop a pallet when we service your baler — no separate purchase order needed.",
  },
  {
    icon: Shield,
    title: "Compatibility Guarantee",
    body: "If wire we recommend doesn't feed cleanly in your baler, we'll make it right. No restocking fees, no runaround.",
  },
  {
    icon: Zap,
    title: "Emergency Wire Restocking",
    body: "Ran out mid-shift? Call us. If you're in our service area and we have stock, we'll get wire to you fast. Downtime costs more than expedited delivery.",
  },
  {
    icon: Star,
    title: "Volume Pricing, No Games",
    body: "The more you buy, the better the rate — and we'll tell you exactly what the break points are upfront. Pallet pricing, standing order discounts, and account terms available.",
  },
];

const FAQS = [
  {
    q: "How do I know what gauge wire I need?",
    a: "Gauge is determined by your baler model and material density. Heavier gauge (lower number) = stronger wire. For vertical balers tying cardboard, 12–13 gauge is common. For horizontal auto-tie balers, 11–12 gauge is standard. Call us with your baler model and we'll confirm the right spec.",
  },
  {
    q: "What's the difference between black annealed and galvanized?",
    a: "Black annealed wire is soft, flexible, and great for indoor operations — it's the most popular finish for cardboard and paper recycling. Galvanized wire has a zinc coating that resists rust, making it the right choice when bales sit outside or in humid environments, or for metals and tire baling.",
  },
  {
    q: "What's the minimum order?",
    a: "We sell by the box (50 lb or 100 lb) with no strict minimums for new customers. Volume pricing starts at half-pallet quantities. For standing accounts, we can set up monthly delivery schedules with pallet-level pricing.",
  },
  {
    q: "Do you ship outside the Southeast?",
    a: "Our primary focus is the Southeast US where we offer the fastest delivery and best pricing. We can quote freight for other regions — contact us and we'll see what we can do.",
  },
  {
    q: "Can I get wire delivered when you service my baler?",
    a: "Absolutely — and this is one of our favorite things to set up. If you're on a PM plan, we can bring your wire supply on the same visit. One truck, one invoice, zero coordination headache.",
  },
];

export default function WirePage() {
  return (
    <>
      {/* ── HERO ──────────────────────────────────────────────────────── */}
      <section className="relative min-h-[65vh] flex items-center bg-[#0A0A0A] overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(#39FF14 1px, transparent 1px), linear-gradient(90deg, #39FF14 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#39FF14]/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="container-site relative py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="badge-green mb-6">Bale Wire Supply</div>
              <h1 className="text-5xl sm:text-6xl font-black text-white leading-none tracking-tight mb-6">
                The Right Wire for{" "}
                <span className="text-[#39FF14]">Your Baler.</span>
              </h1>
              <p className="text-lg text-gray-400 mb-8 max-w-xl leading-relaxed">
                Auto-tie box wire, single loop, and double loop bale ties — matched to your baler model, delivered fast across the Southeast. From the team that fixes balers for a living.
              </p>
              <div className="flex flex-wrap gap-3 mb-10">
                <a href="tel:+18004226348" className="btn-primary">
                  <Phone size={16} /> Get a Wire Quote
                </a>
                <Link href="#wire-types" className="btn-ghost-green">
                  Browse Wire Types <ChevronRight size={16} />
                </Link>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-3 gap-4 pt-8 border-t border-white/10">
                {[
                  { val: "3", label: "Wire formats" },
                  { val: "9–14", label: "Gauge range" },
                  { val: "1–2", label: "Day SE delivery" },
                ].map((s) => (
                  <div key={s.label}>
                    <div className="text-3xl font-black text-[#39FF14]">{s.val}</div>
                    <div className="text-sm text-gray-500 mt-0.5">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Hero visual — wire diagram */}
            <div className="hidden lg:flex justify-center items-center">
              <div className="relative w-80 h-80">
                <div className="absolute inset-0 rounded-full bg-[#39FF14]/5 blur-3xl" />
                <div className="relative w-full h-full rounded-full border border-[#39FF14]/20 flex items-center justify-center">
                  <div className="text-center">
                    <Package size={80} className="text-[#39FF14]/40 mx-auto mb-4" />
                    <p className="text-white/40 text-sm font-mono uppercase tracking-widest">
                      50 lb &amp; 100 lb boxes
                    </p>
                    <p className="text-white/20 text-xs mt-1">50 lb — 45/pallet · 100 lb — 36/pallet</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TRUST BAR ─────────────────────────────────────────────────── */}
      <div className="bg-[#111] border-y border-white/5 py-5">
        <div className="container-site">
          <div className="flex flex-wrap justify-center gap-x-10 gap-y-3 text-sm text-gray-400">
            {[
              "✓ Baler-matched wire recommendations",
              "✓ Same/next-day Southeast shipping",
              "✓ Volume & pallet pricing",
              "✓ Compatibility guarantee",
              "✓ Bundle with PM service visits",
            ].map((t) => (
              <span key={t}>{t}</span>
            ))}
          </div>
        </div>
      </div>

      {/* ── WIRE TYPES ────────────────────────────────────────────────── */}
      <section id="wire-types" className="py-24 bg-[#0A0A0A]">
        <div className="container-site">
          <div className="text-center mb-16">
            <h2 className="section-heading">
              Wire Types &amp; Formats
            </h2>
            <p className="text-gray-400 mt-4 max-w-2xl mx-auto">
              Three formats covering every baler type. Tell us your machine and material, and we'll point you to the right spec.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {WIRE_TYPES.map((wire) => (
              <div key={wire.id} className="card-dark flex flex-col">
                <div className="flex items-start justify-between mb-4">
                  <span className="text-3xl">{wire.icon}</span>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${wire.tagColor}`}>
                    {wire.tag}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{wire.name}</h3>
                <p className="text-gray-400 text-sm leading-relaxed mb-6">{wire.description}</p>

                <div className="space-y-4 flex-1">
                  <div>
                    <p className="text-xs font-semibold text-[#39FF14] uppercase tracking-wider mb-2">Available Gauges</p>
                    <div className="flex flex-wrap gap-2">
                      {wire.gauges.map((g) => (
                        <span key={g} className="text-xs bg-white/5 text-white/70 px-2 py-1 rounded">
                          {g}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-[#39FF14] uppercase tracking-wider mb-2">Finishes</p>
                    <div className="flex gap-2">
                      {wire.finishes.map((f) => (
                        <span key={f} className="text-xs bg-white/5 text-white/70 px-2 py-1 rounded">
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-[#39FF14] uppercase tracking-wider mb-2">Best For</p>
                    <ul className="space-y-1">
                      {wire.bestFor.map((b) => (
                        <li key={b} className="flex items-start gap-2 text-xs text-gray-400">
                          <CheckCircle size={12} className="text-[#39FF14] mt-0.5 shrink-0" />
                          {b}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-[#39FF14] uppercase tracking-wider mb-2">Packaging</p>
                    <ul className="space-y-1">
                      {wire.packaging.map((p) => (
                        <li key={p} className="text-xs text-gray-500">{p}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <Link
                  href="/quote?service=wire"
                  className="btn-ghost-green w-full justify-center mt-6"
                >
                  Get Quote for {wire.name} <ChevronRight size={14} />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="divider-green" />

      {/* ── MATERIAL COMPARISON ───────────────────────────────────────── */}
      <section className="py-24 bg-[#050505]">
        <div className="container-site">
          <div className="text-center mb-16">
            <h2 className="section-heading">Black Annealed vs. Galvanized</h2>
            <p className="text-gray-400 mt-4 max-w-xl mx-auto">
              The finish affects performance, lifespan, and cost. Here's how to choose.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {MATERIALS.map((mat) => (
              <div key={mat.name} className={`card-dark border ${mat.border}`}>
                <div className="flex items-center gap-3 mb-6">
                  <div
                    className="w-8 h-8 rounded-full border border-white/20"
                    style={{ backgroundColor: mat.hex }}
                  />
                  <h3 className="text-xl font-bold text-white">{mat.name}</h3>
                </div>
                <ul className="space-y-3 mb-6">
                  {mat.pros.map((p) => (
                    <li key={p} className="flex items-start gap-2 text-sm text-gray-300">
                      <CheckCircle size={14} className="text-[#39FF14] mt-0.5 shrink-0" />
                      {p}
                    </li>
                  ))}
                </ul>
                <div className="pt-4 border-t border-white/10">
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Best for</p>
                  <p className="text-sm text-white/70">{mat.bestFor}</p>
                </div>
              </div>
            ))}
          </div>

          <p className="text-center text-gray-500 text-sm mt-8">
            Not sure which finish your operation needs?{" "}
            <a href="tel:+18004226348" className="text-[#39FF14] hover:underline">
              Call us
            </a>{" "}
            — we'll ask three questions and tell you exactly what to order.
          </p>
        </div>
      </section>

      {/* ── BALER COMPATIBILITY GUIDE ─────────────────────────────────── */}
      <section className="py-24 bg-[#0A0A0A]">
        <div className="container-site">
          <div className="text-center mb-16">
            <div className="badge-green mx-auto mb-4">Wire × Baler Guide</div>
            <h2 className="section-heading">Which Wire for Which Baler?</h2>
            <p className="text-gray-400 mt-4 max-w-2xl mx-auto">
              Generic wire suppliers give you a catalog. We give you a recommendation based on your actual equipment. Use this guide as a starting point — or just call us.
            </p>
          </div>

          <div className="overflow-x-auto rounded-xl border border-white/10">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#111] border-b border-white/10">
                  <th className="text-left px-5 py-4 text-gray-400 font-semibold">Baler Type</th>
                  <th className="text-left px-5 py-4 text-gray-400 font-semibold hidden md:table-cell">Common Makes</th>
                  <th className="text-left px-5 py-4 text-gray-400 font-semibold">Wire Format</th>
                  <th className="text-left px-5 py-4 text-gray-400 font-semibold">Gauge</th>
                  <th className="text-left px-5 py-4 text-gray-400 font-semibold hidden lg:table-cell">Finish</th>
                </tr>
              </thead>
              <tbody>
                {BALER_GUIDE.map((row, i) => (
                  <tr
                    key={row.balerType}
                    className={`border-b border-white/5 ${i % 2 === 0 ? "bg-[#0A0A0A]" : "bg-[#0d0d0d]"}`}
                  >
                    <td className="px-5 py-4">
                      <p className="text-white font-medium">{row.balerType}</p>
                      <p className="text-gray-500 text-xs mt-0.5 md:hidden">{row.examples}</p>
                    </td>
                    <td className="px-5 py-4 text-gray-400 hidden md:table-cell">{row.examples}</td>
                    <td className="px-5 py-4">
                      <span className="text-[#39FF14] font-medium">{row.wireType}</span>
                    </td>
                    <td className="px-5 py-4 text-white/70">{row.gauge}</td>
                    <td className="px-5 py-4 text-white/70 hidden lg:table-cell">{row.finish}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 p-4 bg-[#111] rounded-lg border border-[#39FF14]/10">
            <p className="text-sm text-gray-400">
              <span className="text-[#39FF14] font-semibold">Bandit tip:</span> Tie length for single-loop bale ties should equal your bale width plus 18–24 inches for overlap. Always verify against your baler's spec sheet or contact us — ordering wrong-length ties is the #1 wire purchasing mistake we see.
            </p>
          </div>
        </div>
      </section>

      <div className="divider-green" />

      {/* ── WHY BANDIT WIRE ───────────────────────────────────────────── */}
      <section className="py-24 bg-[#050505]">
        <div className="container-site">
          <div className="text-center mb-16">
            <h2 className="section-heading">
              Why Get Wire from{" "}
              <span className="text-[#39FF14]">Bandit?</span>
            </h2>
            <p className="text-gray-400 mt-4 max-w-xl mx-auto">
              We're not a wire catalog. We're a baler company that also sells wire — which means our recommendations come from the shop floor, not a product listing.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {WHY_BANDIT.map(({ icon: Icon, title, body }) => (
              <div key={title} className="card-dark">
                <div className="w-10 h-10 rounded-lg bg-[#39FF14]/10 flex items-center justify-center mb-4">
                  <Icon size={20} className="text-[#39FF14]" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────────────── */}
      <section className="py-24 bg-[#0A0A0A]">
        <div className="container-site max-w-3xl">
          <h2 className="section-heading text-center mb-16">Wire FAQ</h2>
          <div className="space-y-4">
            {FAQS.map((faq) => (
              <div key={faq.q} className="card-dark">
                <h3 className="text-white font-semibold mb-2">{faq.q}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── QUOTE FORM ────────────────────────────────────────────────── */}
      <section className="py-24 bg-[#050505]">
        <div className="container-site">
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            <div>
              <div className="badge-green mb-6">Get a Wire Quote</div>
              <h2 className="text-4xl font-black text-white mb-4">
                Tell us your baler. <br />
                <span className="text-[#39FF14]">We'll spec the wire.</span>
              </h2>
              <p className="text-gray-400 mb-8 leading-relaxed">
                Submit your request and we'll come back with a wire recommendation, pricing, and delivery timeline — usually within a few hours during business hours.
              </p>
              <div className="space-y-4">
                {[
                  "Baler model matched to wire spec",
                  "Volume pricing at half-pallet and pallet quantities",
                  "Delivery timeline for your area",
                  "Option to bundle with PM service visit",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <CheckCircle size={16} className="text-[#39FF14] shrink-0" />
                    <span className="text-gray-300 text-sm">{item}</span>
                  </div>
                ))}
              </div>

              <div className="mt-10 p-5 bg-[#111] rounded-xl border border-white/10">
                <p className="text-sm text-white/70 mb-1">Prefer to call?</p>
                <a
                  href="tel:+18004226348"
                  className="text-2xl font-black text-[#39FF14] hover:underline"
                >
                  1-800-4BANDIT
                </a>
                <p className="text-gray-500 text-xs mt-1">Mon–Fri 7am–6pm ET · Sat 8am–2pm ET</p>
              </div>
            </div>

            <QuoteForm
              formType="wire_quote"
              title="Wire Quote Request"
              subtitle="We'll recommend the right wire and pricing for your baler."
              ctaLabel="Request Wire Quote"
              showEquipment
            />
          </div>
        </div>
      </section>

      {/* ── BOTTOM CTA ────────────────────────────────────────────────── */}
      <section className="py-20 bg-[#39FF14]">
        <div className="container-site text-center">
          <h2 className="text-4xl font-black text-[#0A0A0A] mb-4">
            Running low? Don't wait until you're out.
          </h2>
          <p className="text-[#0A0A0A]/70 mb-8 max-w-xl mx-auto">
            Wire shortages stop production. Get on a standing order schedule and we'll make sure you never run dry.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="tel:+18004226348"
              className="bg-[#0A0A0A] text-[#39FF14] font-bold px-8 py-4 rounded-full hover:bg-black transition-colors flex items-center gap-2"
            >
              <Phone size={16} /> Call Now
            </a>
            <Link
              href="/services/preventive-maintenance"
              className="bg-[#0A0A0A]/20 text-[#0A0A0A] font-bold px-8 py-4 rounded-full hover:bg-[#0A0A0A]/30 transition-colors"
            >
              Bundle with PM Service →
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
