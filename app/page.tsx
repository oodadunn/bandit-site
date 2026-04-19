import Link from "next/link";
import { Phone, ChevronRight, MapPin, Clock } from "lucide-react";
import QuoteForm from "@/components/QuoteForm";
import USMap from "@/components/USMap";
import { getSiteStats } from "@/lib/supabase";

// ── Pinterest masonry: discovery board of services, materials, rigs ─────
const IMG = (f: string) =>
  `https://cerozvtggvwixeyqcgkz.supabase.co/storage/v1/object/public/site-images/${f}`;

type BoardTile =
  | {
      kind: "image";
      img: string;
      eyebrow: string;
      title: string;
      body: string;
      href: string;
      aspect: string;
    }
  | {
      kind: "text";
      eyebrow: string;
      title: string;
      body: string;
      href: string;
    };

const BOARD: BoardTile[] = [
  {
    kind: "image",
    img: IMG("material-corrugated.png"),
    eyebrow: "◢ OCC · Grade 11",
    title: "Baled Cardboard",
    body: "Retail, 3PL, grocery. Every baler we repair moves more of this than anything else.",
    href: "/materials",
    aspect: "4/5",
  },
  {
    kind: "text",
    eyebrow: "◢ Service · 001",
    title: "Baler Down? We Fix It.",
    body: "24/7 dispatch nationwide. All 50 states, all makes, all models. Call one number.",
    href: "/services/emergency-repair",
  },
  {
    kind: "image",
    img: IMG("material-aluminum.png"),
    eyebrow: "◢ UBC · High Tier",
    title: "Aluminum Cans",
    body: "Highest-value baled commodity in the shop. Tight bales, clean loads, fast loadouts.",
    href: "/materials",
    aspect: "1/1",
  },
  {
    kind: "image",
    img: "/vertical-baler.png",
    eyebrow: "◢ Equipment · VB-60",
    title: "Vertical Balers",
    body: "New, used, and lease-to-own. Sized for retail, QSR, and mid-volume back-of-house.",
    href: "/equipment",
    aspect: "3/4",
  },
  {
    kind: "image",
    img: IMG("material-hdpe-plastic.png"),
    eyebrow: "◢ HDPE · #2",
    title: "Baled HDPE",
    body: "Milk jugs, detergent bottles, industrial containers. Premium grade when separated clean.",
    href: "/materials",
    aspect: "4/5",
  },
  {
    kind: "text",
    eyebrow: "◢ Consumables",
    title: "Bale Wire, Cut & Boxed",
    body: "Single loop, double loop, black annealed, galvanized. Bulk pricing — ships anywhere.",
    href: "/wire",
  },
  {
    kind: "image",
    img: IMG("material-ferrous.png"),
    eyebrow: "◢ HMS · Steel",
    title: "Ferrous Scrap",
    body: "Heavy melting steel and shredder feed — pairs with horizontal auto-tie balers.",
    href: "/materials",
    aspect: "1/1",
  },
  {
    kind: "image",
    img: IMG("material-mixed-paper.png"),
    eyebrow: "◢ SMP · Grade 1",
    title: "Sorted Mixed Paper",
    body: "Office paper, envelopes, junk mail. Lower tier, huge volume — the workhorse grade.",
    href: "/materials",
    aspect: "3/4",
  },
  {
    kind: "text",
    eyebrow: "◢ Maintenance",
    title: "Preventive Maintenance",
    body: "Monthly, bi-monthly, or quarterly programs. Catch the failure before the downtime.",
    href: "/services/preventive-maintenance",
  },
  {
    kind: "image",
    img: IMG("material-copper.png"),
    eyebrow: "◢ Bare Bright",
    title: "Copper",
    body: "Top-tier non-ferrous. We broker clean copper scrap alongside service contracts.",
    href: "/materials",
    aspect: "4/5",
  },
];

