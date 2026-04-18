import type { Metadata } from "next";
import Link from "next/link";
import { Phone, Wrench, AlertTriangle, Shield, CheckCircle, Clock, ChevronRight } from "lucide-react";
import QuoteForm from "@/components/QuoteForm";

export const metadata: Metadata = {
  title: "Baler Services — Repair, Maintenance & More | Bandit Recycling",
  description:
    "Nationwide baler repair, emergency service, and preventive maintenance. Vertical and horizontal balers. 24/7 emergency dispatch across all 50 states.",
  keywords: ["baler services", "baler repair", "emergency repair", "preventive maintenance", "baler maintenance"],
};

const SERVICES = [
  {
    id: "baler-repair",
    icon: Wrench,
    title: "Baler Repair",
    short_desc: "All makes & models, on-site",
    href: "/services/baler-repair",
    full_desc: "Hydraulic, electrical, and structural repairs. From a leaking seal to a failed PLC, our technicians carry the expertise and parts.",
  },
  {
    id: "emergency-repair",
    icon: AlertTriangle,
    title: "Emergency Repair",
    short_desc: "24/7 emergency dispatch",
    href: "/services/emergency-repair",
    full_desc: "Baler down? We dispatch as fast as we can get a qualified tech rolling. No callbacks, no delays — just fast expert repair.",
  },
  {
    id: "preventive-maintenance",
    icon: Shield,
    title: "Preventive Maintenance",
    short_desc: "Monthly, quarterly schedules",
    href: "/services/preventive-maintenance",
    full_desc: "Avoid emergency calls with scheduled maintenance. Keep your baler running, avoid costly downtime.",
  },
  {
    id: "vertical-baler-repair",
    icon: CheckCircle,
    title: "Vertical Baler Repair",
    short_desc: "Retail & grocery specialists",
    href: "/services/vertical-baler-repair",
    full_desc: "Specialized service for retail, grocery, and distribution center vertical balers.",
  },
  {
    id: "horizontal-baler-repair",
    icon: CheckCircle,
    title: "Horizontal Baler Repair",
    short_desc: "Industrial & MRF experts",
    href: "/services/horizontal-baler-repair",
    full_desc: "Heavy-duty horizontal baler service for industrial operations and material recovery facilities.",
  },
  {
    id: "bale-wire",
    icon: Wrench,
    title: "Bale Wire Supply",
    short_desc: "All gauges, bulk pricing",
    href: "/wire",
    full_desc: "High-quality bale wire in all gauges. Single & double loop. Competitive bulk pricing.",
  },
];

