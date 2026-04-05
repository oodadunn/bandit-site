import Link from "next/link";
import { Phone, Mail, MapPin } from "lucide-react";

const SERVICES = [
  { label: "Baler Repair", href: "/services/baler-repair" },
  { label: "Emergency Repair", href: "/services/emergency-repair" },
  { label: "Preventive Maintenance", href: "/services/preventive-maintenance" },
  { label: "Equipment Sales & Leasing", href: "/equipment" },
  { label: "Bale Wire Supply", href: "/wire" },
];

const STATES = [
  { label: "Georgia", href: "/service-area/georgia" },
  { label: "Florida", href: "/service-area/florida" },
  { label: "Alabama", href: "/service-area/alabama" },
  { label: "South Carolina", href: "/service-area/south-carolina" },
  { label: "North Carolina", href: "/service-area/north-carolina" },
  { label: "Tennessee", href: "/service-area/tennessee" },
];

export default function Footer() {
  return (
    <footer className="bg-[#050505] border-t border-[#1F2937] mt-24">
      <div className="container-site py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <Link href="/" className="inline-flex items-center gap-2.5 mb-4 group">
              <img
                src="/bandit-circle.png"
                alt="Bandit"
                width={36}
                height={36}
                className="w-9 h-9 rounded-full"
              />
              <div>
                <div className="text-2xl font-black text-white tracking-tighter leading-none group-hover:text-[#39FF14] transition-colors">BANDIT</div>
                <div className="text-xs text-gray-500 font-mono tracking-widest leading-tight">RECYCLING</div>
              </div>
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed mb-4">
              Automated B2B recycling partner. Baler repair, preventive maintenance, and bale wire supply across the Southeast US.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#39FF14]/10 border border-[#39FF14]/20 rounded-full">
              <span className="w-2 h-2 rounded-full bg-[#39FF14] animate-pulse" />
              <span className="text-xs font-mono text-[#39FF14]">24/7 Emergency Service</span>
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Services</h3>
            <ul className="space-y-2">
              {SERVICES.map((s) => (
                <li key={s.href}>
                  <Link href={s.href} className="text-sm text-gray-400 hover:text-white transition-colors">
                    {s.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Service Area */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Service Area</h3>
            <ul className="space-y-2">
              {STATES.map((s) => (
                <li key={s.href}>
                  <Link href={s.href} className="text-sm text-gray-400 hover:text-white transition-colors">
                    {s.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Contact</h3>
            <ul className="space-y-3">
              <li>
                <a href="tel:+18002263481" className="flex items-center gap-2 text-sm text-gray-400 hover:text-[#39FF14] transition-colors">
                  <Phone size={14} />
                  <span className="font-mono">1-800-BANDIT-1</span>
                </a>
              </li>
              <li>
                <a href="mailto:service@banditrecycling.com" className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors">
                  <Mail size={14} />
                  service@banditrecycling.com
                </a>
              </li>
              <li>
                <div className="flex items-start gap-2 text-sm text-gray-400">
                  <MapPin size={14} className="mt-0.5 shrink-0" />
                  <span>Southeast US<br />GA · FL · AL · SC · NC · TN</span>
                </div>
              </li>
            </ul>
            <div className="mt-6">
              <Link href="/quote" className="btn-primary text-xs px-4 py-2 w-full justify-center">
                Request a Quote
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-[#1F2937] flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-600">
            © {new Date().getFullYear()} Bandit Recycling. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="text-xs text-gray-600 hover:text-gray-400 transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="text-xs text-gray-600 hover:text-gray-400 transition-colors">Terms of Service</Link>
            <Link href="/sitemap.xml" className="text-xs text-gray-600 hover:text-gray-400 transition-colors">Sitemap</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
