import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Phone, MapPin, Zap, Wrench, Package, CheckCircle, ChevronRight } from "lucide-react";
import { supabase, getServiceAreas, ServiceArea } from "@/lib/supabase";

// State landing pages — driven by the service_areas table (h1, meta fields,
// cities). New row in the table → new page, no code change.

export const revalidate = 3600;

function stateSlug(state: string): string {
  return state.toLowerCase().replace(/\s+/g, "-");
}

async function getArea(slug: string): Promise<ServiceArea | null> {
  const areas = await getServiceAreas().catch(() => [] as ServiceArea[]);
  return areas.find((a) => stateSlug(a.state) === slug) ?? null;
}

export async function generateStaticParams() {
  try {
    const { data } = await supabase.from("service_areas").select("state").eq("active", true);
    return (data ?? []).map((a) => ({ state: stateSlug(a.state) }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: { params: Promise<{ state: string }> }): Promise<Metadata> {
  const { state } = await params;
  const area = await getArea(state);
  if (!area) return { title: "Service Area Not Found | Bandit Recycling" };
  return {
    title: area.meta_title ?? `Baler Repair ${area.state} | Bandit Recycling`,
    description:
      area.meta_description ??
      `Professional baler repair, preventive maintenance, and bale wire supply across ${area.state}. 24/7 emergency dispatch.`,
    alternates: { canonical: `/service-area/${state}` },
  };
}

const SERVICES = [
  {
    icon: Zap,
    title: "Emergency Baler Repair",
    desc: "24/7 dispatch — baler-down calls are escalated first.",
    href: "/services/emergency-repair",
  },
  {
    icon: Wrench,
    title: "Preventive Maintenance",
    desc: "Scheduled service plans that catch failures before they stop production.",
    href: "/services/preventive-maintenance",
  },
  {
    icon: Package,
    title: "Bale Wire Supply",
    desc: "Auto-tie box wire, single & double loop ties — delivered fast.",
    href: "/wire",
  },
];

export default async function StatePage({ params }: { params: Promise<{ state: string }> }) {
  const { state } = await params;
  const area = await getArea(state);
  if (!area) notFound();

  const cities: string[] = Array.isArray(area.cities) ? area.cities : [];

  const faqs = [
    {
      q: `Do you offer emergency baler repair in ${area.state}?`,
      a: `Yes — Bandit provides 24/7 emergency dispatch across ${area.state}, including ${cities.slice(0, 3).join(", ")}. Baler-down calls are escalated first. Call 857-422-6348 any time.`,
    },
    {
      q: `Which cities in ${area.state} do you serve?`,
      a: `We dispatch local technicians throughout ${area.state}, including ${cities.join(", ")} and surrounding areas. If you're anywhere in the state, we can help.`,
    },
    {
      q: `What baler makes and models do you repair in ${area.state}?`,
      a: `All makes and models — vertical and horizontal balers, auto-tie and manual-tie, from brands like Harris, Balemaster, International Baler, Maren, and more.`,
    },
    {
      q: `Can I get bale wire delivered in ${area.state}?`,
      a: `Yes. We supply auto-tie box wire, single loop, and double loop bale ties with fast regional delivery across ${area.state}, and can bundle wire drops with preventive maintenance visits.`,
    },
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Service",
        name: `Baler Repair in ${area.state}`,
        serviceType: "Baler Repair & Maintenance",
        provider: {
          "@type": "LocalBusiness",
          name: "Bandit Recycling",
          telephone: "+18574226348",
          url: "https://www.banditrecycling.com",
        },
        areaServed: { "@type": "State", name: area.state },
        url: `https://www.banditrecycling.com/service-area/${state}`,
      },
      {
        "@type": "FAQPage",
        mainEntity: faqs.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Service Area", item: "https://www.banditrecycling.com/service-area" },
          { "@type": "ListItem", position: 2, name: area.state, item: `https://www.banditrecycling.com/service-area/${state}` },
        ],
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* ── HERO ──────────────────────────────────────────────────────── */}
      <section className="relative bg-[#0A0A0A] overflow-hidden py-24">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#39FF14]/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="container-site relative">
          <Link
            href="/service-area"
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[#39FF14] transition-colors mb-6"
          >
            <MapPin size={14} /> All Service Areas
          </Link>
          <h1 className="text-4xl sm:text-6xl font-black text-white leading-tight tracking-tight mb-6 max-w-3xl">
            {area.h1 ?? `Baler Repair in ${area.state}`}
          </h1>
          <p className="text-lg text-gray-400 mb-8 max-w-2xl leading-relaxed">
            Local technicians, 24/7 emergency dispatch, and bale wire supply across {area.state}.
            From {cities[0] ?? "your city"} to {cities[cities.length - 1] ?? "everywhere in between"} —
            when your baler goes down, we escalate your call first.
          </p>
          <div className="flex flex-wrap gap-3">
            <a href="tel:+18574226348" className="btn-primary">
              <Phone size={16} /> Call 857-422-6348
            </a>
            <Link href="/quote" className="btn-ghost-green">
              Get a Free Quote <ChevronRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── CITIES ────────────────────────────────────────────────────── */}
      <section className="py-16 bg-[#050505]">
        <div className="container-site">
          <h2 className="text-2xl font-black text-white mb-6">
            Cities We Serve in <span className="text-[#39FF14]">{area.state}</span>
          </h2>
          <div className="flex flex-wrap gap-3">
            {cities.map((c) => (
              <span
                key={c}
                className="text-sm text-gray-300 bg-white/5 border border-white/10 px-4 py-2 rounded-full flex items-center gap-2"
              >
                <MapPin size={12} className="text-[#39FF14]" /> {c}
              </span>
            ))}
            <span className="text-sm text-gray-500 px-4 py-2">+ surrounding areas statewide</span>
          </div>
        </div>
      </section>

      {/* ── SERVICES ──────────────────────────────────────────────────── */}
      <section className="py-20 bg-[#0A0A0A]">
        <div className="container-site">
          <h2 className="text-2xl font-black text-white mb-8">
            What We Do in {area.state}
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {SERVICES.map(({ icon: Icon, title, desc, href }) => (
              <Link key={title} href={href} className="card-dark group hover:border-[#39FF14]/20 transition-all">
                <div className="w-10 h-10 rounded-lg bg-[#39FF14]/10 flex items-center justify-center mb-4">
                  <Icon size={20} className="text-[#39FF14]" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-[#39FF14] transition-colors">
                  {title}
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed mb-3">{desc}</p>
                <span className="text-xs text-[#39FF14] flex items-center gap-1">
                  Learn more <ChevronRight size={12} />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────────────── */}
      <section className="py-20 bg-[#050505]">
        <div className="container-site max-w-3xl">
          <h2 className="text-2xl font-black text-white mb-8 text-center">
            {area.state} Service FAQ
          </h2>
          <div className="space-y-4">
            {faqs.map((f) => (
              <div key={f.q} className="card-dark">
                <h3 className="text-white font-semibold mb-2">{f.q}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────── */}
      <section className="py-16 bg-[#39FF14]">
        <div className="container-site text-center">
          <h2 className="text-3xl font-black text-[#0A0A0A] mb-3">
            Baler down in {area.state}?
          </h2>
          <p className="text-[#0A0A0A]/70 mb-6 max-w-xl mx-auto">
            Every hour of downtime costs you money. Call now — baler-down calls get escalated first.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="tel:+18574226348"
              className="bg-[#0A0A0A] text-[#39FF14] font-bold px-8 py-4 rounded-full hover:bg-black transition-colors inline-flex items-center gap-2"
            >
              <Phone size={16} /> 857-422-6348
            </a>
            <Link
              href="/quote"
              className="bg-[#0A0A0A]/20 text-[#0A0A0A] font-bold px-8 py-4 rounded-full hover:bg-[#0A0A0A]/30 transition-colors inline-flex items-center gap-2"
            >
              <CheckCircle size={16} /> Request Service Online
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
