"use client";

import { CheckCircle2, Clock, Circle, Target, Cpu, Megaphone, Network, ShoppingBag, Bot } from "lucide-react";

// ─── Status definitions ──────────────────────────────────────────────────
type Status = "done" | "wip" | "planned";

const STATUS_META: Record<Status, { label: string; cls: string; icon: React.ComponentType<{ size?: number; className?: string }> }> = {
  done:    { label: "SHIPPED",  cls: "text-[#39FF14] bg-[#39FF14]/10 border-[#39FF14]/30",  icon: CheckCircle2 },
  wip:     { label: "IN PROGRESS", cls: "text-yellow-400 bg-yellow-500/10 border-yellow-500/30", icon: Clock },
  planned: { label: "PLANNED",  cls: "text-gray-500 bg-white/5 border-white/10",            icon: Circle },
};

interface Item {
  title: string;
  status: Status;
  detail?: string;
}
interface Phase {
  num: string;
  title: string;
  goal: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  items: Item[];
}

const PHASES: Phase[] = [
  {
    num: "0",
    title: "Foundation",
    goal: "Public-facing site, lead capture, internal data backbone.",
    icon: Cpu,
    items: [
      { title: "Live website (next.js + tailwind on Vercel)", status: "done" },
      { title: "Lead capture forms with Supabase backend", status: "done" },
      { title: "Admin dashboard with leads / calls / accounts / partners / surveys tabs", status: "done" },
      { title: "GA4 + traffic dashboard", status: "done" },
      { title: "CRM Phase 1 — accounts, contacts, equipment, deals tables", status: "done" },
      { title: "Site Survey form + admin review", status: "done" },
      { title: "Partner application + 225-prospect database", status: "done" },
    ],
  },
  {
    num: "1",
    title: "Service & Equipment Hub",
    goal: "Establish revenue via repair calls, equipment sales, wire orders.",
    icon: Target,
    items: [
      { title: "Service area pages (50 states via partner network)", status: "done" },
      { title: "Equipment catalog page", status: "done" },
      { title: "Bale wire shop page", status: "done" },
      { title: "Resources / materials glossary", status: "done" },
      { title: "Quote flow + email confirmation", status: "done" },
      { title: "Voice agents — 7 EL agents live on (857) 422-6348 with handoff", status: "done", detail: "Kevin → Savannah / Rex / Diesel / Nova / Scout / Atlas" },
      { title: "n8n agent infrastructure + Telegram routing", status: "done" },
    ],
  },
  {
    num: "2",
    title: "Automated Content & Ad Optimization",
    goal: "Self-updating SEO + ad engine that scales lead gen without daily ops.",
    icon: Megaphone,
    items: [
      { title: "Blog with posts + email-approval publish flow", status: "done" },
      { title: "Pixar-style image pipeline (Gemini 2.5 Flash Image)", status: "done", detail: "16:9 hero + thumbnail, pose library, content-aware prompts, transparent header art" },
      { title: "Visual style bible + brand reference assets", status: "done" },
      { title: "Backfill remaining ~10 blog posts with new image pipeline", status: "wip" },
      { title: "Auto-publish hook fires image gen on post publish", status: "done" },
      { title: "RSS-driven SEO content engine (industry news → topical authority)", status: "planned" },
      { title: "Google Search Console / keyword API integration", status: "planned" },
      { title: "Autonomous Google Ads agent with hard monthly budget caps", status: "planned" },
      { title: "Social media autoposting agent (LinkedIn + Twitter/X)", status: "planned" },
      { title: "Email drip campaigns triggered by lead behavior", status: "planned" },
    ],
  },
  {
    num: "3",
    title: "Circular Marketplace",
    goal: "Multi-sided platform — generators sell, buyers buy, Bandit handles logistics.",
    icon: ShoppingBag,
    items: [
      { title: "Modular marketplace schema (already designed in CRM)", status: "done" },
      { title: "Seller onboarding (commodity intake, photos, pricing)", status: "planned" },
      { title: "Buyer-side: live commodity feed + reverse auctions", status: "planned" },
      { title: "Logistics matchmaking (route optimization with partner truck network)", status: "planned" },
      { title: "Settlement + payout layer (escrow, hauler payment, generator credit)", status: "planned" },
    ],
  },
  {
    num: "4",
    title: "Full Autonomy",
    goal: "Bandit runs itself — agents handle inbound, outbound, content, ads, ops.",
    icon: Bot,
    items: [
      { title: "Inbound voice IVR routing live", status: "done" },
      { title: "Inbound SMS auto-response", status: "wip" },
      { title: "Outbound prospecting agent (cold email + voicemail drops)", status: "planned" },
      { title: "Quote-to-close agent (handles negotiation + scheduling)", status: "planned" },
      { title: "Daily ops report agent (Slack-style summary to Jason)", status: "planned" },
      { title: "$30k GP/mo target — autonomous mode", status: "planned" },
    ],
  },
];