export default function ServicesPage() {
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
          <div className="text-center max-w-3xl mx-auto">
            <div className="badge-green mb-6 justify-center">Our Services</div>
            <h1 className="text-5xl sm:text-6xl font-black text-white leading-none tracking-tight mb-6">
              Baler Services —{" "}
              <span className="text-[#39FF14]">Repair, Maintenance & More</span>
            </h1>
            <p className="text-lg text-gray-400 mb-10 leading-relaxed">
              From emergency repair to preventive maintenance, we keep your baling equipment running nationwide. All makes & models. 24/7 emergency dispatch available.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a href="tel:+18574226348" className="btn-primary">
                <Phone size={16} /> Call 857-422-6348
              </a>
              <Link href="/quote" className="btn-ghost-green">
                Request a Quote <ChevronRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── SERVICES GRID ────────────────────────────────────────────── */}
      <section className="py-24 bg-[#050505]">
        <div className="container-site">
          <div className="text-center mb-14">
            <div className="badge-green mb-4">What We Offer</div>
            <h2 className="section-heading text-white">The complete baler service spectrum</h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {SERVICES.map((service) => (
              <Link key={service.id} href={service.href} className="card-dark group hover:border-[#39FF14]/40 transition-all flex flex-col">
                <div className="w-10 h-10 rounded-lg bg-[#39FF14]/10 flex items-center justify-center mb-4 group-hover:bg-[#39FF14]/20 transition-colors">
                  <service.icon size={20} className="text-[#39FF14]" />
                </div>
                <h3 className="text-lg font-bold text-white mb-1 group-hover:text-[#39FF14] transition-colors">
                  {service.title}
                </h3>
                <p className="text-xs text-gray-500 mb-3">{service.short_desc}</p>
                <p className="text-sm text-gray-400 mb-6 flex-grow leading-relaxed">
                  {service.full_desc}
                </p>
                <div className="flex items-center gap-2 text-[#39FF14] font-semibold text-sm group-hover:gap-3 transition-all">
                  Learn More <ChevronRight size={16} />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHY BANDIT ────────────────────────────────────────────── */}
      <section className="py-24 bg-[#0A0A0A]">
        <div className="container-site">
          <div className="text-center mb-14">
            <div className="badge-green mb-4">Why Bandit?</div>
            <h2 className="section-heading text-white">The difference in service</h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Clock,
                title: "Rapid Response",
                desc: "We respond as fast as we can. Emergencies are escalated and dispatched immediately.",
              },
              {
                icon: CheckCircle,
                title: "All 50 States",
                desc: "Nationwide network with local technicians in every region.",
              },
              {
                icon: Shield,
                title: "All Makes & Models",
                desc: "We service every major commercial baler brand and type.",
              },
              {
                icon: Wrench,
                title: "Certified Technicians",
                desc: "Expert repair technicians with deep equipment knowledge.",
              },
            ].map((item) => (
              <div key={item.title} className="card-dark">
                <div className="w-10 h-10 rounded-lg bg-[#39FF14]/10 flex items-center justify-center mb-4">
                  <item.icon size={20} className="text-[#39FF14]" />
                </div>
                <h3 className="font-bold text-white mb-2 text-sm">{item.title}</h3>
                <p className="text-xs text-gray-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── EMERGENCY BANNER ────────────────────────────────────────── */}
      <section className="py-16 bg-[#39FF14]">
        <div className="container-site">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div>
              <div className="text-[#0A0A0A] text-sm font-mono font-bold mb-2 uppercase">Emergency Service</div>
              <h2 className="text-3xl sm:text-4xl font-black text-[#0A0A0A] mb-2">
                Baler down right now?
              </h2>
              <p className="text-[#0A0A0A]/70 mb-4 text-sm">
                Stop wasting money. Every hour offline is lost production. Call us immediately and we&apos;ll get a tech rolling.
              </p>
            </div>
            <a href="tel:+18574226348" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#0A0A0A] text-white font-bold rounded-md text-base hover:bg-black transition-colors lg:justify-end">
              <Phone size={18} /> Call 857-422-6348
            </a>
          </div>
        </div>
      </section>

      {/* ── SERVICE REQUEST FORM ────────────────────────────────────── */}
      <section className="py-24 bg-[#050505]">
        <div className="container-site">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            <div>
              <div className="badge-green mb-4">Ready to Service Your Baler?</div>
              <h2 className="text-3xl sm:text-4xl font-black text-white leading-tight mb-6">
                Get service pricing
              </h2>
              <p className="text-gray-400 leading-relaxed mb-8">
                Need repair, maintenance, or emergency service? Submit a request and our team will get back to you with availability and pricing — emergencies are escalated immediately.
              </p>

              <div className="space-y-4">
                {[
                  "Repair • Maintenance • Emergency Service",
                  "All makes & models • All 50 states",
                  "24/7 emergency dispatch available",
                  "Free diagnostic • Written estimates • No surprises",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <CheckCircle size={16} className="text-[#39FF14] mt-0.5 shrink-0" />
                    <span className="text-sm text-gray-300">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <QuoteForm
              formType="service_quote"
              title="Request Service"
              subtitle="Describe your equipment and what you need."
              ctaLabel="Get Service Quote"
              showEquipment
              showUrgency
            />
          </div>
        </div>
      </section>

      {/* ── BOTTOM CTA ────────────────────────────────────────────── */}
      <section className="py-20 bg-[#0A0A0A]">
        <div className="container-site text-center">
          <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
            Can&apos;t find what you&apos;re looking for?
          </h2>
          <p className="text-gray-400 mb-8 max-w-md mx-auto">
            We offer comprehensive baler services beyond our main offerings. Call our team to discuss your specific needs.
          </p>
          <a href="tel:+18574226348" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#39FF14] text-[#0A0A0A] font-bold rounded-md text-base hover:bg-[#32DD0D] transition-colors">
            <Phone size={18} /> Call 857-422-6348
          </a>
        </div>
      </section>
    </>
  );
}