const TESTIMONIALS = [
  {
    quote: "Bandit got a technician to our Atlanta facility fast and had the baler back up before our next shift. We didn't lose any production.",
    name: "Marcus T.",
    company: "Regional Distribution Center",
    state: "GA",
  },
  {
    quote: "We switched our wire supplier to Bandit and cut costs by 18%. Fast shipping on in-stock items is a game changer.",
    name: "Lisa K.",
    company: "National Recycling Co.",
    state: "FL",
  },
  {
    quote: "Our maintenance contract with Bandit has eliminated unplanned downtime. Worth every penny.",
    name: "Derek R.",
    company: "Manufacturing Plant",
    state: "TN",
  },
  {
    quote: "We're in Ohio and expected slow response — Bandit had someone on-site faster than we thought possible. Impressed doesn't cover it.",
    name: "Rachel M.",
    company: "Midwest Fulfillment Center",
    state: "OH",
  },
  {
    quote: "Bandit handles all three of our West Coast facilities. One contract, one number to call. Makes my job easy.",
    name: "James P.",
    company: "Pacific Distribution Group",
    state: "CA",
  },
  {
    quote: "We needed an emergency repair in rural Texas on a Saturday. Bandit dispatched someone fast. That's unheard of.",
    name: "Hector G.",
    company: "Industrial Recycling Solutions",
    state: "TX",
  },
];

