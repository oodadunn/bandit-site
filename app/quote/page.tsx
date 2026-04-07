import type { Metadata } from "next";
import Link from "next/link";
import { Phone, CheckCircle, ChevronRight, Clock, Shield, Zap } from "lucide-react";
import QuoteForm from "@/components/QuoteForm";

export const metadata: Metadata = {
  title: "Get a Free Quote | Bandit Recycling",
  description:
    "Request a free baler service quote. Our nationwide technicians respond within 2 hours. Repair, maintenance, equipment sales & leasing available across all 50 states.",
  keywords: ["baler quote", "free quote", "baler repair quote", "service quote", "equipment quote"],
};

const TRUST_SIGNALS = [
  { icon: Shield, label: "Licensed & Insured", desc: "Full coverage, all states" },
  { icon: CheckCircle, label: "All 50 States", desc: "Nationwide coverage" },
  { icon: Clock, label: "2hr Response", desc: "Same-day emergency dispatch" },
];

export default function QuotePage() {
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
              <div className="badge-green mb-6">Get a Quote</div>
              <h1 className="text-5xl sm:text-6xl font-black text-white leading-none tracking-tight mb-6">
                Request a{" "}
                <span className="text-[#39FF14]">Free Quote</span>
              </h1>
              <p className="text-lg text-gray-400 mb-8 max-w-xl leading-relaxed">
                Need baler repair, maintenance, equipment, or bale wire? Get a custom quote from our team. We respond within 2 hours during business hours.
              </p>

              <div className="space-y-4 mb-10">
                {TRUST_SIGNALS.map((signal) => (
                  <div key={signal.label} className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      <signal.icon size={18} className="text-[#39FF14]" />
                    </div>
                    <div>
                      <div className="font-semibold text-white text-sm">{signal.label}</div>
                      <div className="text-xs text-gray-500">{signal.desc}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="card-dark border-l-2 border-[#39FF14]">
                <div className="text-[#39FF14] text-xs font-mono font-bold mb-2 uppercase">Have an Emergency?</div>
                <div className="text-gray-300 text-sm mb-3">
                  For immediate assistance, call us directly. We dispatch same-day emergency response nationwide.
                </div>
                <a href="tel:+18574226348" className="inline-flex items-center gap-2 text-[#39FF14] font-bold text-sm hover:underline">
                  <Phone size={16} /> 857-422-6348
                </a>
              </div>
            </div>

            <div className="lg:max-w-md ml-auto w-full">
              <QuoteForm
                formType="service_quote"
                title="Request Your Quote"
                subtitle="Service quote, equipment, or wire. We respond within 2 hours."
                ctaLabel="Get My Quote"
                showEquipment
                showUrgency
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── CONTACT INFO ────────────────────────────────────────────── */}
      <section className="py-20 bg-[#050505]">
        <div className="container-site">
          <div className="grid sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
            <div className="card-dark">
              <div className="text-[#39FF14] text-xs font-mono font-bold mb-2 uppercase">Phone</div>
              <a href="tel:+18574226348" className="text-2xl font-black text-white hover:text-[#39FF14] transition-colors font-mono">
                857-422-6348
              </a>
              <p className="text-xs text-gray-500 mt-2">Mon-Fri 8am-6pm EST, Emergencies 24/7</p>
            </div>
            <div className="card-dark">
              <div className="text-[#39FF14] text-xs font-mono font-bold mb-2 uppercase">Email</div>
              <a href="mailto:service@banditrecycling.com" className="text-lg font-bold text-white hover:text-[#39FF14] transition-colors break-all">
                service@banditrecycling.com
              </a>
              <p className="text-xs text-gray-500 mt-2">We respond within 2 hours</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── WHY BANDIT ────────────────────────────────────────────── */}
      <section className="py-24 bg-[#0A0A0A]">
        <div className="container-site">
          <div className="text-center mb-14">
            <div className="badge-green mb-4">Why Bandit?</div>
            <h2 className="section-heading text-white">The nation&apos;s fastest baler response network</h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Zap,
                title: "2-Hour Response",
                desc: "We don't promise callbacks. We promise technicians on-site.",
              },
              {
                icon: CheckCircle,
                title: "All 50 States",
                desc: "Nationwide network of local technicians in every region.",
              },
              {
                icon: Shield,
                title: "Licensed & Insured",
                desc: "Full coverage, certified technicians, professional service.",
              },
              {
                icon: Clock,
                title: "Same-Day Emergency",
                desc: "Baler down? We dispatch within hours, not days.",
              },
              {
                icon: Phone,
                title: "Expert Support",
                desc: "Certified repair technicians fluent in all makes & models.",
              },
              {
                icon: ChevronRight,
                title: "No Surprises",
                desc: "Free diagnostic, written estimate, no hidden charges.",
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

      {/* ── BOTTOM CTA ────────────────────────────────────────────── */}
      <section className="py-20 bg-[#39FF14]">
        <div className="container-site text-center">
          <h2 className="text-3xl sm:text-4xl font-black text-[#0A0A0A] mb-4">
            Still have questions?
          </h2>
          <p className="text-[#0A0A0A]/70 mb-8 max-w-md mx-auto">
            Call our team directly. Our service experts are ready to help you find the right solution.
          </p>
          <a href="tel:+18574226348" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#0A0A0A] text-white font-bold rounded-md text-base hover:bg-black transition-colors">
            <Phone size={18} /> Call 857-422-6348
          </a>
        </div>
      </section>
    </>
  );
}
