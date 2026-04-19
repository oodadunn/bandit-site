import Link from "next/link";
import { Clock, Zap, MapPin, Users, CheckCircle, ChevronRight, Phone } from "lucide-react";
import USMap from "@/components/USMap";
import HeroMascot from "@/components/HeroMascot";

const SERVICE_REGIONS = {
  "Northeast": [
    "Connecticut", "Delaware", "Maine", "Maryland", "Massachusetts", "New Hampshire", "New Jersey", "New York", "Pennsylvania", "Rhode Island", "Vermont", "Virginia", "West Virginia"
  ],
  "Southeast": [
    "Alabama", "Arkansas", "Florida", "Georgia", "Kentucky", "Louisiana", "Mississippi", "North Carolina", "South Carolina", "Tennessee", "Texas"
  ],
  "Midwest": [
    "Illinois", "Indiana", "Iowa", "Kansas", "Michigan", "Minnesota", "Missouri", "Nebraska", "North Dakota", "Ohio", "South Dakota", "Wisconsin"
  ],
  "Southwest": [
    "Arizona", "New Mexico", "Oklahoma"
  ],
  "West": [
    "Alaska", "California", "Colorado", "Hawaii", "Idaho", "Montana", "Nevada", "Oregon", "Utah", "Washington", "Wyoming"
  ]
};

const HIGHLIGHTS = [
  {
    icon: Zap,
    title: "24/7 Emergency Dispatch",
    desc: "Emergency technician dispatch available around the clock — baler-down calls escalated first"
  },
  {
    icon: Users,
    title: "Local Technicians",
    desc: "Dispatched from within your region — not shipped across the country"
  },
  {
    icon: MapPin,
    title: "All 50 States",
    desc: "Complete nationwide coverage with local expertise in every state"
  },
  {
    icon: Clock,
    title: "Fast Response",
    desc: "We work to dispatch as quickly as we can — emergencies are escalated and prioritized"
  }
];

export default function ServiceAreaPage() {
  return (
    <>
      {/* ── HEADER ────────────────────────────────────────────────────── */}
      <section className="relative min-h-[50vh] flex items-center bg-[#0A0A0A] overflow-hidden pt-24">
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

        <div className="container-site relative py-16">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="badge-green mb-4">
                <span className="w-1.5 h-1.5 rounded-full bg-[#39FF14] mr-2 animate-pulse" />
                All 50 States, Local Presence
              </div>
              <h1 className="text-5xl sm:text-6xl font-black text-white leading-tight mb-6 tracking-tight">
                Nationwide Service Coverage
              </h1>
              <p className="text-xl text-gray-400 mb-8 leading-relaxed max-w-xl">
                From Maine to Hawaii, Bandit services all 50 states with local technicians dispatched from within your region. 24/7 emergency dispatch — baler-down calls get prioritized.
              </p>
              <div className="flex flex-wrap gap-3">
                <a href="tel:+18574226348" className="btn-primary">
                  <Phone size={16} /> Call 857-422-6348
                </a>
                <Link href="/quote" className="btn-secondary">
                  Request a Quote <ChevronRight size={16} />
                </Link>
              </div>
            </div>
            <div className="hidden lg:flex justify-center items-center relative">
              <div className="absolute inset-0 rounded-full bg-[#39FF14]/5 blur-3xl pointer-events-none" />
              <HeroMascot slug="service-area" className="relative w-full max-w-md mx-auto" />
            </div>
          </div>
        </div>
      </section>

      {/* ── MAP ───────────────────────────────────────────────────────── */}
      <section className="py-24 bg-[#050505]">
        <div className="container-site">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-black text-white mb-2">Service Coverage Map</h2>
            <p className="text-gray-400">Hover over the map to see state details</p>
          </div>
          <div className="rounded-lg overflow-hidden border border-[#1F2937]">
            <USMap className="w-full h-[500px]" />
          </div>
        </div>
      </section>

      {/* ── HIGHLIGHTS ────────────────────────────────────────────────── */}
      <section className="py-24 bg-[#0A0A0A]">
        <div className="container-site">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {HIGHLIGHTS.map((h) => (
              <div key={h.title} className="card-dark p-6">
                <div className="w-12 h-12 rounded-lg bg-[#39FF14]/10 flex items-center justify-center mb-4">
                  <h.icon size={24} className="text-[#39FF14]" />
                </div>
                <h3 className="font-bold text-white mb-2">{h.title}</h3>
                <p className="text-sm text-gray-400">{h.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="divider-green container-site" />

      {/* ── RESPONSE TIME GUARANTEE ────────────────────────────────────── */}
      <section className="py-24 bg-[#050505]">
        <div className="container-site">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-black text-white mb-3">How We Prioritize</h2>
              <p className="text-gray-400">How we triage incoming service requests across all 50 states</p>
            </div>
            <div className="card-dark p-8 space-y-4">
              {[
                { type: "Emergency Dispatch", time: "Escalated first", color: "text-[#39FF14]", desc: "Your baler is down right now" },
                { type: "Urgent Service", time: "High priority", color: "text-yellow-400", desc: "Critical issue, time-sensitive" },
                { type: "Standard Repair", time: "Next available", color: "text-blue-400", desc: "Important but not blocking production" },
                { type: "Maintenance Visit", time: "Scheduled", color: "text-gray-300", desc: "Preventive maintenance appointment" },
              ].map((r) => (
                <div key={r.type} className="flex items-start justify-between py-4 border-b border-[#1F2937] last:border-0 last:pb-0">
                  <div className="flex-1">
                    <div className="font-semibold text-white">{r.type}</div>
                    <div className="text-xs text-gray-500 mt-1">{r.desc}</div>
                  </div>
                  <div className={`text-lg font-bold ml-4 ${r.color}`}>{r.time}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="divider-green container-site" />

      {/* ── STATES BY REGION ──────────────────────────────────────────── */}
      <section className="py-24 bg-[#0A0A0A]">
        <div className="container-site">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-black text-white mb-3">Complete State Coverage</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">All 50 states organized by region. Click any state to learn more about service in that area.</p>
          </div>

          <div className="space-y-10">
            {Object.entries(SERVICE_REGIONS).map(([region, states]) => (
              <div key={region}>
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <MapPin size={20} className="text-[#39FF14]" />
                  {region}
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {states.map((state) => (
                    <Link
                      key={state}
                      href="/quote"
                      className="card-dark px-4 py-3 text-center hover:border-[#39FF14]/40 hover:bg-[#39FF14]/5 transition-all duration-200"
                    >
                      <div className="flex items-center justify-center gap-2">
                        <CheckCircle size={14} className="text-[#39FF14]" />
                        <span className="text-sm font-medium text-gray-300">{state}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="divider-green container-site" />

      {/* ── CTA ───────────────────────────────────────────────────────── */}
      <section className="py-24 bg-[#050505]">
        <div className="container-site">
          <div className="card-dark border-[#39FF14]/30 text-center max-w-3xl mx-auto py-16 px-8">
            <h2 className="text-4xl font-black text-white mb-4">
              Ready to schedule service in your state?
            </h2>
            <p className="text-gray-400 mb-8 max-w-2xl mx-auto text-lg leading-relaxed">
              Fill out our quote form or call us directly at 857-422-6348. We&apos;ll get back to you as quickly as we can — emergencies are escalated immediately.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/quote" className="btn-primary text-lg px-8 py-4">
                Get a Free Quote
              </Link>
              <a href="tel:+18574226348" className="btn-ghost-green text-lg px-8 py-4">
                <Phone size={18} /> Call Now
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
