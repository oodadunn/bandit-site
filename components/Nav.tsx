"use client";
import { useState } from "react";
import Link from "next/link";
import { Menu, X, Phone } from "lucide-react";

const NAV_LINKS = [
  {
    label: "Services",
    href: "/services",
    sub: [
      { label: "Baler Repair", href: "/services/baler-repair" },
      { label: "Emergency Repair", href: "/services/emergency-repair" },
      { label: "Preventive Maintenance", href: "/services/preventive-maintenance" },
      { label: "Vertical Balers", href: "/services/vertical-baler-repair" },
      { label: "Horizontal Balers", href: "/services/horizontal-baler-repair" },
    ],
  },
  { label: "Equipment", href: "/equipment" },
  { label: "Bale Wire", href: "/wire" },
  { label: "Service Area", href: "/service-area" },
  { label: "Resources", href: "/blog" },
];

export default function Nav() {
  const [open, setOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#0A0A0A]/95 backdrop-blur-sm border-b border-[#1F2937]">
      <div className="container-site">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <img
              src="/bandit-circle.png"
              alt="Bandit"
              width={32}
              height={32}
              className="w-8 h-8 rounded-full transition-all duration-200 group-hover:drop-shadow-[0_0_8px_rgba(57,255,20,0.6)]"
            />
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-black text-white tracking-tighter group-hover:text-[#39FF14] transition-colors">
                BANDIT
              </span>
              <span className="hidden sm:block text-xs text-gray-500 font-mono tracking-widest">
                RECYCLING
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <div
                key={link.label}
                className="relative"
                onMouseEnter={() => link.sub && setActiveDropdown(link.label)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <Link
                  href={link.href}
                  className="px-4 py-2 text-sm text-gray-300 hover:text-white font-medium transition-colors rounded-md hover:bg-white/5"
                >
                  {link.label}
                </Link>
                {link.sub && activeDropdown === link.label && (
                  <div className="absolute top-full left-0 pt-2 w-52">
                    <div className="bg-[#111111] border border-[#1F2937] rounded-xl p-2 shadow-2xl">
                      {link.sub.map((s) => (
                        <Link
                          key={s.href}
                          href={s.href}
                          className="block px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                        >
                          {s.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Right side */}
          <div className="hidden lg:flex items-center gap-3">
            <a
              href="tel:+1-800-BANDIT1"
              className="flex items-center gap-2 text-sm text-gray-400 hover:text-[#39FF14] transition-colors"
            >
              <Phone size={14} />
              <span className="font-mono">1-800-BANDIT-1</span>
            </a>
            <Link href="/quote" className="btn-primary text-xs px-4 py-2">
              Get a Quote
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setOpen(!open)}
            className="lg:hidden p-2 text-gray-400 hover:text-white transition-colors"
            aria-label="Toggle menu"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="lg:hidden bg-[#0A0A0A] border-t border-[#1F2937] px-4 py-4 space-y-1">
          {NAV_LINKS.map((link) => (
            <div key={link.label}>
              <Link
                href={link.href}
                onClick={() => setOpen(false)}
                className="block px-3 py-2 text-sm text-gray-300 hover:text-white font-medium rounded-md hover:bg-white/5 transition-colors"
              >
                {link.label}
              </Link>
              {link.sub && (
                <div className="ml-4 mt-1 space-y-1">
                  {link.sub.map((s) => (
                    <Link
                      key={s.href}
                      href={s.href}
                      onClick={() => setOpen(false)}
                      className="block px-3 py-1.5 text-xs text-gray-400 hover:text-white rounded-md hover:bg-white/5 transition-colors"
                    >
                      {s.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
          <div className="pt-3 flex flex-col gap-2">
            <a href="tel:+1-800-BANDIT1" className="btn-secondary text-sm">
              <Phone size={14} /> Call Us Now
            </a>
            <Link href="/quote" onClick={() => setOpen(false)} className="btn-primary text-sm">
              Get a Free Quote
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
