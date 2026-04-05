import Link from "next/link";
import { Phone, Wrench, Shield, Zap, Package, ChevronRight, MapPin, Clock, CheckCircle } from "lucide-react";
import QuoteForm from "@/components/QuoteForm";
import { getSiteStats, getServiceAreas } from "@/lib/supabase";

const SERVICES = [
  {
    icon: Wrench,
    title: "Baler Repair",
    desc: "All makes and models. Hydraulic, electrical, structural — we fix it right the first time.",
    href: "/services/baler-repair",
  },
  {
    icon: Shield,
    title: "Preventive Maintenance",
    desc: "Scheduled maintenance plans to prevent downtime before it happens. Monthly, bi-monthly, or quarterly.",
    href: "/services/preventive-maintenance",
  },
  {
    icon: Zap,
    title: "Equipment Sales & Leasing",
    desc: "New and used vertical and horizontal balers. Flexible leasing options for any budget.",
    href: "/equipment",
  },
  {
    icon: Package,
    title: "Bale Wire Supply",
    desc: "Single loop, double loop, black annealed, and galvanized. Bulk pricing for Southeast distributors.",
    href: "/wire",
  },
];

const STATS_FALLBACK = [
  { stat_key: "repairs_completed", stat_value: 500, display_label: "Repairs Completed" },
  { stat_key: "states_served", stat_value: 6, display_label: "States Served" },
  { stat_key: "avg_response_hours", stat_value: 4, display_label: "Avg Response (hrs)" },
];

const TESTIMONIALS = [
  {
    quote: "Bandit had a technician at our Atlanta facility within 4 hours. Baler was back up same day — we didn't lose a single shift.",
    name: "Marcus T.",
    company: "Regional Distribution Center",
    state: "GA",
  },
  {
    quote: "We switched our wire supplier to Bandit and cut costs by 18%. Same-day shipping on in-stock items is a game changer.",
    name: "Lisa K.",
    company: "Southeast Recycling Co.",
    state: "FL",
  },
  {
    quote: "Our maintenance contract with Bandit has eliminated unplanned downtime. Worth every penny.",
    name: "Derek R.",
    company: "Manufacturing Plant",
    state: "TN",
  },
];

