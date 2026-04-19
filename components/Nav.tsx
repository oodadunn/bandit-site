"use client";
import { useState } from "react";
import Link from "next/link";
import { Menu, X, Phone } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";

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
      { label: "Site Survey Form", href: "/site-survey" },
    ],
  },
  { label: "Equipment", href: "/equipment" },
  { label: "Bale Wire", href: "/wire" },
  { label: "Service Area", href: "/service-area" },
  { label: "Partners", href: "/partners" },
  {
    label: "Resources",
    href: "/materials",
    sub: [
      { label: "Materials Library", href: "/materials" },
      { label: "Baler Database", href: "/balers" },
      { label: "Blog", href: "/blog" },
    ],
  },
];

export default function Nav() {
  const [open, setOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md"
      style={{
        background: "linear-gradient(180deg, rgba(0,0,0,0.85), rgba(0,0,0,0.55))",
        borderBottom: "1px solid var(--border-default)",
      }}
    >
      <div className="container-site">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <img
              src="/bandit-circle.png"
              alt="Bandit"
              width={32}
              height={32}
              className="w-8 h-8 rounded-full transition-all duration-200 group-hover:drop-shadow-[0_0_10px_rgba(57,255,20,0.7)]"
            />
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-black tracking-[0.04em] uppercase" style={{ color: "var(--text-primary)" }}>
                BANDIT
              </span>
              <span className="hidden sm:block text-[10px] font-bold tracking-[0.3em] uppercase" style={{ color: "var(--text-tertiary)" }}>
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
                  className="px-3 py-2 text-[11px] font-bold tracking-[0.22em] uppercase transition-colors rounded-md"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {link.label}
                </Link>
                {link.sub && activeDropdown === link.label && (
                  <div className="absolute top-full left-0 pt-2 w-56">
                    <div
                      className="rounded-xl p-2 shadow-2xl"
                      style={{
                        background: "var(--bg-card)",
                        border: "1px solid var(--border-default)",
                      }}
                    >
                      {link.sub.map((s) => (
                        <Link
                          key={s.href}
                          href={s.href}
                          className="block px-3 py-2 text-xs font-semibold tracking-[0.12em] uppercase rounded-lg transition-colors"
                          style={{ color: "var(--text-secondary)" }}
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
          <div className="hidden xl:flex items-center gap-4">
            <a
              href="tel:+18574226348"
              className="flex items-center gap-2 text-[11px] font-bold tracking-[0.22em] uppercase transition-colors hover:text-[#39FF14]"
              style={{ color: "var(--text-tertiary)" }}
            >
              <Phone size={13} />
              <span>857-422-6348</span>
            </a>
            <ThemeToggle size={14} />
            <Link href="/quote" className="btn-primary text-[10px] px-4 py-2.5">
              Dispatch a Tech
            </Link>
          </div>

          <div className="hidden lg:flex xl:hidden items-center gap-2">
            <ThemeToggle size={14} />
            <Link href="/quote" className="btn-primary text-[10px] px-4 py-2.5">
              Dispatch
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setOpen(!open)}
            className="lg:hidden p-2 transition-colors"
            style={{ color: "var(--text-secondary)" }}
            aria-label="Toggle menu"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div
          className="lg:hidden px-4 py-4 space-y-1"
          style={{
            background: "var(--bg-primary)",
            borderTop: "1px solid var(--border-default)",
          }}
        >
          {NAV_LINKS.map((link) => (
            <div key={link.label}>
              <Link
                href={link.href}
                onClick={() => setOpen(false)}
                className="block px-3 py-2 text-[11px] font-bold tracking-[0.22em] uppercase rounded-md"
                style={{ color: "var(--text-secondary)" }}
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
                      className="block px-3 py-1.5 text-[10px] font-semibold tracking-[0.2em] uppercase rounded-md"
                      style={{ color: "var(--text-tertiary)" }}
                    >
                      {s.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
          <div className="pt-3 flex flex-col gap-2">
            <div className="flex items-center justify-between px-3 py-2">
              <span className="text-[10px] font-bold tracking-[0.25em] uppercase" style={{ color: "var(--text-tertiary)" }}>
                Theme
              </span>
              <ThemeToggle />
            </div>
            <a href="tel:+18574226348" className="btn-secondary text-[10px]">
              <Phone size={13} /> Call 857-422-6348
            </a>
            <Link href="/quote" onClick={() => setOpen(false)} className="btn-primary text-[10px]">
              Dispatch a Tech
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