function Pill({ status }: { status: Status }) {
  const meta = STATUS_META[status];
  const Icon = meta.icon;
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${meta.cls}`}>
      <Icon size={10} />
      {meta.label}
    </span>
  );
}

export default function RoadmapPage() {
  // Tally counts
  const totals = PHASES.reduce(
    (acc, p) => {
      for (const it of p.items) acc[it.status]++;
      acc.total += p.items.length;
      return acc;
    },
    { done: 0, wip: 0, planned: 0, total: 0 }
  );
  const pctDone = Math.round((totals.done / totals.total) * 100);

  return (
    <div className="text-white pb-20">
      <div className="max-w-5xl mx-auto px-6 lg:px-10 pt-10">
        <div className="mb-8">
          <h1 className="text-3xl font-black mb-1">GTM Roadmap</h1>
          <p className="text-gray-400 text-sm">
            Phased plan from foundation to fully autonomous operations. Each item gets a status pill — shipped, in progress, or planned.
          </p>
        </div>

        {/* Top-level stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10">
          <div className="card-dark">
            <div className="text-3xl font-black text-[#39FF14]">{totals.done}</div>
            <div className="text-[10px] uppercase tracking-widest text-gray-500 mt-1">Shipped</div>
          </div>
          <div className="card-dark">
            <div className="text-3xl font-black text-yellow-400">{totals.wip}</div>
            <div className="text-[10px] uppercase tracking-widest text-gray-500 mt-1">In Progress</div>
          </div>
          <div className="card-dark">
            <div className="text-3xl font-black text-gray-400">{totals.planned}</div>
            <div className="text-[10px] uppercase tracking-widest text-gray-500 mt-1">Planned</div>
          </div>
          <div className="card-dark">
            <div className="text-3xl font-black text-white">{pctDone}%</div>
            <div className="text-[10px] uppercase tracking-widest text-gray-500 mt-1">Complete</div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-12">
          <div className="h-2 rounded-full bg-white/5 overflow-hidden flex">
            <div className="bg-[#39FF14]" style={{ width: `${(totals.done / totals.total) * 100}%` }} />
            <div className="bg-yellow-400" style={{ width: `${(totals.wip / totals.total) * 100}%` }} />
          </div>
        </div>

        {/* Phase cards */}
        <div className="space-y-8">
          {PHASES.map((phase) => {
            const Icon = phase.icon;
            const phaseDone = phase.items.filter((i) => i.status === "done").length;
            const phasePct = Math.round((phaseDone / phase.items.length) * 100);
            return (
              <div key={phase.num} className="card-dark p-6">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-[#39FF14]/10 flex items-center justify-center shrink-0">
                    <Icon size={18} className="text-[#39FF14]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Phase {phase.num}</p>
                    <h2 className="text-xl font-black text-white">{phase.title}</h2>
                    <p className="text-sm text-gray-400 mt-1">{phase.goal}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-2xl font-black text-[#39FF14]">{phasePct}%</div>
                    <div className="text-[10px] text-gray-600 uppercase tracking-widest">{phaseDone}/{phase.items.length}</div>
                  </div>
                </div>

                <ul className="divide-y divide-white/5 border-t border-white/5">
                  {phase.items.map((it, idx) => (
                    <li key={idx} className="py-3 flex items-start gap-3">
                      <div className="shrink-0 pt-0.5">
                        <Pill status={it.status} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm ${it.status === "done" ? "text-gray-300" : it.status === "wip" ? "text-white" : "text-gray-400"}`}>
                          {it.title}
                        </p>
                        {it.detail && (
                          <p className="text-xs text-gray-600 mt-0.5">{it.detail}</p>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        <p className="text-xs text-gray-600 mt-10 text-center">
          Roadmap reflects the operating brief. Edit <code>app/admin/(portal)/roadmap/page.tsx</code> as the plan evolves.
        </p>
      </div>
    </div>
  );
}
