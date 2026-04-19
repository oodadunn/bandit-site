import type { Metadata } from "next";
import Link from "next/link";
import { Phone, Zap, Package, Truck, TrendingUp, ChevronRight, CheckCircle } from "lucide-react";
import QuoteForm from "@/components/QuoteForm";
import HeroMascot from "@/components/HeroMascot";

export const metadata: Metadata = {
  title: "Baler Equipment Sales & Leasing | Bandit Recycling",
  description:
    "Buy or lease vertical balers, horizontal balers, waste compactors, and conveyor systems. New and used equipment nationwide. Flexible leasing terms available.",
  keywords: ["baler equipment", "vertical baler", "horizontal baler", "baler sales", "baler leasing", "waste compactor", "conveyor system"],
};

const EQUIPMENT_CATEGORIES = [
  {
    id: "vertical-balers",
    icon: Package,
    title: "Vertical Balers",
    description: "Compact, efficient balers for retail, grocery, warehouses.",
    specs: ["60\" wide models", "Single ram design", "Low footprint", "1-3 ton/hr capacity"],
    use_cases: "Retail stores • Grocery chains • Warehouses • Distribution centers",
  },
  {
    id: "horizontal-balers",
    icon: Truck,
    title: "Horizontal Balers",
    description: "Heavy-duty, high-volume balers for industrial operations.",
    specs: ["Auto-tie & manual options", "Single & two-ram", "8-15 ton/hr capacity", "Integrated conveyors"],
    use_cases: "MRF facilities • Fulfillment centers • Manufacturing • Large waste streams",
  },
  {
    id: "compactors",
    icon: Zap,
    title: "Waste Compactors",
    description: "Commercial compactors for waste reduction and containment.",
    specs: ["Stationary & mobile", "Slow-speed shredding", "Tipping gates available", "Customizable sizes"],
    use_cases: "Waste management • Industrial • Construction • Commercial operations",
  },
  {
    id: "conveyors",
    icon: TrendingUp,
    title: "Conveyor Systems",
    description: "Infeed and discharge conveyors for baler integration.",
    specs: ["Powered & gravity", "Adjustable height", "Multiple widths", "Stainless options"],
    use_cases: "Baler feed systems • Sorting lines • Integration with existing lines",
  },
];

const EQUIPMENT_MODELS = [
  {
    type: "Vertical Baler",
    models: ["Harris TRX 61", "International 5100", "Maren VSC 5000", "Pakrite PK-6"],
  },
  {
    type: "Horizontal Baler",
    models: ["Harris TRX HP Plus", "Bollegraaf BI-840LD", "PTR baler 2000", "Macpresse Serie 5"],
  },
];