export default async function HomePage() {
  const statsResult = await Promise.allSettled([getSiteStats()]);
  const siteStats =
    statsResult[0].status === "fulfilled"
      ? statsResult[0].value
      : [
          { stat_key: "repairs_completed", stat_value: 500, display_label: "Repairs Completed" },
          { stat_key: "states_served", stat_value: 50, display_label: "States Served" },
          { stat_key: "dispatch_24_7", stat_value: 24, display_label: "Emergency Line (7 days)" },
        ];

  return (
    <>
      {/* ── SCENE 1 · HERO ─────────────────────────────────────────── */}
      <section className="scene scene-grid scene-glow">
        <div className="container-site scene-pad flex flex-col justify-center min-h-[100vh]">
          <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-16 items-center">
            {/* Left: copy */}
            <div>
              <div className="telemetry mb-10">
                <span className="pulse" /> Mission Online · 24/7 Dispatch
              </div>

              <h1 className="hero-heading mb-8" style={{ color: "var(--text-primary)" }}>
                Baler Down.
                <br />
                <span style={{ color: "var(--green-accent)" }}>We Fix It.</span>
              </h1>

              <p
                className="text-base sm:text-lg mb-10 max-w-xl leading-relaxed"
                style={{ color: "var(--text-secondary)" }}
              >
                Nationwide baler service and bale-wire supply in all 50 states. All makes, all
                models. One number answers 24/7 — and the truck rolls as fast as we can get there.
              </p>

              <div className="flex flex-wrap gap-3 mb-14">
                <Link href="/services/emergency-repair" className="btn-primary">
                  <Phone size={14} /> Dispatch a Tech
                </Link>
                <Link href="/wire" className="btn-secondary">
                  Bale Wire Pricing <ChevronRight size={14} />
                </Link>
              </div>

              {/* Stat strip — mono telemetry */}
              <div className="stat-strip">
                {siteStats.map((s) => (
                  <div key={s.stat_key}>
                    <b>
                      {s.stat_key === "repairs_completed" ? `${s.stat_value}+` : s.stat_value}
                      {s.stat_key === "dispatch_24_7" ? "/7" : ""}
                    </b>
                    {s.display_label}
                  </div>
                ))}
              </div>
            </div>

            {/* Right: quote form */}
            <div className="lg:max-w-md lg:ml-auto w-full">
              <QuoteForm
                formType="service_quote"
                title="Request a Dispatch"
                subtitle="Tell us what's down. We'll get back as fast as we can."
                ctaLabel="Send Dispatch Request"
                showEquipment
                showUrgency
              />
            </div>
          </div>
        </div>

        {/* Baler silhouette — far background, low-opacity */}
        <div
          className="absolute bottom-0 right-[-60px] pointer-events-none select-none hidden lg:block"
          style={{ zIndex: 0 }}
          aria-hidden="true"
        >
          <img
            src="/vertical-baler.png"
            alt=""
            className="w-[520px] h-auto opacity-[0.08]"
          />
        </div>
      </section>

      {/* ── SCENE 2 · DISCOVERY BOARD (Pinterest) ──────────────────── */}
      <section className="scene" style={{ background: "var(--bg-secondary)" }}>
        <div className="container-site scene-pad">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 mb-14">
            <div>
              <div className="telemetry mb-5">
                <span className="pulse" /> Operating Surface · 12 Services
              </div>
              <h2 className="section-heading max-w-2xl" style={{ color: "var(--text-primary)" }}>
                Every Commodity.
                <br />
                Every Baler.
                <br />
                <span style={{ color: "var(--green-accent)" }}>One Partner.</span>
              </h2>
            </div>
            <p className="max-w-sm text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              Scroll the board — each tile is something Bandit repairs, supplies, or bales. Click
              through to the materials library, the equipment catalog, or the emergency line.
            </p>
          </div>

          <div className="masonry">
            {BOARD.map((t, i) =>
              t.kind === "image" ? (
                <Link key={i} href={t.href} className="tile group block">
                  <div
                    className="relative w-full overflow-hidden"
                    style={{ aspectRatio: t.aspect, background: "var(--bg-card-hi)" }}
                  >
                    <img
                      src={t.img}
                      alt={t.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                    />
                  </div>
                  <div className="tile-body">
                    <div
                      className="text-[9px] font-bold tracking-[0.3em] uppercase mb-2"
                      style={{ color: "var(--green-accent)", fontFamily: "'JetBrains Mono', monospace" }}
                    >
                      {t.eyebrow}
                    </div>
                    <h3
                      className="text-base font-black uppercase tracking-[0.02em] mb-2"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {t.title}
                    </h3>
                    <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                      {t.body}
                    </p>
                  </div>
                </Link>
              ) : (
                <Link key={i} href={t.href} className="tile tile-text-body group">
                  <div>
                    <div
                      className="text-[9px] font-bold tracking-[0.3em] uppercase mb-3"
                      style={{ color: "var(--green-accent)", fontFamily: "'JetBrains Mono', monospace" }}
                    >
                      {t.eyebrow}
                    </div>
                    <h3
                      className="text-xl font-black uppercase tracking-[0.01em] leading-[1.05] mb-3"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {t.title}
                    </h3>
                    <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                      {t.body}
                    </p>
                  </div>
                  <div
                    className="mt-6 inline-flex items-center gap-1.5 text-[10px] font-bold tracking-[0.25em] uppercase"
                    style={{ color: "var(--green-accent)" }}
                  >
                    Open <ChevronRight size={12} />
                  </div>
                </Link>
              )
            )}
          </div>
        </div>
      </section>

      {/* ── SCENE 3 · MEET BANDIT ──────────────────────────────────── */}
      <section className="scene scene-glow" style={{ background: "var(--bg-primary)" }}>
        <div className="container-site scene-pad flex items-center min-h-[95vh]">
          <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-16 items-center w-full">
            {/* Mascot */}
            <div className="flex justify-center lg:justify-start relative">
              <div
                className="absolute inset-0 rounded-full blur-3xl scale-110 opacity-70"
                style={{ background: "var(--green-bg)" }}
                aria-hidden="true"
              />
              <img
                src="/bandit-face.png"
                alt="Bandit the Raccoon"
                className="relative w-72 sm:w-80 h-auto drop-shadow-[0_0_60px_rgba(57,255,20,0.3)]"
              />
              <div
                className="absolute top-2 -right-4 lg:-right-10 text-xs font-black px-4 py-3 rounded-2xl rounded-bl-sm max-w-[200px] leading-snug shadow-lg"
                style={{
                  background: "var(--green-accent)",
                  color: "var(--green-dark)",
                }}
              >
                &ldquo;Keep recyclables OUT of my dumpster.&rdquo;
              </div>
            </div>

            {/* Story */}
            <div>
              <div className="telemetry mb-5">
                <span className="pulse" /> Origin · Meet Bandit
              </div>
              <h2 className="section-heading mb-8" style={{ color: "var(--text-primary)" }}>
                Why does a raccoon
                <br />
                run a recycling company?
              </h2>
              <div className="space-y-5 text-base leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                <p>
                  Bandit has a problem. He and his crew depend on dumpsters. But when businesses
                  skip proper recycling, their cardboard, plastic film, and scrap metal fill the
                  dumpsters Bandit calls home — leaving no room for the actually useful stuff.
                </p>
                <p>
                  Every bale your operation produces is a load of recyclable material that{" "}
                  <span style={{ color: "var(--text-primary)", fontWeight: 700 }}>doesn&apos;t</span>{" "}
                  end up in a landfill, a dumpster, or the side of a road. It becomes a commodity.
                  It has value. It feeds the circular economy — and keeps Bandit&apos;s dumpsters
                  clear.
                </p>
                <p>
                  His mission: keep your baler running so recyclables stay where they belong.
                  He&apos;s not doing it for the planet. He&apos;s doing it for the dumpsters. But
                  hey — the result is the same.
                </p>
              </div>
              <div className="mt-10 flex flex-wrap gap-3">
                <Link href="/about" className="btn-primary">
                  Bandit&apos;s Full Story <ChevronRight size={14} />
                </Link>
                <Link href="/services/baler-repair" className="btn-secondary">
                  Our Services
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SCENE 4 · EMERGENCY DISPATCH ───────────────────────────── */}
      <section className="scene scene-grid" style={{ background: "#000" }}>
        <div className="container-site scene-pad flex items-center justify-center min-h-[80vh]">
          <div className="text-center max-w-3xl">
            <div className="telemetry mb-8 justify-center">
              <span className="pulse" /> Priority · Emergency Channel Open
            </div>
            <h2
              className="font-black uppercase leading-[0.95] mb-8"
              style={{
                fontSize: "clamp(40px, 6vw, 80px)",
                color: "var(--text-primary)",
                letterSpacing: "0.005em",
              }}
            >
              Baler Down
              <br />
              <span style={{ color: "var(--green-accent)" }}>Right Now?</span>
            </h2>
            <p className="text-base sm:text-lg max-w-xl mx-auto mb-10 leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              Every hour of downtime costs you money. Call the emergency channel — we escalate
              baler-down calls first and dispatch a technician as fast as we can get there.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a href="tel:+18574226348" className="btn-primary text-xs px-8 py-4">
                <Phone size={16} /> 857-422-6348
              </a>
              <Link href="/services/emergency-repair" className="btn-secondary text-xs px-8 py-4">
                How Dispatch Works
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── SCENE 5 · COVERAGE MAP ─────────────────────────────────── */}
      <section className="scene" style={{ background: "var(--bg-secondary)" }}>
        <div className="container-site scene-pad">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 mb-14">
            <div>
              <div className="telemetry mb-5">
                <span className="pulse" /> Coverage · All 50 States
              </div>
              <h2 className="section-heading max-w-3xl" style={{ color: "var(--text-primary)" }}>
                Nationwide Coverage.
                <br />
                <span style={{ color: "var(--green-accent)" }}>Local Technicians.</span>
              </h2>
            </div>
            <p className="max-w-sm text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              Every state has partner techs dispatched from inside your region — not from across
              the country. Hover any state to see coverage.
            </p>
          </div>

          <div className="grid lg:grid-cols-5 gap-10 items-start">
            <div className="lg:col-span-3">
              <USMap className="w-full h-[420px] lg:h-[520px]" />
            </div>

            <div className="lg:col-span-2 space-y-6">
              <div
                className="rounded-2xl p-6"
                style={{
                  background: "var(--bg-card)",
                  border: "1px solid var(--border-default)",
                }}
              >
                <div className="flex items-center gap-2 mb-5">
                  <Clock size={14} style={{ color: "var(--green-accent)" }} />
                  <span
                    className="text-[10px] font-bold tracking-[0.3em] uppercase"
                    style={{ color: "var(--green-accent)", fontFamily: "'JetBrains Mono', monospace" }}
                  >
                    ◢ How We Prioritize
                  </span>
                </div>
                <div>
                  {[
                    { type: "Emergency Dispatch", time: "Escalated first" },
                    { type: "Urgent Service", time: "High priority" },
                    { type: "Standard Repair", time: "Next available" },
                    { type: "Maintenance Visit", time: "Scheduled" },
                  ].map((r, i) => (
                    <div
                      key={r.type}
                      className="flex items-center justify-between py-4"
                      style={{
                        borderTop: i === 0 ? "none" : "1px solid var(--border-default)",
                      }}
                    >
                      <span
                        className="text-[11px] font-semibold tracking-[0.15em] uppercase"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        {r.type}
                      </span>
                      <span
                        className="text-[11px] font-bold tracking-[0.15em] uppercase"
                        style={{ color: "var(--green-accent)" }}
                      >
                        {r.time}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div
                className="rounded-2xl p-8 text-center"
                style={{
                  background: "var(--bg-card)",
                  border: "1px solid var(--border-default)",
                }}
              >
                <div
                  className="text-6xl font-black mb-2"
                  style={{ color: "var(--green-accent)", fontFamily: "'JetBrains Mono', monospace" }}
                >
                  50
                </div>
                <div
                  className="text-[10px] font-bold tracking-[0.3em] uppercase mb-4"
                  style={{ color: "var(--text-secondary)" }}
                >
                  States Covered
                </div>
                <p className="text-xs leading-relaxed" style={{ color: "var(--text-tertiary)" }}>
                  Local technicians in every state — dispatched from within your region so we show
                  up as fast as possible.
                </p>
              </div>

              <Link href="/service-area" className="btn-primary w-full">
                <MapPin size={13} /> View Full Service Area
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── SCENE 6 · TESTIMONIALS (masonry) ───────────────────────── */}
      <section className="scene" style={{ background: "var(--bg-primary)" }}>
        <div className="container-site scene-pad">
          <div className="mb-14 max-w-2xl">
            <div className="telemetry mb-5">
              <span className="pulse" /> Field Reports
            </div>
            <h2 className="section-heading" style={{ color: "var(--text-primary)" }}>
              Trusted By Operations
              <br />
              <span style={{ color: "var(--green-accent)" }}>Nationwide.</span>
            </h2>
          </div>

          <div className="masonry">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="tile tile-text-body">
                <div>
                  <div
                    className="text-[9px] font-bold tracking-[0.3em] uppercase mb-4"
                    style={{
                      color: "var(--green-accent)",
                      fontFamily: "'JetBrains Mono', monospace",
                    }}
                  >
                    ◢ Report · {String(i + 1).padStart(3, "0")}
                  </div>
                  <p
                    className="text-sm leading-relaxed mb-6"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    &ldquo;{t.quote}&rdquo;
                  </p>
                </div>
                <div
                  className="pt-4 flex items-center gap-3"
                  style={{ borderTop: "1px solid var(--border-default)" }}
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                    style={{
                      background: "var(--green-bg)",
                      border: "1px solid var(--green-border)",
                      color: "var(--green-accent)",
                    }}
                  >
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <div
                      className="text-xs font-bold tracking-[0.1em] uppercase"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {t.name}
                    </div>
                    <div
                      className="text-[10px] font-semibold tracking-[0.18em] uppercase"
                      style={{ color: "var(--text-tertiary)" }}
                    >
                      {t.company} · {t.state}
                    </div>
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
