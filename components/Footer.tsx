import Link from "next/link";
import { Phone, Mail } from "lucide-react";

const SERVICES = [
  { label: "Baler Repair", href: "/services/baler-repair" },
  { label: "Emergency Repair", href: "/services/emergency-repair" },
  { label: "Preventive Maintenance", href: "/services/preventive-maintenance" },
  { label: "Equipment", href: "/equipment" },
  { label: "Bale Wire", href: "/wire" },
];

const COVERAGE = [
  { label: "All 50 States", href: "/service-area" },
  { label: "Southeast", href: "/service-area#southeast" },
  { label: "Northeast", href: "/service-area#northeast" },
  { label: "Midwest", href: "/service-area#midwest" },
  { label: "West", href: "/service-area#west" },
  { label: "Become a Partner", href: "/partners" },
];

const RESOURCES = [
  { label: "Materials Library", href: "/materials" },
  { label: "Baler Database", href: "/balers" },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/contact" },
  { label: "About Bandit", href: "/about" },
];

export default function Footer() {
  return (
    <footer
      className="mt-32"
      style={{
        background: "var(--bg-secondary)",
        borderTop: "1px solid var(--border-default)",
      }}
    >
      <div className="container-site py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div>
            <Link href="/" className="inline-flex items-center gap-3 mb-5 group">
              <img
                src="/bandit-circle.png"
                alt="Bandit"
                width={40}
                height={40}
                className="w-10 h-10 rounded-full group-hover:drop-shadow-[0_0_10px_rgba(57,255,20,0.6)] transition-all"
              />
              <div className="leading-tight">
                <div className="text-xl font-black tracking-[0.04em] uppercase" style={{ color: "var(--text-primary)" }}>
                  BANDIT
                </div>
                <div className="text-[10px] font-bold tracking-[0.3em] uppercase" style={{ color: "var(--text-tertiary)" }}>
                  RECYCLING
                </div>
              </div>
            </Link>
            <p className="text-sm leading-relaxed mb-5" style={{ color: "var(--text-secondary)" }}>
              Nationwide baler service, equipment, wire, and recycling logistics. 50 states. One number.
            </p>
            <div className="telemetry">
              <span className="pulse" /> Mission Online · 24/7
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-[10px] font-bold tracking-[0.3em] uppercase mb-5" style={{ color: "var(--green-accent)" }}>
              ◢ Services
            </h3>
            <ul className="space-y-3">
              {SERVICES.map((s) => (
                <li key={s.href}>
                  <Link
                    href={s.href}
                    className="text-[11px] font-semibold tracking-[0.14em] uppercase transition-colors hover:text-[#39FF14]"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {s.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Coverage */}
          <div>
            <h3 className="text-[10px] font-bold tracking-[0.3em] uppercase mb-5" style={{ color: "var(--green-accent)" }}>
              ◢ Coverage
            </h3>
            <ul className="space-y-3">
              {COVERAGE.map((s) => (
                <li key={s.href}>
                  <Link
                    href={s.href}
                    className="text-[11px] font-semibold tracking-[0.14em] uppercase transition-colors hover:text-[#39FF14]"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {s.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources + Contact */}
          <div>
            <h3 className="text-[10px] font-bold tracking-[0.3em] uppercase mb-5" style={{ color: "var(--green-accent)" }}>
              ◢ Resources
            </h3>
            <ul className="space-y-3 mb-8">
              {RESOURCES.map((s) => (
                <li key={s.href}>
                  <Link
                    href={s.href}
                    className="text-[11px] font-semibold tracking-[0.14em] uppercase transition-colors hover:text-[#39FF14]"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {s.label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="space-y-3">
              <a
                href="tel:+18574226348"
                className="flex items-center gap-2 text-xs font-bold tracking-[0.18em] uppercase transition-colors hover:text-[#39FF14]"
                style={{ color: "var(--text-primary)" }}
              >
                <Phone size={13} />
                857-422-6348
              </a>
              <a
                href="mailto:service@banditrecycling.com"
                className="flex items-center gap-2 text-[11px] transition-colors hover:text-[#39FF14]"
                style={{ color: "var(--text-secondary)" }}
              >
                <Mail size={13} />
                service@banditrecycling.com
              </a>
            </div>
          </div>
        </div>

        <div
          className="mt-16 pt-8 flex flex-col sm:flex-row items-center justify-between gap-3"
          style={{ borderTop: "1px solid var(--border-default)" }}
        >
          <p className="text-[10px] font-bold tracking-[0.25em] uppercase" style={{ color: "var(--text-muted)" }}>
            © {new Date().getFullYear()} Bandit Recycling · All Rights Reserved
          </p>
          <div className="flex items-center gap-6">
            <Link
              href="/privacy"
              className="text-[10px] font-bold tracking-[0.22em] uppercase transition-colors hover:text-[#39FF14]"
              style={{ color: "var(--text-muted)" }}
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              className="text-[10px] font-bold tracking-[0.22em] uppercase transition-colors hover:text-[#39FF14]"
              style={{ color: "var(--text-muted)" }}
            >
              Terms
            </Link>
            <Link
              href="/sitemap.xml"
              className="text-[10px] font-bold tracking-[0.22em] uppercase transition-colors hover:text-[#39FF14]"
              style={{ color: "var(--text-muted)" }}
            >
              Sitemap
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