export default function EquipmentPage() {
  return (
    <>
      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <section className="relative min-h-[70vh] flex items-center bg-[#0A0A0A] overflow-hidden">
        <HeroMascot slug="equipment" />
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
              <div className="badge-green mb-6">Equipment</div>
              <h1 className="text-5xl sm:text-6xl font-black text-white leading-none tracking-tight mb-6">
                Baler Equipment{" "}
                <span className="text-[#39FF14]">Sales & Leasing</span>
              </h1>
              <p className="text-lg text-gray-400 mb-8 max-w-xl leading-relaxed">
                New and used vertical balers, horizontal balers, compactors, and conveyor systems. Flexible leasing terms for operations of any size. Nationwide delivery and setup included.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link href="/quote" className="btn-primary">
                  Get Equipment Pricing
                </Link>
                <a href="tel:+18574226348" className="btn-ghost-green">
                  <Phone size={16} /> Call for Details
                </a>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "New & Used", value: "Full Stock" },
                { label: "Nationwide", value: "Delivery" },
                { label: "Leasing", value: "Flexible Terms" },
                { label: "Setup", value: "Included" },
              ].map((item) => (
                <div key={item.label} className="card-dark text-center">
                  <div className="text-xs text-gray-500 mb-1">{item.label}</div>
                  <div className="font-bold text-white text-sm">{item.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── EQUIPMENT CATEGORIES ────────────────────────────────────── */}
      <section className="py-24 bg-[#050505]">
        <div className="container-site">
          <div className="text-center mb-14">
            <div className="badge-green mb-4">What We Offer</div>
            <h2 className="section-heading text-white mb-4">Equipment Categories</h2>
            <p className="text-gray-400 max-w-xl mx-auto">
              From compact retail balers to industrial-scale horizontal systems, we have the right equipment for your operation.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {EQUIPMENT_CATEGORIES.map((cat) => (
              <div key={cat.id} className="card-dark flex flex-col">
                <div className="w-12 h-12 rounded-lg bg-[#39FF14]/10 flex items-center justify-center mb-4">
                  <cat.icon size={24} className="text-[#39FF14]" />
                </div>
                <h3 className="font-bold text-white mb-2 text-base">{cat.title}</h3>
                <p className="text-xs text-gray-400 mb-4 leading-relaxed flex-grow">{cat.description}</p>

                <div className="space-y-2 mb-4 border-t border-[#1F2937] pt-4">
                  <div className="text-[10px] text-gray-500 font-mono uppercase">Specs</div>
                  <ul className="space-y-1">
                    {cat.specs.map((spec) => (
                      <li key={spec} className="flex items-start gap-2 text-[11px] text-gray-400">
                        <span className="text-[#39FF14] mt-0.5 shrink-0">›</span>
                        {spec}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="border-t border-[#1F2937] pt-4">
                  <div className="text-[10px] text-gray-500 font-mono uppercase mb-2">Use Cases</div>
                  <p className="text-[11px] text-gray-400 leading-snug">{cat.use_cases}</p>
                </div>

                <Link href="/quote" className="btn-ghost-green w-full justify-center mt-4 text-xs">
                  Request Pricing
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── POPULAR MODELS ────────────────────────────────────────────── */}
      <section className="py-20 bg-[#0A0A0A]">
        <div className="container-site">
          <div className="text-center mb-10">
            <div className="badge-green mb-4">Popular Models</div>
            <h2 className="section-heading text-white">Equipment We Stock & Support</h2>
          </div>

          <div className="grid sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {EQUIPMENT_MODELS.map((item) => (
              <div key={item.type} className="card-dark">
                <div className="text-[#39FF14] text-xs font-mono font-bold mb-4 uppercase">{item.type}</div>
                <ul className="space-y-2">
                  {item.models.map((model) => (
                    <li key={model} className="flex items-center gap-2 text-sm text-gray-300">
                      <CheckCircle size={14} className="text-[#39FF14]" />
                      {model}
                    </li>
                  ))}
                </ul>
                <p className="text-xs text-gray-500 mt-4 pt-4 border-t border-[#1F2937]">
                  Plus 40+ additional models. Call for full inventory.
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── NEW VS USED ────────────────────────────────────────────── */}
      <section className="py-24 bg-[#050505]">
        <div className="container-site">
          <div className="text-center mb-14">
            <div className="badge-green mb-4">Investment Options</div>
            <h2 className="section-heading text-white">New, Used & Leased Equipment</h2>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            <div className="card-dark">
              <h3 className="text-lg font-bold text-white mb-4">New Equipment</h3>
              <ul className="space-y-3 mb-6">
                {["Full warranty coverage", "Latest technology", "Custom configurations", "Direct from manufacturers"].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-gray-400">
                    <CheckCircle size={16} className="text-[#39FF14] mt-0.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/quote" className="btn-primary w-full justify-center text-sm">
                Get New Equipment Quote
              </Link>
            </div>

            <div className="card-dark">
              <h3 className="text-lg font-bold text-white mb-4">Used Equipment</h3>
              <ul className="space-y-3 mb-6">
                {["Reconditioned & inspected", "Significant cost savings", "Ready to ship", "Full service available"].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-gray-400">
                    <CheckCircle size={16} className="text-[#39FF14] mt-0.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/quote" className="btn-primary w-full justify-center text-sm">
                Browse Used Equipment
              </Link>
            </div>

            <div className="card-dark">
              <h3 className="text-lg font-bold text-white mb-4">Equipment Leasing</h3>
              <ul className="space-y-3 mb-6">
                {["Flexible terms (12-60 mo)", "Maintenance included", "No capital outlay", "Upgrade options"].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-gray-400">
                    <CheckCircle size={16} className="text-[#39FF14] mt-0.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/quote" className="btn-primary w-full justify-center text-sm">
                Explore Leasing Options
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── DELIVERY & SETUP ────────────────────────────────────────── */}
      <section className="py-20 bg-[#0A0A0A]">
        <div className="container-site">
          <div className="max-w-3xl mx-auto">
            <div className="card-dark border-[#39FF14]/20">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-[#39FF14]/10 flex items-center justify-center shrink-0">
                  <Truck size={24} className="text-[#39FF14]" />
                </div>
                <div className="flex-grow">
                  <h3 className="text-lg font-bold text-white mb-3">Nationwide Delivery & Setup</h3>
                  <p className="text-gray-400 text-sm mb-4 leading-relaxed">
                    We handle everything. All equipment sales include nationwide freight, installation, electrical hookup, and operator training at your site. Our team ensures your new or leased equipment is running perfectly before we leave.
                  </p>
                  <ul className="grid sm:grid-cols-2 gap-3">
                    {["Freight nationwide", "On-site installation", "Electrical/hydraulic", "Operator training", "Safety certification", "Start-up inspection"].map((item) => (
                      <li key={item} className="flex items-center gap-2 text-xs text-gray-400">
                        <CheckCircle size={14} className="text-[#39FF14]" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── QUOTE FORM ────────────────────────────────────────────── */}
      <section className="py-24 bg-[#050505]">
        <div className="container-site">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            <div>
              <div className="badge-green mb-4">Ready to Upgrade?</div>
              <h2 className="text-3xl sm:text-4xl font-black text-white leading-tight mb-6">
                Get custom equipment pricing
              </h2>
              <p className="text-gray-400 leading-relaxed mb-8">
                Tell us about your operation, baling needs, and budget. Our equipment specialists will provide detailed pricing for new, used, or leased solutions.
              </p>

              <div className="space-y-4">
                {[
                  "Custom quotes based on your specs",
                  "Flexible pricing and leasing terms",
                  "Delivery & setup included",
                  "Full technician support",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <CheckCircle size={16} className="text-[#39FF14] mt-0.5 shrink-0" />
                    <span className="text-sm text-gray-300">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <QuoteForm
              formType="equipment"
              title="Equipment Quote Request"
              subtitle="Describe your operation and equipment needs."
              ctaLabel="Get Equipment Pricing"
              showEquipment
            />
          </div>
        </div>
      </section>

      {/* ── BOTTOM CTA ────────────────────────────────────────────── */}
      <section className="py-20 bg-[#39FF14]">
        <div className="container-site text-center">
          <h2 className="text-3xl sm:text-4xl font-black text-[#0A0A0A] mb-4">
            Need help choosing the right equipment?
          </h2>
          <p className="text-[#0A0A0A]/70 mb-8 max-w-md mx-auto">
            Our equipment specialists can walk you through options based on your volume, space, and budget.
          </p>
          <a href="tel:+18574226348" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#0A0A0A] text-white font-bold rounded-md text-base hover:bg-black transition-colors">
            <Phone size={18} /> Call 857-422-6348
          </a>
        </div>
      </section>
    </>
  );
}
