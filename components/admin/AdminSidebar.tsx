"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Phone,
  FileSearch,
  Building2,
  BarChart3,
  Network,
  BookOpen,
  Image as ImageIcon,
  Map,
  LogOut,
  Menu,
  X,
  ChevronRight,
} from "lucide-react";

// ─── Navigation structure ────────────────────────────────────────────────
// Each nav item either links to its own route, or links to /admin/dashboard
// with a ?tab= query param that the dashboard page reads to set its active
// tab. Grouped for visual scanability as the portal grows.

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  matchTab?: string; // if set, considered active when dashboard is on this tab
}
interface NavGroup {
  label: string;
  items: NavItem[];
}

const NAV: NavGroup[] = [
  {
    label: "Overview",
    items: [
      { label: "Dashboard", href: "/admin/dashboard?tab=overview", icon: LayoutDashboard, matchTab: "overview" },
    ],
  },
  {
    label: "Operations",
    items: [
      { label: "Leads", href: "/admin/dashboard?tab=leads", icon: Users, matchTab: "leads" },
      { label: "Calls", href: "/admin/dashboard?tab=calls", icon: Phone, matchTab: "calls" },
      { label: "Site Surveys", href: "/admin/dashboard?tab=surveys", icon: FileSearch, matchTab: "surveys" },
      { label: "Accounts", href: "/admin/dashboard?tab=accounts", icon: Building2, matchTab: "accounts" },
    ],
  },
  {
    label: "Growth",
    items: [
      { label: "Traffic & Analytics", href: "/admin/dashboard?tab=traffic", icon: BarChart3, matchTab: "traffic" },
      { label: "Partner Network", href: "/admin/dashboard?tab=partners", icon: Network, matchTab: "partners" },
    ],
  },
  {
    label: "Content",
    items: [
      { label: "Blog & Images", href: "/admin/blog", icon: ImageIcon },
    ],
  },
  {
    label: "Planning",
    items: [
      { label: "GTM Roadmap", href: "/admin/roadmap", icon: Map },
    ],
  },
];

// Determine if an item is the current page. Works with both path-based and
// tab-based routes since dashboard tabs live at /admin/dashboard?tab=X.
function useIsActive() {
  const pathname = usePathname();
  const params = useSearchParams();
  const currentTab = params.get("tab") ?? "overview";
  return (item: NavItem) => {
    const [itemPath] = item.href.split("?");
    if (pathname !== itemPath) return false;
    // If item is a dashboard tab link, match on the tab
    if (item.matchTab) return currentTab === item.matchTab;
    return true;
  };
}

export default function AdminSidebar() {
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const isActive = useIsActive();

  const logout = async () => {
    try {
      await fetch("/api/admin/auth", { method: "DELETE" });
    } catch {}
    router.push("/admin");
  };

  return (
    <>
      {/* Mobile menu button */}
      <button
        type="button"
        onClick={() => setMobileOpen((o) => !o)}
        className="lg:hidden fixed top-4 left-4 z-40 p-2 rounded-lg bg-[#111] border border-white/10 text-white"
        aria-label="Toggle admin menu"
      >
        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 z-30"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:sticky top-0 left-0 h-screen z-30 w-64 bg-[#0A0A0A] border-r border-white/8
          flex flex-col transition-transform duration-200
          ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* Brand */}
        <div className="px-5 py-5 border-b border-white/8">
          <Link href="/admin/dashboard" className="flex items-center gap-2.5 group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/bandit-circle.png" alt="" className="w-8 h-8 rounded-full" />
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-black text-white tracking-tight">BANDIT</span>
              <span className="text-[10px] text-gray-500 font-mono tracking-widest">ADMIN PORTAL</span>
            </div>
          </Link>
        </div>

        {/* Nav groups */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          {NAV.map((group) => (
            <div key={group.label} className="mb-5">
              <p className="px-3 text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-2">
                {group.label}
              </p>
              <ul className="space-y-0.5">
                {group.items.map((item) => {
                  const active = isActive(item);
                  const Icon = item.icon;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                        className={`
                          flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors
                          ${active
                            ? "bg-[#39FF14]/10 text-[#39FF14] font-semibold"
                            : "text-gray-400 hover:text-white hover:bg-white/5"}
                        `}
                      >
                        <Icon size={15} className="shrink-0" />
                        <span className="flex-1 truncate">{item.label}</span>
                        {active && <ChevronRight size={13} />}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* Footer — logout */}
        <div className="px-3 pb-4 pt-3 border-t border-white/8">
          <button
            type="button"
            onClick={logout}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm text-gray-400 hover:text-red-400 hover:bg-red-500/5 transition-colors"
          >
            <LogOut size={15} />
            Log out
          </button>
          <p className="text-[10px] text-gray-600 px-3 pt-3">
            Bandit Recycling · v{new Date().getFullYear()}
          </p>
        </div>
      </aside>
    </>
  );
}