export default async function HomePage() {
  const [stats, areas] = await Promise.allSettled([getSiteStats(), getServiceAreas()]);
  const siteStats = stats.status === "fulfilled" ? stats.value : STATS_FALLBACK;
  const serviceAreas = areas.status === "fulfilled" ? areas.value : [];

  return (
    <>
      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <section className="relative min-h-[90vh] flex items-center bg-[#0A0A0A] overflow-hidden">
        {/* Background grid */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: "linear-gradient(#39FF14 1px, transparent 1px), linear-gradient(90deg, #39FF14 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
        {/* Green glow top-right */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#39FF14]/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="container-site relative py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="badge-green mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-[#39FF14] mr-2 animate-pulse" />
                Southeast US — 24/7 Emergency Service
              </div>

              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white leading-none tracking-tight mb-6">
                Baler Down?{" "}
                <span className="text-[#39FF14]">We Fix It.</span>
              </h1>

              <p className="text-lg text-gray-400 mb-8 max-w-xl leading-relaxed">
                Same-day baler repair and preventive maintenance across the Southeast. All makes and models. Emergency dispatch available around the clock.
              </p>

              <div className="flex flex-wrap gap-3 mb-10">
                <Link href="/services/emergency-repair" className="btn-primary">
                  <Phone size={16} /> Schedule Emergency Repair
                </Link>
                <Link href="/wire" className="btn-secondary">
                  Get Wire Pricing <ChevronRight size={16} />
                </Link>
              </div>

              {/* Trust signals */}
              <div className="flex flex-wrap gap-4">
                {["24/7 Emergency Dispatch", "All Makes & Models", "Southeast US Coverage", "Licensed & Insured"].map((t) => (
                  <div key={t} className="flex items-center gap-1.5 text-xs text-gray-400">
                    <CheckCircle size={13} className="text-[#39FF14]" />
                    {t}
                  </div>
                ))}
              </div>
            </div>

            {/* Quote form */}
            <div className="lg:max-w-md ml-auto w-full">
              <QuoteForm
                formType="service_quote"
                title="Get a Free Quote"
                subtitle="We respond within 2 hours during business hours."
                ctaLabel="Request My Quote"
                showEquipment
                showUrgency
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS BAR ─────────────────────────────────────────────── */}
      <section className="bg-[#39FF14] py-6">
        <div className="container-site">
          <div className="grid grid-cols-3 divide-x divide-[#22C55E]">
            {siteStats.map((s) => (
              <div key={s.stat_key} className="px-6 text-center">
                <div className="text-3xl font-black text-[#0A0A0A]">
                  {s.stat_key === "repairs_completed" ? `${s.stat_value}+` : s.stat_value}
                  {s.stat_key === "avg_response_hours" ? "hr" : ""}
                </div>
                <div className="text-xs font-semibold text-[#0A0A0A]/70 mt-0.5">{s.display_label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SERVICES ──────────────────────────────────────────────── */}
      <section className="py-24 bg-[#0A0A0A]">
        <div className="container-site">
          <div className="text-center mb-14">
            <div className="badge-green mb-4">What We Do</div>
            <h2 className="section-heading text-white mb-4">
              Everything Your Baler Operation Needs
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto">
              From emergency repairs to ongoing wire supply — Bandit is your single partner for the full baler lifecycle.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {SERVICES.map((s) => (
              <Link key={s.href} href={s.href} className="card-dark group hover:border-[#39FF14]/40 transition-all duration-200">
                <div className="w-10 h-10 rounded-lg bg-[#39FF14]/10 flex items-center justify-center mb-4 group-hover:bg-[#39FF14]/20 transition-colors">
                  <s.icon size={20} className="text-[#39FF14]" />
                </div>
                <h3 className="font-bold text-white mb-2 text-sm">{s.title}</h3>
                <p className="text-xs text-gray-400 leading-relaxed mb-4">{s.desc}</p>
                <span className="text-xs text-[#39FF14] font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                  Learn more <ChevronRight size={12} />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <div className="divider-green container-site" />

      {/* ── MEET BANDIT ───────────────────────────────────────────── */}
      <section className="py-24 bg-[#0A0A0A] overflow-hidden">
        <div className="container-site">
          <div className="grid lg:grid-cols-2 gap-16 items-center">

            {/* Mascot */}
            <div className="flex justify-center lg:justify-start">
              <div className="relative">
                {/* Glow ring behind character */}
                <div className="absolute inset-0 rounded-full bg-[#39FF14]/5 blur-3xl scale-110" />
                <img
                  src="/bandit-face.png"
                  alt="Bandit the Raccoon"
                  className="relative w-64 h-auto drop-shadow-[0_0_60px_rgba(57,255,20,0.3)]"
                />
                {/* Speech bubble */}
                <div className="absolute -top-6 -right-4 lg:-right-16 bg-[#39FF14] text-[#0A0A0A] text-xs font-black px-4 py-3 rounded-2xl rounded-bl-sm max-w-[180px] leading-snug shadow-lg">
                  "Keep recyclables OUT of my dumpster."
                  <div className="absolute bottom-0 left-6 translate-y-full w-0 h-0 border-x-8 border-x-transparent border-t-8 border-t-[#39FF14]" />
                </div>
              </div>
            </div>

            {/* Story */}
            <div>
              <div className="badge-green mb-4">Meet Bandit</div>
              <h2 className="section-heading text-white mb-6">
                Why does a raccoon run a recycling company?
              </h2>
              <div className="space-y-4 text-gray-400 leading-relaxed">
                <p>
                  Bandit has a problem. He and his crew depend on dumpsters. But when businesses skip proper recycling, their cardboard, plastic film, and scrap metal end up filling the dumpsters Bandit calls home — leaving no room for the actually useful stuff.
                </p>
                <p>
                  Every bale your operation produces is a load of recyclable material that <span className="text-white font-semibold">doesn&apos;t</span> end up in a landfill, a dumpster, or the side of a road. It becomes a commodity. It has value. It feeds the circular economy — and it keeps Bandit&apos;s dumpsters clear.
                </p>
                <p>
                  His mission: keep your baler running so recyclables stay where they belong. He&apos;s not doing it for the planet. He&apos;s doing it for the dumpsters. But hey — the result is the same.
                </p>
              </div>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/about" className="btn-ghost-green">
                  Bandit&apos;s Full Story <ChevronRight size={16} />
                </Link>
                <Link href="/services/baler-repair" className="btn-secondary">
                  Our Services
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      <div className="divider-green container-site" />

      {/* ── EMERGENCY CTA ─────────────────────────────────────────── */}
      <section className="py-20 bg-[#0A0A0A]">
        <div className="container-site">
          <div className="card-dark border-[#39FF14]/30 text-center max-w-3xl mx-auto py-12">
            <div className="w-16 h-16 rounded-full bg-[#39FF14]/10 border border-[#39FF14]/30 flex items-center justify-center mx-auto mb-6">
              <Phone size={28} className="text-[#39FF14]" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-3">
              Baler Down Right Now?
            </h2>
            <p className="text-gray-400 mb-8 max-w-md mx-auto">
              Every hour of downtime costs you money. Call our emergency line and we&apos;ll dispatch a technician today.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a href="tel:+18574226348" className="btn-primary text-base px-8 py-4">
                <Phone size={18} /> Call 857-422-6348
              </a>
              <Link href="/services/emergency-repair" className="btn-ghost-green text-base px-8 py-4">
                Emergency Repair Info
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── SERVICE AREA ──────────────────────────────────────────── */}
      <section className="py-24 bg-[#050505]">
        <div className="container-site">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="badge-green mb-4">Coverage Map</div>
              <h2 className="section-heading text-white mb-4">
                Serving the Southeast, State by State
              </h2>
              <p className="text-gray-400 mb-8">
                Regional technician network across all major metros. We dispatch from within your state — not from across the country.
              </p>
              <div className="grid grid-cols-2 gap-3 mb-8">
                {(serviceAreas.length > 0 ? serviceAreas : [
                  { state: "Georgia", state_code: "GA", cities: ["Atlanta", "Savannah"] },
                  { state: "Florida", state_code: "FL", cities: ["Jacksonville", "Miami"] },
                  { state: "Alabama", state_code: "AL", cities: ["Birmingham", "Montgomery"] },
                  { state: "South Carolina", state_code: "SC", cities: ["Columbia", "Charleston"] },
                  { state: "North Carolina", state_code: "NC", cities: ["Charlotte", "Raleigh"] },
                  { state: "Tennessee", state_code: "TN", cities: ["Nashville", "Memphis"] },
                ]).map((a) => (
                  <Link
                    key={a.state_code}
                    href={`/service-area/${a.state.toLowerCase().replace(" ", "-")}`}
                    className="flex items-center gap-3 p-3 rounded-lg bg-[#111111] border border-[#1F2937] hover:border-[#39FF14]/30 transition-all group"
                  >
                    <div className="text-xs font-mono font-bold text-[#39FF14] w-7">{a.state_code}</div>
                    <div>
                      <div className="text-xs font-semibold text-white">{a.state}</div>
                      <div className="text-[10px] text-gray-500">{a.cities.slice(0, 2).join(", ")}</div>
                    </div>
                    <ChevronRight size={12} className="ml-auto text-gray-600 group-hover:text-[#39FF14] transition-colors" />
                  </Link>
                ))}
              </div>
              <Link href="/service-area" className="btn-ghost-green inline-flex">
                <MapPin size={14} /> View Full Service Area
              </Link>
            </div>
            <div className="card-dark">
              <div className="flex items-center gap-2 mb-4">
                <Clock size={16} className="text-[#39FF14]" />
                <span className="text-sm font-semibold text-white">Response Time Guarantee</span>
              </div>
              <div className="space-y-3">
                {[
                  { type: "Emergency Dispatch", time: "Same day", color: "text-[#39FF14]" },
                  { type: "Urgent Service", time: "Within 24 hours", color: "text-yellow-400" },
                  { type: "Standard Repair", time: "Within 48 hours", color: "text-blue-400" },
                  { type: "Maintenance Visit", time: "Scheduled", color: "text-gray-300" },
                ].map((r) => (
                  <div key={r.type} className="flex items-center justify-between py-3 border-b border-[#1F2937] last:border-0">
                    <span className="text-sm text-gray-400">{r.type}</span>
                    <span className={`text-sm font-bold ${r.color}`}>{r.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ──────────────────────────────────────────── */}
      <section className="py-24 bg-[#0A0A0A]">
        <div className="container-site">
          <div className="text-center mb-14">
            <div className="badge-green mb-4">Customer Stories</div>
            <h2 className="section-heading text-white">Trusted by Operations Teams Across the Southeast</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="card-dark flex flex-col">
                <div className="text-[#39FF14] text-2xl font-serif mb-3">&ldquo;</div>
                <p className="text-sm text-gray-300 leading-relaxed flex-1 mb-6">{t.quote}</p>
                <div className="flex items-center gap-3 pt-4 border-t border-[#1F2937]">
                  <div className="w-8 h-8 rounded-full bg-[#39FF14]/20 flex items-center justify-center text-xs font-bold text-[#39FF14]">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">{t.name}</div>
                    <div className="text-xs text-gray-500">{t.company} · {t.state}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
