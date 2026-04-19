"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Activity,
  Phone,
  Users,
  TrendingUp,
  BarChart3,
  Clock,
  LogOut,
  Search,
  ChevronDown,
  ChevronUp,
  Eye,
  Building2,
  ArrowLeft,
  DollarSign,
  Wrench,
  MapPin,
  Mail,
} from "lucide-react";

interface Lead {
  id: string;
  created_at: string;
  form_type: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  state: string;
  urgency: string;
  status: string;
}

interface CallEvent {
  id: string;
  created_at: string;
  caller_phone: string;
  duration_seconds: number;
  sentiment: string;
  outcome: string;
  transcript: string;
}

interface AnalyticsData {
  id: string;
  date: string;
  sessions: number;
  page_views: number;
  users: number;
  bounce_rate: number;
  avg_session_duration: number;
  top_pages: Record<string, number>;
  traffic_sources: Record<string, number>;
}

interface AnalyticsSummary {
  ga4_connected?: boolean;
  daily: AnalyticsData[];
  summary: {
    last7: {
      sessions: number;
      page_views: number;
      users: number;
      bounce_rate: number;
      avg_session_duration: number;
    };
    last30: {
      sessions: number;
      page_views: number;
      users: number;
      bounce_rate: number;
      avg_session_duration: number;
    };
  };
}

type TabType = "overview" | "accounts" | "leads" | "calls" | "traffic" | "partners" | "surveys";

interface AccountListItem {
  id: string;
  name: string;
  domain: string | null;
  account_type: string | null;
  tier: string | null;
  city: string | null;
  state: string | null;
  primary_phone: string | null;
  owner_email: string | null;
  last_activity_at: string | null;
  created_at: string;
  deal_stats: { open_count: number; open_value: number; total_count: number };
}

interface AccountDetail {
  account: any;
  contacts: any[];
  equipment: any[];
  deals: any[];
  leads: any[];
  jobs: any[];
  activity: any[];
}

interface Partner {
  id: string;
  created_at: string;
  company_name: string;
  contact_name: string;
  phone: string;
  email: string;
  state: string;
  coverage_states: string[];
  service_types: string[];
  pipeline_stage: string;
  tier: string;
  avg_rating: number;
  review_count: number;
  last_contact_at: string | null;
}

interface PartnerDetail {
  partner: any;
  pricing: any[];
  reviews: any[];
}

export default function AdminDashboard() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0A0A0A]" />}>
      <AdminDashboardInner />
    </Suspense>
  );
}

function AdminDashboardInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  // activeTab syncs to the URL's ?tab= param so the sidebar can deep-link
  // into dashboard sub-sections (Leads, Calls, Traffic, etc.).
  const urlTab = searchParams.get("tab") as TabType | null;
  const [activeTab, setActiveTabState] = useState<TabType>(urlTab ?? "overview");

  // Keep state in sync when the URL tab changes (sidebar click while on dashboard)
  useEffect(() => {
    if (urlTab && urlTab !== activeTab) setActiveTabState(urlTab);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlTab]);

  const setActiveTab = (tab: TabType) => {
    setActiveTabState(tab);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("tab", tab);
      window.history.replaceState(null, "", url.toString());
    }
  };

  // Data states
  const [leads, setLeads] = useState<Lead[]>([]);
  const [calls, setCalls] = useState<CallEvent[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [leadsLoading, setLeadsLoading] = useState(false);
  const [callsLoading, setCallsLoading] = useState(false);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  // Expanded transcript state
  const [expandedCallId, setExpandedCallId] = useState<string | null>(null);

  // Search/filter
  const [leadsSearchType, setLeadsSearchType] = useState("all");

  // Accounts state
  const [accounts, setAccounts] = useState<AccountListItem[]>([]);
  const [accountsLoading, setAccountsLoading] = useState(false);
  const [accountsSearch, setAccountsSearch] = useState("");
  const [accountsType, setAccountsType] = useState("all");
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [accountDetail, setAccountDetail] = useState<AccountDetail | null>(null);
  const [accountDetailLoading, setAccountDetailLoading] = useState(false);

  // Partners state
  const [partners, setPartners] = useState<Partner[]>([]);
  const [partnersLoading, setPartnersLoading] = useState(false);
  const [partnersSearch, setPartnersSearch] = useState("");
  const [partnersState, setPartnersState] = useState("all");
  const [partnersPipelineStage, setPartnersPipelineStage] = useState("all");
  const [partnersTier, setPartnersTier] = useState("all");
  const [selectedPartnerId, setSelectedPartnerId] = useState<string | null>(null);
  const [partnerDetail, setPartnerDetail] = useState<PartnerDetail | null>(null);
  const [partnerDetailLoading, setPartnerDetailLoading] = useState(false);

  // Surveys state
  const [surveys, setSurveys] = useState<any[]>([]);
  const [surveysLoading, setSurveysLoading] = useState(false);
  const [selectedSurveyId, setSelectedSurveyId] = useState<string | null>(null);

  // Check auth on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/admin/auth", {
          credentials: "include",
        });
        const data = await response.json();
        if (!data.ok) {
          router.push("/admin");
        } else {
          setIsAuthenticated(true);
        }
      } catch (err) {
        console.error("Auth check failed:", err);
        router.push("/admin");
      } finally {
        setIsChecking(false);
      }
    };
    checkAuth();
  }, [router]);

  // Load leads
  useEffect(() => {
    if (!isAuthenticated) return;
    const loadLeads = async () => {
      setLeadsLoading(true);
      try {
        const response = await fetch("/api/admin/leads", {
          credentials: "include",
        });
        if (response.ok) {
          const data = await response.json();
          setLeads(data);
        }
      } catch (err) {
        console.error("Failed to load leads:", err);
      } finally {
        setLeadsLoading(false);
      }
    };
    loadLeads();
  }, [isAuthenticated]);

  // Load calls
  useEffect(() => {
    if (!isAuthenticated) return;
    const loadCalls = async () => {
      setCallsLoading(true);
      try {
        const response = await fetch("/api/admin/calls", {
          credentials: "include",
        });
        if (response.ok) {
          const data = await response.json();
          setCalls(data);
        }
      } catch (err) {
        console.error("Failed to load calls:", err);
      } finally {
        setCallsLoading(false);
      }
    };
    loadCalls();
  }, [isAuthenticated]);

  // Load analytics
  useEffect(() => {
    if (!isAuthenticated) return;
    const loadAnalytics = async () => {
      setAnalyticsLoading(true);
      try {
        const response = await fetch("/api/admin/analytics", {
          credentials: "include",
        });
        if (response.ok) {
          const data = await response.json();
          setAnalytics(data);
        }
      } catch (err) {
        console.error("Failed to load analytics:", err);
      } finally {
        setAnalyticsLoading(false);
      }
    };
    loadAnalytics();
  }, [isAuthenticated]);

  // Load accounts when tab is opened
  useEffect(() => {
    if (!isAuthenticated || activeTab !== "accounts" || selectedAccountId) return;
    const loadAccounts = async () => {
      setAccountsLoading(true);
      try {
        const params = new URLSearchParams();
        if (accountsSearch) params.set("q", accountsSearch);
        if (accountsType && accountsType !== "all") params.set("type", accountsType);
        const response = await fetch(`/api/admin/accounts?${params.toString()}`, {
          credentials: "include",
        });
        if (response.ok) {
          const data = await response.json();
          setAccounts(data);
        }
      } catch (err) {
        console.error("Failed to load accounts:", err);
      } finally {
        setAccountsLoading(false);
      }
    };
    loadAccounts();
  }, [isAuthenticated, activeTab, accountsSearch, accountsType, selectedAccountId]);

  // Load account detail when one is selected
  useEffect(() => {
    if (!selectedAccountId) {
      setAccountDetail(null);
      return;
    }
    const loadDetail = async () => {
      setAccountDetailLoading(true);
      try {
        const response = await fetch(`/api/admin/accounts/${selectedAccountId}`, {
          credentials: "include",
        });
        if (response.ok) {
          const data = await response.json();
          setAccountDetail(data);
        }
      } catch (err) {
        console.error("Failed to load account detail:", err);
      } finally {
        setAccountDetailLoading(false);
      }
    };
    loadDetail();
  }, [selectedAccountId]);

  // Load partners when tab is opened
  useEffect(() => {
    if (!isAuthenticated || activeTab !== "partners" || selectedPartnerId) return;
    const loadPartners = async () => {
      setPartnersLoading(true);
      try {
        const params = new URLSearchParams();
        if (partnersSearch) params.set("q", partnersSearch);
        if (partnersState && partnersState !== "all") params.set("state", partnersState);
        if (partnersPipelineStage && partnersPipelineStage !== "all") params.set("stage", partnersPipelineStage);
        if (partnersTier && partnersTier !== "all") params.set("tier", partnersTier);
        const response = await fetch(`/api/admin/partners?${params.toString()}`, {
          credentials: "include",
        });
        if (response.ok) {
          const data = await response.json();
          setPartners(data);
        }
      } catch (err) {
        console.error("Failed to load partners:", err);
      } finally {
        setPartnersLoading(false);
      }
    };
    loadPartners();
  }, [isAuthenticated, activeTab, partnersSearch, partnersState, partnersPipelineStage, partnersTier, selectedPartnerId]);

  // Load partner detail
  useEffect(() => {
    if (!selectedPartnerId) {
      setPartnerDetail(null);
      return;
    }
    const loadDetail = async () => {
      setPartnerDetailLoading(true);
      try {
        const response = await fetch(`/api/admin/partners/${selectedPartnerId}`, {
          credentials: "include",
        });
        if (response.ok) {
          const data = await response.json();
          setPartnerDetail(data);
        }
      } catch (err) {
        console.error("Failed to load partner detail:", err);
      } finally {
        setPartnerDetailLoading(false);
      }
    };
    loadDetail();
  }, [selectedPartnerId]);

  // Load surveys when tab is opened
  useEffect(() => {
    if (!isAuthenticated || activeTab !== "surveys") return;
    const loadSurveys = async () => {
      setSurveysLoading(true);
      try {
        const response = await fetch("/api/admin/surveys", { credentials: "include" });
        if (response.ok) {
          const data = await response.json();
          setSurveys(data.surveys || []);
        }
      } catch (err) {
        console.error("Failed to load surveys:", err);
      } finally {
        setSurveysLoading(false);
      }
    };
    loadSurveys();
  }, [isAuthenticated, activeTab]);

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/auth", {
        method: "DELETE",
        credentials: "include",
      });
      router.push("/admin");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  if (isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div
          className="text-lg"
          style={{ color: "var(--text-secondary)" }}
        >
          Checking authentication...
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const recentLeads = leads.slice(0, 10);
  const recentCalls = calls.slice(0, 10);

  // Calculate KPIs
  const totalLeads = leads.length;
  const callsToday = calls.filter((c) => {
    const date = new Date(c.created_at).toDateString();
    return date === new Date().toDateString();
  }).length;
  const sessions = analytics?.summary.last7.sessions || 0;
  const conversionRate = sessions > 0 ? ((totalLeads / sessions) * 100).toFixed(2) : "0.00";

  // Filtered leads
  const filteredLeads =
    leadsSearchType === "all"
      ? leads
      : leads.filter((l) => l.form_type === leadsSearchType);

  // Helper functions
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const secondsAgo = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (secondsAgo < 60) return "just now";
    if (secondsAgo < 3600) return `${Math.floor(secondsAgo / 60)}m ago`;
    if (secondsAgo < 86400) return `${Math.floor(secondsAgo / 3600)}h ago`;
    if (secondsAgo < 604800) return `${Math.floor(secondsAgo / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const maskPhone = (phone: string) => {
    if (!phone) return "***";
    const last4 = phone.slice(-4);
    return `***-****-${last4}`;
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency?.toLowerCase()) {
      case "emergency":
        return "#EF4444"; // red
      case "urgent":
        return "#F59E0B"; // yellow
      case "standard":
        return "var(--green-accent)";
      default:
        return "var(--text-secondary)";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "new":
        return "#3B82F6"; // blue
      case "contacted":
        return "#F59E0B"; // yellow
      case "converted":
        return "var(--green-accent)";
      case "closed":
        return "#6B7280"; // gray
      default:
        return "var(--text-secondary)";
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment?.toLowerCase()) {
      case "positive":
        return "var(--green-accent)";
      case "neutral":
        return "#6B7280";
      case "negative":
        return "#EF4444";
      default:
        return "var(--text-secondary)";
    }
  };

  const getOutcomeColor = (outcome: string) => {
    switch (outcome?.toLowerCase()) {
      case "completed":
        return "var(--green-accent)";
      case "no answer":
        return "#6B7280";
      case "voicemail":
        return "#F59E0B";
      case "interested":
        return "#3B82F6";
      default:
        return "var(--text-secondary)";
    }
  };

  const getPipelineStageColor = (stage: string) => {
    switch (stage?.toLowerCase()) {
      case "prospect": return "#6B7280";
      case "contacted": return "#F59E0B";
      case "interested": return "#3B82F6";
      case "verified": return "#8B5CF6";
      case "compliant": return "#06B6D4";
      case "rate_card": return "#EC4899";
      case "active": return "var(--green-accent)";
      case "inactive": return "#EF4444";
      default: return "var(--text-secondary)";
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier?.toLowerCase()) {
      case "gold": return "#FFD700";
      case "silver": return "#C0C0C0";
      case "bronze": return "#CD7F32";
      case "probation": return "#EF4444";
      case "unrated": return "#6B7280";
      default: return "var(--text-secondary)";
    }
  };

  const updatePartner = async (id: string, updates: any) => {
    try {
      const response = await fetch(`/api/admin/partners/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(updates),
      });
      if (response.ok) {
        const updated = await response.json();
        if (partnerDetail) {
          setPartnerDetail({ ...partnerDetail, partner: updated });
        }
        setPartners((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
      }
    } catch (err) {
      console.error("Failed to update partner:", err);
    }
  };

  // KPI Card Component
  const KPICard = ({
    label,
    value,
    icon: Icon,
    color = "var(--green-accent)",
  }: {
    label: string;
    value: string | number;
    icon: any;
    color?: string;
  }) => (
    <div
      className="p-6 rounded-lg border"
      style={{
        backgroundColor: "var(--bg-card)",
        borderColor: "var(--border-default)",
      }}
    >
      <div className="flex items-start justify-between">
        <div>
          <p
            className="text-sm font-medium mb-2"
            style={{ color: "var(--text-secondary)" }}
          >
            {label}
          </p>
          <p
            className="text-3xl font-bold"
            style={{ color: "var(--text-primary)" }}
          >
            {value}
          </p>
        </div>
        <Icon size={24} style={{ color }} opacity={0.6} />
      </div>
    </div>
  );

  return (
    <div style={{ backgroundColor: "var(--bg-primary)" }} className="min-h-screen">
      {/* Top Bar */}
      <div
        className="border-b sticky top-0 z-40"
        style={{
          backgroundColor: "var(--bg-card)",
          borderColor: "var(--border-default)",
        }}
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
              Bandit Admin
            </h1>
            <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-md font-semibold transition-all hover:opacity-80"
            style={{
              backgroundColor: "var(--bg-primary)",
              color: "var(--text-primary)",
              border: `1px solid var(--border-default)`,
            }}
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div
        className="border-b"
        style={{
          backgroundColor: "var(--bg-card)",
          borderColor: "var(--border-default)",
        }}
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-8">
            {(["overview", "accounts", "leads", "calls", "traffic", "partners", "surveys"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className="py-4 px-1 font-semibold text-sm transition-all capitalize border-b-2"
                style={{
                  color:
                    activeTab === tab
                      ? "var(--green-accent)"
                      : "var(--text-secondary)",
                  borderColor:
                    activeTab === tab
                      ? "var(--green-accent)"
                      : "transparent",
                }}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* OVERVIEW TAB */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <KPICard label="Total Leads" value={totalLeads} icon={Users} />
              <KPICard label="Calls Today" value={callsToday} icon={Phone} />
              <KPICard label="Sessions (7d)" value={sessions} icon={Activity} />
              <KPICard
                label="Conversion Rate"
                value={`${conversionRate}%`}
                icon={TrendingUp}
              />
            </div>

            {/* Recent Leads & Calls */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Recent Leads */}
              <div
                className="rounded-lg border p-6"
                style={{
                  backgroundColor: "var(--bg-card)",
                  borderColor: "var(--border-default)",
                }}
              >
                <h2
                  className="text-lg font-bold mb-4"
                  style={{ color: "var(--text-primary)" }}
                >
                  Recent Leads
                </h2>
                {recentLeads.length === 0 ? (
                  <p style={{ color: "var(--text-secondary)" }}>No leads yet</p>
                ) : (
                  <div className="space-y-3">
                    {recentLeads.map((lead) => (
                      <div
                        key={lead.id}
                        className="p-3 rounded-md border"
                        style={{
                          backgroundColor: "var(--bg-primary)",
                          borderColor: "var(--border-default)",
                        }}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p
                              className="font-semibold text-sm"
                              style={{ color: "var(--text-primary)" }}
                            >
                              {lead.name || "Unknown"}
                            </p>
                            <p
                              className="text-xs"
                              style={{ color: "var(--text-secondary)" }}
                            >
                              {lead.company || "No company"}
                            </p>
                          </div>
                          <span
                            className="text-xs px-2 py-1 rounded-md font-semibold"
                            style={{
                              backgroundColor: "var(--green-bg)",
                              color: "var(--green-accent)",
                            }}
                          >
                            {lead.form_type.replace(/_/g, " ")}
                          </span>
                        </div>
                        <p
                          className="text-xs"
                          style={{ color: "var(--text-tertiary)" }}
                        >
                          {lead.state ? `${lead.state} • ` : ""}
                          {formatDate(lead.created_at)}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Recent Calls */}
              <div
                className="rounded-lg border p-6"
                style={{
                  backgroundColor: "var(--bg-card)",
                  borderColor: "var(--border-default)",
                }}
              >
                <h2
                  className="text-lg font-bold mb-4"
                  style={{ color: "var(--text-primary)" }}
                >
                  Recent Calls
                </h2>
                {recentCalls.length === 0 ? (
                  <p style={{ color: "var(--text-secondary)" }}>No calls yet</p>
                ) : (
                  <div className="space-y-3">
                    {recentCalls.map((call) => (
                      <div
                        key={call.id}
                        className="p-3 rounded-md border"
                        style={{
                          backgroundColor: "var(--bg-primary)",
                          borderColor: "var(--border-default)",
                        }}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p
                              className="font-semibold text-sm"
                              style={{ color: "var(--text-primary)" }}
                            >
                              {maskPhone(call.caller_phone)}
                            </p>
                            <p
                              className="text-xs flex items-center gap-1"
                              style={{ color: "var(--text-secondary)" }}
                            >
                              <Clock size={12} />
                              {formatDuration(call.duration_seconds)}
                            </p>
                          </div>
                          <span
                            className="text-xs px-2 py-1 rounded-md font-semibold"
                            style={{
                              backgroundColor: `${getOutcomeColor(call.outcome)}15`,
                              color: getOutcomeColor(call.outcome),
                            }}
                          >
                            {call.outcome}
                          </span>
                        </div>
                        <p
                          className="text-xs"
                          style={{ color: "var(--text-tertiary)" }}
                        >
                          {formatDate(call.created_at)}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ACCOUNTS TAB */}
        {activeTab === "accounts" && !selectedAccountId && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div
                className="flex-1 flex items-center gap-2 px-3 py-2 rounded-md border"
                style={{
                  backgroundColor: "var(--bg-card)",
                  borderColor: "var(--border-default)",
                }}
              >
                <Search size={18} style={{ color: "var(--text-secondary)" }} />
                <input
                  type="text"
                  placeholder="Search accounts by name, domain, city..."
                  value={accountsSearch}
                  onChange={(e) => setAccountsSearch(e.target.value)}
                  className="flex-1 bg-transparent outline-none text-sm"
                  style={{ color: "var(--text-primary)" }}
                />
              </div>
              <select
                value={accountsType}
                onChange={(e) => setAccountsType(e.target.value)}
                className="px-3 py-2 rounded-md border font-semibold text-sm cursor-pointer"
                style={{
                  backgroundColor: "var(--bg-card)",
                  borderColor: "var(--border-default)",
                  color: "var(--text-primary)",
                }}
              >
                <option value="all">All Types</option>
                <option value="prospect">Prospects</option>
                <option value="customer">Customers</option>
                <option value="partner">Partners</option>
                <option value="vendor">Vendors</option>
                <option value="lost">Lost</option>
              </select>
            </div>

            <div
              className="rounded-lg border overflow-hidden"
              style={{
                backgroundColor: "var(--bg-card)",
                borderColor: "var(--border-default)",
              }}
            >
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr
                      style={{
                        backgroundColor: "var(--bg-primary)",
                        borderBottom: `1px solid var(--border-default)`,
                      }}
                    >
                      <th
                        className="px-6 py-3 text-left text-xs font-semibold"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        Account
                      </th>
                      <th
                        className="px-6 py-3 text-left text-xs font-semibold"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        Type
                      </th>
                      <th
                        className="px-6 py-3 text-left text-xs font-semibold"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        Tier
                      </th>
                      <th
                        className="px-6 py-3 text-left text-xs font-semibold"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        Location
                      </th>
                      <th
                        className="px-6 py-3 text-left text-xs font-semibold"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        Open Deals
                      </th>
                      <th
                        className="px-6 py-3 text-left text-xs font-semibold"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        Pipeline
                      </th>
                      <th
                        className="px-6 py-3 text-left text-xs font-semibold"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        Last Activity
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {accountsLoading ? (
                      <tr>
                        <td
                          colSpan={7}
                          className="px-6 py-8 text-center"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          Loading accounts...
                        </td>
                      </tr>
                    ) : accounts.length === 0 ? (
                      <tr>
                        <td
                          colSpan={7}
                          className="px-6 py-12 text-center"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          <Building2
                            size={32}
                            className="mx-auto mb-3"
                            style={{ color: "var(--text-secondary)" }}
                            opacity={0.5}
                          />
                          No accounts yet. New leads will auto-create accounts.
                        </td>
                      </tr>
                    ) : (
                      accounts.map((acc) => (
                        <tr
                          key={acc.id}
                          onClick={() => setSelectedAccountId(acc.id)}
                          className="cursor-pointer hover:opacity-80 transition-opacity"
                          style={{
                            borderBottom: `1px solid var(--border-default)`,
                          }}
                        >
                          <td className="px-6 py-4">
                            <div
                              className="font-semibold text-sm"
                              style={{ color: "var(--text-primary)" }}
                            >
                              {acc.name}
                            </div>
                            {acc.domain && (
                              <div
                                className="text-xs"
                                style={{ color: "var(--text-tertiary)" }}
                              >
                                {acc.domain}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 text-xs">
                            <span
                              className="px-2 py-1 rounded-md font-semibold capitalize"
                              style={{
                                backgroundColor: "var(--green-bg)",
                                color: "var(--green-accent)",
                              }}
                            >
                              {acc.account_type || "—"}
                            </span>
                          </td>
                          <td
                            className="px-6 py-4 text-sm font-mono"
                            style={{ color: "var(--text-primary)" }}
                          >
                            {acc.tier || "—"}
                          </td>
                          <td
                            className="px-6 py-4 text-sm"
                            style={{ color: "var(--text-secondary)" }}
                          >
                            {[acc.city, acc.state].filter(Boolean).join(", ") || "—"}
                          </td>
                          <td
                            className="px-6 py-4 text-sm font-semibold"
                            style={{ color: "var(--text-primary)" }}
                          >
                            {acc.deal_stats.open_count}
                          </td>
                          <td
                            className="px-6 py-4 text-sm"
                            style={{ color: "var(--green-accent)" }}
                          >
                            {acc.deal_stats.open_value > 0
                              ? `$${acc.deal_stats.open_value.toLocaleString()}`
                              : "—"}
                          </td>
                          <td
                            className="px-6 py-4 text-xs"
                            style={{ color: "var(--text-secondary)" }}
                          >
                            {acc.last_activity_at
                              ? formatDate(acc.last_activity_at)
                              : formatDate(acc.created_at)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ACCOUNT DETAIL */}
        {activeTab === "accounts" && selectedAccountId && (
          <div className="space-y-6">
            <button
              onClick={() => setSelectedAccountId(null)}
              className="flex items-center gap-2 text-sm font-semibold transition-opacity hover:opacity-80"
              style={{ color: "var(--text-secondary)" }}
            >
              <ArrowLeft size={16} />
              Back to accounts
            </button>

            {accountDetailLoading || !accountDetail ? (
              <p style={{ color: "var(--text-secondary)" }}>Loading account...</p>
            ) : (
              <>
                {/* Header */}
                <div
                  className="rounded-lg border p-6"
                  style={{
                    backgroundColor: "var(--bg-card)",
                    borderColor: "var(--border-default)",
                  }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h2
                        className="text-2xl font-bold mb-1"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {accountDetail.account.name}
                      </h2>
                      <div
                        className="flex items-center gap-3 text-sm"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        {accountDetail.account.domain && (
                          <span>{accountDetail.account.domain}</span>
                        )}
                        {accountDetail.account.primary_phone && (
                          <span>{accountDetail.account.primary_phone}</span>
                        )}
                        {(accountDetail.account.city || accountDetail.account.state) && (
                          <span className="flex items-center gap-1">
                            <MapPin size={12} />
                            {[accountDetail.account.city, accountDetail.account.state]
                              .filter(Boolean)
                              .join(", ")}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className="text-xs px-3 py-1 rounded-md font-semibold capitalize"
                        style={{
                          backgroundColor: "var(--green-bg)",
                          color: "var(--green-accent)",
                        }}
                      >
                        {accountDetail.account.account_type || "prospect"}
                      </span>
                      <span
                        className="text-xs px-3 py-1 rounded-md font-semibold font-mono"
                        style={{
                          backgroundColor: "var(--bg-primary)",
                          color: "var(--text-primary)",
                          border: `1px solid var(--border-default)`,
                        }}
                      >
                        Tier {accountDetail.account.tier || "C"}
                      </span>
                    </div>
                  </div>
                  {accountDetail.account.notes && (
                    <p
                      className="text-sm mt-2 pt-3 border-t"
                      style={{
                        color: "var(--text-secondary)",
                        borderColor: "var(--border-default)",
                      }}
                    >
                      {accountDetail.account.notes}
                    </p>
                  )}
                </div>

                {/* Two-column: Deals + Contacts/Equipment */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Deals */}
                  <div
                    className="rounded-lg border p-6"
                    style={{
                      backgroundColor: "var(--bg-card)",
                      borderColor: "var(--border-default)",
                    }}
                  >
                    <h3
                      className="font-bold mb-4 flex items-center gap-2"
                      style={{ color: "var(--text-primary)" }}
                    >
                      <DollarSign size={18} />
                      Deals ({accountDetail.deals.length})
                    </h3>
                    {accountDetail.deals.length === 0 ? (
                      <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                        No deals yet
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {accountDetail.deals.map((d: any) => (
                          <div
                            key={d.id}
                            className="p-3 rounded-md border"
                            style={{
                              backgroundColor: "var(--bg-primary)",
                              borderColor: "var(--border-default)",
                            }}
                          >
                            <div className="flex items-start justify-between mb-1">
                              <p
                                className="text-sm font-semibold"
                                style={{ color: "var(--text-primary)" }}
                              >
                                {d.name}
                              </p>
                              <span
                                className="text-xs px-2 py-0.5 rounded-md font-semibold capitalize"
                                style={{
                                  backgroundColor: "var(--green-bg)",
                                  color: "var(--green-accent)",
                                }}
                              >
                                {d.stage}
                              </span>
                            </div>
                            <div
                              className="flex items-center gap-3 text-xs"
                              style={{ color: "var(--text-secondary)" }}
                            >
                              <span className="capitalize">
                                {d.deal_type?.replace(/_/g, " ")}
                              </span>
                              {d.amount_usd && <span>${Number(d.amount_usd).toLocaleString()}</span>}
                              <span>{formatDate(d.created_at)}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Contacts */}
                  <div
                    className="rounded-lg border p-6"
                    style={{
                      backgroundColor: "var(--bg-card)",
                      borderColor: "var(--border-default)",
                    }}
                  >
                    <h3
                      className="font-bold mb-4 flex items-center gap-2"
                      style={{ color: "var(--text-primary)" }}
                    >
                      <Users size={18} />
                      Contacts ({accountDetail.contacts.length})
                    </h3>
                    {accountDetail.contacts.length === 0 ? (
                      <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                        No contacts yet
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {accountDetail.contacts.map((c: any) => (
                          <div
                            key={c.id}
                            className="p-3 rounded-md border"
                            style={{
                              backgroundColor: "var(--bg-primary)",
                              borderColor: "var(--border-default)",
                            }}
                          >
                            <p
                              className="text-sm font-semibold"
                              style={{ color: "var(--text-primary)" }}
                            >
                              {c.full_name ||
                                [c.first_name, c.last_name].filter(Boolean).join(" ") ||
                                "Unknown"}
                              {c.is_primary && (
                                <span
                                  className="ml-2 text-xs"
                                  style={{ color: "var(--green-accent)" }}
                                >
                                  (primary)
                                </span>
                              )}
                            </p>
                            {c.title && (
                              <p
                                className="text-xs"
                                style={{ color: "var(--text-tertiary)" }}
                              >
                                {c.title}
                              </p>
                            )}
                            <div
                              className="flex items-center gap-3 text-xs mt-1"
                              style={{ color: "var(--text-secondary)" }}
                            >
                              {c.email && (
                                <span className="flex items-center gap-1">
                                  <Mail size={12} />
                                  {c.email}
                                </span>
                              )}
                              {c.phone && (
                                <span className="flex items-center gap-1">
                                  <Phone size={12} />
                                  {c.phone}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Equipment */}
                  <div
                    className="rounded-lg border p-6"
                    style={{
                      backgroundColor: "var(--bg-card)",
                      borderColor: "var(--border-default)",
                    }}
                  >
                    <h3
                      className="font-bold mb-4 flex items-center gap-2"
                      style={{ color: "var(--text-primary)" }}
                    >
                      <Wrench size={18} />
                      Equipment ({accountDetail.equipment.length})
                    </h3>
                    {accountDetail.equipment.length === 0 ? (
                      <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                        No equipment on file
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {accountDetail.equipment.map((e: any) => (
                          <div
                            key={e.id}
                            className="p-3 rounded-md border"
                            style={{
                              backgroundColor: "var(--bg-primary)",
                              borderColor: "var(--border-default)",
                            }}
                          >
                            <p
                              className="text-sm font-semibold"
                              style={{ color: "var(--text-primary)" }}
                            >
                              {[e.make, e.model].filter(Boolean).join(" ") || "Baler"}
                            </p>
                            <div
                              className="flex items-center gap-3 text-xs mt-1"
                              style={{ color: "var(--text-secondary)" }}
                            >
                              {e.baler_type && (
                                <span className="capitalize">{e.baler_type}</span>
                              )}
                              {e.serial_number && <span>SN: {e.serial_number}</span>}
                              {e.status && (
                                <span className="capitalize">{e.status.replace(/_/g, " ")}</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Activity feed */}
                  <div
                    className="rounded-lg border p-6"
                    style={{
                      backgroundColor: "var(--bg-card)",
                      borderColor: "var(--border-default)",
                    }}
                  >
                    <h3
                      className="font-bold mb-4 flex items-center gap-2"
                      style={{ color: "var(--text-primary)" }}
                    >
                      <Activity size={18} />
                      Activity
                    </h3>
                    {accountDetail.activity.length === 0 ? (
                      <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                        No activity yet
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {accountDetail.activity.slice(0, 8).map((a: any) => (
                          <div
                            key={a.id}
                            className="p-2 rounded-md text-xs"
                            style={{
                              backgroundColor: "var(--bg-primary)",
                              color: "var(--text-secondary)",
                            }}
                          >
                            <span
                              className="font-semibold capitalize"
                              style={{ color: "var(--text-primary)" }}
                            >
                              {a.activity_type}
                            </span>
                            {a.notes && <span> — {a.notes}</span>}
                            <div
                              className="text-xs mt-0.5"
                              style={{ color: "var(--text-tertiary)" }}
                            >
                              {formatDate(a.created_at)}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* LEADS TAB */}
        {activeTab === "leads" && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-md border"
                style={{
                  backgroundColor: "var(--bg-card)",
                  borderColor: "var(--border-default)",
                }}>
                <Search size={18} style={{ color: "var(--text-secondary)" }} />
                <input
                  type="text"
                  placeholder="Search by type..."
                  value={leadsSearchType}
                  onChange={(e) => setLeadsSearchType(e.target.value)}
                  className="flex-1 bg-transparent outline-none text-sm"
                  style={{ color: "var(--text-primary)" }}
                />
              </div>
              <select
                value={leadsSearchType}
                onChange={(e) => setLeadsSearchType(e.target.value)}
                className="px-3 py-2 rounded-md border font-semibold text-sm cursor-pointer"
                style={{
                  backgroundColor: "var(--bg-card)",
                  borderColor: "var(--border-default)",
                  color: "var(--text-primary)",
                }}
              >
                <option value="all">All Types</option>
                <option value="service_quote">Service Quote</option>
                <option value="emergency">Emergency</option>
                <option value="maintenance">Maintenance</option>
                <option value="wire_quote">Wire Quote</option>
                <option value="equipment">Equipment</option>
              </select>
            </div>

            <div
              className="rounded-lg border overflow-hidden"
              style={{
                backgroundColor: "var(--bg-card)",
                borderColor: "var(--border-default)",
              }}
            >
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr
                      style={{
                        backgroundColor: "var(--bg-primary)",
                        borderBottom: `1px solid var(--border-default)`,
                      }}
                    >
                      <th className="px-6 py-3 text-left text-xs font-semibold" style={{ color: "var(--text-secondary)" }}>Date</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold" style={{ color: "var(--text-secondary)" }}>Name</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold" style={{ color: "var(--text-secondary)" }}>Company</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold" style={{ color: "var(--text-secondary)" }}>Type</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold" style={{ color: "var(--text-secondary)" }}>State</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold" style={{ color: "var(--text-secondary)" }}>Urgency</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold" style={{ color: "var(--text-secondary)" }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leadsLoading ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-8 text-center" style={{ color: "var(--text-secondary)" }}>
                          Loading...
                        </td>
                      </tr>
                    ) : filteredLeads.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-8 text-center" style={{ color: "var(--text-secondary)" }}>
                          No leads found
                        </td>
                      </tr>
                    ) : (
                      filteredLeads.map((lead) => (
                        <tr
                          key={lead.id}
                          style={{
                            borderBottom: `1px solid var(--border-default)`,
                          }}
                        >
                          <td className="px-6 py-4 text-xs" style={{ color: "var(--text-secondary)" }}>
                            {new Date(lead.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 text-sm" style={{ color: "var(--text-primary)" }}>
                            {lead.name || "—"}
                          </td>
                          <td className="px-6 py-4 text-sm" style={{ color: "var(--text-secondary)" }}>
                            {lead.company || "—"}
                          </td>
                          <td className="px-6 py-4 text-xs">
                            <span
                              className="px-2 py-1 rounded-md font-semibold"
                              style={{
                                backgroundColor: "var(--green-bg)",
                                color: "var(--green-accent)",
                              }}
                            >
                              {lead.form_type.replace(/_/g, " ")}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm" style={{ color: "var(--text-primary)" }}>
                            {lead.state || "—"}
                          </td>
                          <td className="px-6 py-4 text-xs">
                            <span
                              className="px-2 py-1 rounded-md font-semibold"
                              style={{
                                backgroundColor: `${getUrgencyColor(lead.urgency)}20`,
                                color: getUrgencyColor(lead.urgency),
                              }}
                            >
                              {lead.urgency || "—"}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-xs">
                            <span
                              className="px-2 py-1 rounded-md font-semibold"
                              style={{
                                backgroundColor: `${getStatusColor(lead.status)}20`,
                                color: getStatusColor(lead.status),
                              }}
                            >
                              {lead.status || "—"}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* CALLS TAB */}
        {activeTab === "calls" && (
          <div
            className="rounded-lg border overflow-hidden"
            style={{
              backgroundColor: "var(--bg-card)",
              borderColor: "var(--border-default)",
            }}
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr
                    style={{
                      backgroundColor: "var(--bg-primary)",
                      borderBottom: `1px solid var(--border-default)`,
                    }}
                  >
                    <th className="px-6 py-3 text-left text-xs font-semibold" style={{ color: "var(--text-secondary)" }}>Date</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold" style={{ color: "var(--text-secondary)" }}>Phone</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold" style={{ color: "var(--text-secondary)" }}>Duration</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold" style={{ color: "var(--text-secondary)" }}>Sentiment</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold" style={{ color: "var(--text-secondary)" }}>Outcome</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold" style={{ color: "var(--text-secondary)" }}>Transcript</th>
                  </tr>
                </thead>
                <tbody>
                  {callsLoading ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center" style={{ color: "var(--text-secondary)" }}>
                        Loading...
                      </td>
                    </tr>
                  ) : calls.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center" style={{ color: "var(--text-secondary)" }}>
                        No calls found
                      </td>
                    </tr>
                  ) : (
                    calls.map((call) => (
                      <tr
                        key={call.id}
                        style={{
                          borderBottom: `1px solid var(--border-default)`,
                        }}
                      >
                        <td className="px-6 py-4 text-xs" style={{ color: "var(--text-secondary)" }}>
                          {new Date(call.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-sm font-mono" style={{ color: "var(--text-primary)" }}>
                          {maskPhone(call.caller_phone)}
                        </td>
                        <td className="px-6 py-4 text-sm" style={{ color: "var(--text-primary)" }}>
                          {formatDuration(call.duration_seconds)}
                        </td>
                        <td className="px-6 py-4 text-xs">
                          <span
                            className="px-2 py-1 rounded-md font-semibold"
                            style={{
                              backgroundColor: `${getSentimentColor(call.sentiment)}20`,
                              color: getSentimentColor(call.sentiment),
                            }}
                          >
                            {call.sentiment || "—"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs">
                          <span
                            className="px-2 py-1 rounded-md font-semibold"
                            style={{
                              backgroundColor: `${getOutcomeColor(call.outcome)}20`,
                              color: getOutcomeColor(call.outcome),
                            }}
                          >
                            {call.outcome || "—"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs">
                          <button
                            onClick={() =>
                              setExpandedCallId(
                                expandedCallId === call.id ? null : call.id
                              )
                            }
                            className="text-blue-400 hover:text-blue-300 flex items-center gap-1"
                          >
                            <Eye size={14} />
                            {expandedCallId === call.id ? "Hide" : "View"}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Expanded Transcript */}
            {expandedCallId && (
              <div
                className="border-t p-6"
                style={{
                  backgroundColor: "var(--bg-primary)",
                  borderColor: "var(--border-default)",
                }}
              >
                <h3 className="font-semibold mb-3" style={{ color: "var(--text-primary)" }}>
                  Transcript
                </h3>
                <p
                  className="text-sm whitespace-pre-wrap"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {calls.find((c) => c.id === expandedCallId)?.transcript ||
                    "No transcript available"}
                </p>
              </div>
            )}
          </div>
        )}

        {/* TRAFFIC TAB */}
        {activeTab === "traffic" && (
          <div className="space-y-6">
            {analyticsLoading ? (
              <p style={{ color: "var(--text-secondary)" }}>Loading analytics...</p>
            ) : !analytics || analytics.daily.length === 0 ? (
              <div
                className="p-8 rounded-lg border text-center"
                style={{
                  backgroundColor: "var(--bg-card)",
                  borderColor: "var(--border-default)",
                }}
              >
                <BarChart3 size={48} className="mx-auto mb-4" style={{ color: "var(--text-secondary)" }} opacity={0.5} />
                <h3 className="font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
                  {analytics?.ga4_connected === false
                    ? "GA4 API Not Connected"
                    : "No Traffic Data Yet"}
                </h3>
                <p style={{ color: "var(--text-secondary)" }} className="text-sm">
                  {analytics?.ga4_connected === false
                    ? "Set GA4_SERVICE_ACCOUNT_BASE64 and GA4_PROPERTY_ID in Vercel env vars to connect your Google Analytics data."
                    : "Analytics data will appear here once Google Analytics has collected enough data."}
                </p>
              </div>
            ) : (
              <>
                {/* Summary KPIs */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  <KPICard
                    label="Sessions (7d)"
                    value={analytics.summary.last7.sessions}
                    icon={Activity}
                  />
                  <KPICard
                    label="Page Views (7d)"
                    value={analytics.summary.last7.page_views}
                    icon={BarChart3}
                  />
                  <KPICard
                    label="Users (7d)"
                    value={analytics.summary.last7.users}
                    icon={Users}
                  />
                  <KPICard
                    label="Bounce Rate (7d)"
                    value={`${(analytics.summary.last7.bounce_rate * 100).toFixed(1)}%`}
                    icon={TrendingUp}
                  />
                  <KPICard
                    label="Avg Duration (7d)"
                    value={`${analytics.summary.last7.avg_session_duration.toFixed(1)}s`}
                    icon={Clock}
                  />
                </div>

                {/* Top Pages & Traffic Sources */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Top Pages */}
                  <div
                    className="rounded-lg border p-6"
                    style={{
                      backgroundColor: "var(--bg-card)",
                      borderColor: "var(--border-default)",
                    }}
                  >
                    <h3 className="font-bold mb-4" style={{ color: "var(--text-primary)" }}>
                      Top Pages
                    </h3>
                    {analytics.daily[0]?.top_pages ? (
                      <div className="space-y-3">
                        {Object.entries(analytics.daily[0].top_pages)
                          .sort(([, a], [, b]) => (b as number) - (a as number))
                          .slice(0, 5)
                          .map(([page, views]) => (
                            <div
                              key={page}
                              className="flex items-center justify-between p-2 rounded-md"
                              style={{
                                backgroundColor: "var(--bg-primary)",
                              }}
                            >
                              <p className="text-sm font-mono" style={{ color: "var(--text-secondary)" }}>
                                {page}
                              </p>
                              <p className="font-semibold" style={{ color: "var(--green-accent)" }}>
                                {views}
                              </p>
                            </div>
                          ))}
                      </div>
                    ) : (
                      <p style={{ color: "var(--text-secondary)" }}>No page data</p>
                    )}
                  </div>

                  {/* Traffic Sources */}
                  <div
                    className="rounded-lg border p-6"
                    style={{
                      backgroundColor: "var(--bg-card)",
                      borderColor: "var(--border-default)",
                    }}
                  >
                    <h3 className="font-bold mb-4" style={{ color: "var(--text-primary)" }}>
                      Traffic Sources
                    </h3>
                    {analytics.daily[0]?.traffic_sources ? (
                      <div className="space-y-3">
                        {Object.entries(analytics.daily[0].traffic_sources)
                          .sort(([, a], [, b]) => (b as number) - (a as number))
                          .map(([source, count]) => (
                            <div
                              key={source}
                              className="flex items-center justify-between p-2 rounded-md"
                              style={{
                                backgroundColor: "var(--bg-primary)",
                              }}
                            >
                              <p className="text-sm capitalize" style={{ color: "var(--text-secondary)" }}>
                                {source}
                              </p>
                              <p className="font-semibold" style={{ color: "var(--green-accent)" }}>
                                {count}
                              </p>
                            </div>
                          ))}
                      </div>
                    ) : (
                      <p style={{ color: "var(--text-secondary)" }}>No source data</p>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        )}
        {/* PARTNERS TAB */}
        {activeTab === "partners" && !selectedPartnerId && (
          <div className="space-y-6">
            {/* Filters */}
            <div className="flex gap-4 flex-wrap items-end">
              <div className="flex-1" style={{ minWidth: "200px" }}>
                <label className="text-xs font-semibold mb-2 block" style={{ color: "var(--text-secondary)" }}>Search Partners</label>
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-3" style={{ color: "var(--text-secondary)" }} />
                  <input
                    type="text"
                    placeholder="Search by company name..."
                    value={partnersSearch}
                    onChange={(e) => setPartnersSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-md border text-sm"
                    style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-default)", color: "var(--text-primary)" }}
                  />
                </div>
              </div>
              <div style={{ minWidth: "140px" }}>
                <label className="text-xs font-semibold mb-2 block" style={{ color: "var(--text-secondary)" }}>State</label>
                <select value={partnersState} onChange={(e) => setPartnersState(e.target.value)}
                  className="w-full px-4 py-2 rounded-md border text-sm"
                  style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-default)", color: "var(--text-primary)" }}>
                  <option value="all">All States</option>
                  {["TX","AL","NC","GA","FL","OH","CA","NY","MS","VA","IL","MI","NV","OK","TN","AR","LA","SC","MO","KY","CO","ND","AZ","PA","IN","WA","MA","NJ","WI","OR","MN"].map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div style={{ minWidth: "140px" }}>
                <label className="text-xs font-semibold mb-2 block" style={{ color: "var(--text-secondary)" }}>Pipeline Stage</label>
                <select value={partnersPipelineStage} onChange={(e) => setPartnersPipelineStage(e.target.value)}
                  className="w-full px-4 py-2 rounded-md border text-sm"
                  style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-default)", color: "var(--text-primary)" }}>
                  <option value="all">All Stages</option>
                  {["prospect","contacted","interested","verified","compliant","rate_card","active","inactive"].map((s) => (
                    <option key={s} value={s}>{s.replace(/_/g," ")}</option>
                  ))}
                </select>
              </div>
              <div style={{ minWidth: "120px" }}>
                <label className="text-xs font-semibold mb-2 block" style={{ color: "var(--text-secondary)" }}>Tier</label>
                <select value={partnersTier} onChange={(e) => setPartnersTier(e.target.value)}
                  className="w-full px-4 py-2 rounded-md border text-sm"
                  style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-default)", color: "var(--text-primary)" }}>
                  <option value="all">All Tiers</option>
                  {["gold","silver","bronze","probation","unrated"].map((t) => (
                    <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Pipeline KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2">
              {["prospect","contacted","interested","verified","compliant","rate_card","active","inactive"].map((stage) => {
                const count = partners.filter((p) => p.pipeline_stage === stage).length;
                return (
                  <div key={stage} className="p-4 rounded-lg border text-center cursor-pointer hover:opacity-80"
                    onClick={() => setPartnersPipelineStage(partnersPipelineStage === stage ? "all" : stage)}
                    style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-default)", borderLeftWidth: "3px", borderLeftColor: getPipelineStageColor(stage) }}>
                    <p className="text-xs font-semibold mb-1" style={{ color: "var(--text-secondary)" }}>
                      {stage.replace(/_/g, " ").replace(/^\w/, (c: string) => c.toUpperCase())}
                    </p>
                    <p className="text-xl font-bold" style={{ color: getPipelineStageColor(stage) }}>{count}</p>
                  </div>
                );
              })}
            </div>

            {/* Partners Table */}
            <div className="rounded-lg border overflow-hidden" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-default)" }}>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ backgroundColor: "var(--bg-primary)", borderBottom: "1px solid var(--border-default)" }}>
                      {["Company","Contact","Phone","State","Coverage","Services","Stage","Tier","Rating"].map((h) => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold" style={{ color: "var(--text-secondary)" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {partnersLoading ? (
                      <tr><td colSpan={9} className="px-6 py-8 text-center" style={{ color: "var(--text-secondary)" }}>Loading partners...</td></tr>
                    ) : partners.length === 0 ? (
                      <tr><td colSpan={9} className="px-6 py-12 text-center" style={{ color: "var(--text-secondary)" }}>
                        <Building2 size={32} className="mx-auto mb-3" style={{ color: "var(--text-secondary)" }} />No partners found
                      </td></tr>
                    ) : (
                      partners.map((partner) => (
                        <tr key={partner.id} onClick={() => setSelectedPartnerId(partner.id)}
                          className="cursor-pointer hover:opacity-80 transition-opacity"
                          style={{ borderBottom: "1px solid var(--border-default)" }}>
                          <td className="px-4 py-3">
                            <div className="font-semibold text-xs" style={{ color: "var(--text-primary)" }}>{partner.company_name}</div>
                            {partner.email && <div className="text-xs" style={{ color: "var(--text-secondary)" }}>{partner.email}</div>}
                          </td>
                          <td className="px-4 py-3 text-xs" style={{ color: "var(--text-secondary)" }}>{partner.contact_name || "—"}</td>
                          <td className="px-4 py-3 text-xs" style={{ color: "var(--text-secondary)" }}>{partner.phone || "—"}</td>
                          <td className="px-4 py-3 text-xs" style={{ color: "var(--text-secondary)" }}>{partner.state || "—"}</td>
                          <td className="px-4 py-3 text-xs" style={{ color: "var(--text-secondary)" }}>
                            {partner.coverage_states?.length > 0 ? partner.coverage_states.join(", ") : "—"}
                          </td>
                          <td className="px-4 py-3 text-xs" style={{ color: "var(--text-secondary)" }}>
                            {partner.service_types?.length > 0 ? partner.service_types.map((s: string) => s.replace(/_/g," ")).join(", ") : "—"}
                          </td>
                          <td className="px-4 py-3 text-xs">
                            <span className="px-2 py-1 rounded-md font-semibold"
                              style={{ backgroundColor: `${getPipelineStageColor(partner.pipeline_stage)}20`, color: getPipelineStageColor(partner.pipeline_stage) }}>
                              {partner.pipeline_stage.replace(/_/g, " ")}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-xs">
                            <span className="px-2 py-1 rounded-md font-semibold"
                              style={{ backgroundColor: `${getTierColor(partner.tier)}20`, color: getTierColor(partner.tier) }}>
                              {partner.tier || "unrated"}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-xs" style={{ color: "var(--green-accent)" }}>
                            {partner.avg_rating > 0 ? `${Number(partner.avg_rating).toFixed(1)}★ (${partner.review_count})` : "—"}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* PARTNER DETAIL */}
        {/* SURVEYS TAB */}
        {activeTab === "surveys" && !selectedSurveyId && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>Site Surveys</h2>
              <span className="badge-green">{surveys.length} total</span>
            </div>

            {surveysLoading ? (
              <p style={{ color: "var(--text-secondary)" }}>Loading surveys...</p>
            ) : surveys.length === 0 ? (
              <p style={{ color: "var(--text-secondary)" }}>No surveys submitted yet.</p>
            ) : (
              <div className="space-y-3">
                {surveys.map((s: any) => (
                  <div
                    key={s.id}
                    onClick={() => setSelectedSurveyId(s.id)}
                    className="p-4 rounded-lg border cursor-pointer hover:border-[#39FF14]/30 transition-colors"
                    style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-default)" }}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                            {s.requestor_company || s.requestor_name}
                          </span>
                          <span className="text-xs px-2 py-0.5 rounded-full capitalize" style={{
                            backgroundColor: s.status === "submitted" ? "rgba(234, 179, 8, 0.1)" : s.status === "reviewed" ? "rgba(59, 130, 246, 0.1)" : s.status === "scheduled" ? "var(--green-bg)" : "rgba(107, 114, 128, 0.1)",
                            color: s.status === "submitted" ? "#EAB308" : s.status === "reviewed" ? "#3B82F6" : s.status === "scheduled" ? "var(--green-accent)" : "var(--text-secondary)",
                          }}>
                            {s.status}
                          </span>
                        </div>
                        <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                          {s.service_type?.replace(/_/g, " ")} &middot; {s.site_address}
                        </p>
                        <p className="text-xs mt-1" style={{ color: "var(--text-tertiary)" }}>
                          {s.requestor_name} &middot; {s.requestor_phone}
                          {s.preferred_date && ` \u00b7 Preferred: ${s.preferred_date}`}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
                          {formatDate(s.created_at)}
                        </span>
                        <div className="text-xs mt-1" style={{ color: "var(--text-tertiary)" }}>
                          {(s.photos_equipment?.length || 0) + (s.photos_access?.length || 0) + (s.photos_electrical?.length || 0) + (s.photos_facility?.length || 0)} photos
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "surveys" && selectedSurveyId && (() => {
          const s = surveys.find((sv: any) => sv.id === selectedSurveyId);
          if (!s) return null;
          const allPhotos = [
            ...(s.photos_equipment || []).map((url: string) => ({ url, cat: "Equipment" })),
            ...(s.photos_access || []).map((url: string) => ({ url, cat: "Access" })),
            ...(s.photos_electrical || []).map((url: string) => ({ url, cat: "Electrical" })),
            ...(s.photos_facility || []).map((url: string) => ({ url, cat: "Facility" })),
          ];
          return (
            <div className="space-y-6">
              <button
                onClick={() => setSelectedSurveyId(null)}
                className="flex items-center gap-1 text-sm hover:underline"
                style={{ color: "var(--green-accent)" }}
              >
                <ArrowLeft size={14} /> Back to Surveys
              </button>

              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
                    {s.requestor_company || s.requestor_name}
                  </h2>
                  <p className="text-sm capitalize" style={{ color: "var(--text-secondary)" }}>
                    {s.service_type?.replace(/_/g, " ")} &middot; {s.equipment_type?.replace(/_/g, " ") || "No equipment specified"}
                  </p>
                </div>
                <select
                  value={s.status}
                  onChange={async (e) => {
                    const newStatus = e.target.value;
                    await fetch("/api/admin/surveys", {
                      method: "PATCH",
                      headers: { "Content-Type": "application/json" },
                      credentials: "include",
                      body: JSON.stringify({ id: s.id, status: newStatus }),
                    });
                    setSurveys((prev: any[]) => prev.map((sv: any) => sv.id === s.id ? { ...sv, status: newStatus } : sv));
                  }}
                  className="input-field text-sm w-auto"
                >
                  <option value="submitted">Submitted</option>
                  <option value="reviewed">Reviewed</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Contact */}
                <div className="p-4 rounded-lg border" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-default)" }}>
                  <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--green-accent)" }}>Contact</h3>
                  <div className="space-y-1 text-sm">
                    <p style={{ color: "var(--text-primary)" }}>{s.requestor_name} {s.requestor_company && `(${s.requestor_company})`}</p>
                    <p style={{ color: "var(--text-secondary)" }}>{s.requestor_phone} {s.requestor_email && `\u00b7 ${s.requestor_email}`}</p>
                    {s.onsite_contact_name && s.onsite_contact_name !== s.requestor_name && (
                      <p className="mt-2" style={{ color: "var(--text-secondary)" }}>On-site: {s.onsite_contact_name} &middot; {s.onsite_contact_phone} {s.onsite_contact_role && `(${s.onsite_contact_role})`}</p>
                    )}
                  </div>
                </div>

                {/* Location */}
                <div className="p-4 rounded-lg border" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-default)" }}>
                  <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--green-accent)" }}>Location & Access</h3>
                  <div className="space-y-1 text-sm">
                    <p style={{ color: "var(--text-primary)" }}>{s.site_address}</p>
                    <p style={{ color: "var(--text-secondary)" }}>
                      Floor: {s.floor_level} &middot; Dock: {s.dock_access ? "Yes" : "No"} &middot; Security: {s.gate_or_security ? "Yes" : "No"}
                    </p>
                    {s.gate_details && <p style={{ color: "var(--text-secondary)" }}>Gate: {s.gate_details}</p>}
                    {s.dock_details && <p style={{ color: "var(--text-secondary)" }}>Dock: {s.dock_details}</p>}
                  </div>
                </div>

                {/* Clearance */}
                <div className="p-4 rounded-lg border" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-default)" }}>
                  <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--green-accent)" }}>Clearance</h3>
                  <div className="space-y-1 text-sm">
                    <p style={{ color: "var(--text-primary)" }}>
                      Choke: {s.choke_width_inches && s.choke_height_inches ? `${s.choke_width_inches}" W x ${s.choke_height_inches}" H` : "Not measured"}
                    </p>
                    <p style={{ color: "var(--text-secondary)" }}>Ceiling: {s.ceiling_height_feet ? `${s.ceiling_height_feet} ft` : "Not measured"}</p>
                    {s.path_description && <p style={{ color: "var(--text-secondary)" }}>Path: {s.path_description}</p>}
                  </div>
                </div>

                {/* Electrical */}
                <div className="p-4 rounded-lg border" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-default)" }}>
                  <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--green-accent)" }}>Electrical</h3>
                  <div className="space-y-1 text-sm">
                    <p style={{ color: "var(--text-primary)" }}>
                      {[s.electrical_voltage, s.electrical_phase, s.electrical_amperage].filter(Boolean).join(" / ") || "Unknown"}
                    </p>
                    <p style={{ color: "var(--text-secondary)" }}>
                      Disconnect: {s.disconnect_in_place ? "In place" : "Not in place"}
                      {s.electrical_distance_ft && ` \u00b7 ${s.electrical_distance_ft} ft from panel`}
                    </p>
                    {s.electrical_notes && <p style={{ color: "var(--text-secondary)" }}>Notes: {s.electrical_notes}</p>}
                  </div>
                </div>

                {/* Resources */}
                <div className="p-4 rounded-lg border" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-default)" }}>
                  <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--green-accent)" }}>On-Site Resources</h3>
                  <div className="space-y-1 text-sm">
                    <p style={{ color: "var(--text-primary)" }}>
                      Forklift: {s.forklift_available ? `Yes (${s.forklift_capacity_lbs || "?"} lbs)` : "None"}
                    </p>
                    {s.other_equipment && <p style={{ color: "var(--text-secondary)" }}>Other: {s.other_equipment}</p>}
                    {s.hazardous_materials && <p className="text-red-400">Hazmat: {s.hazmat_details || "Yes"}</p>}
                  </div>
                </div>

                {/* Schedule & Notes */}
                <div className="p-4 rounded-lg border" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-default)" }}>
                  <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--green-accent)" }}>Schedule & Notes</h3>
                  <div className="space-y-1 text-sm">
                    <p style={{ color: "var(--text-primary)" }}>
                      {s.preferred_date || "No date"} &middot; {s.preferred_time_window || "Anytime"}
                    </p>
                    {s.work_description && <p style={{ color: "var(--text-secondary)" }}>Work: {s.work_description}</p>}
                    {s.special_instructions && <p style={{ color: "var(--text-secondary)" }}>Special: {s.special_instructions}</p>}
                  </div>
                </div>
              </div>

              {/* Photos */}
              {allPhotos.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--green-accent)" }}>Photos ({allPhotos.length})</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {allPhotos.map((p: any, i: number) => (
                      <a key={i} href={p.url} target="_blank" rel="noopener noreferrer" className="group relative aspect-square rounded-lg overflow-hidden border" style={{ borderColor: "var(--border-default)" }}>
                        <img src={p.url} alt={`${p.cat} photo ${i + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                        <span className="absolute bottom-0 left-0 right-0 text-xs text-center py-1 bg-black/70 text-white">{p.cat}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })()}

        {activeTab === "partners" && selectedPartnerId && (
          <div className="space-y-6">
            <button onClick={() => setSelectedPartnerId(null)}
              className="flex items-center gap-2 text-sm font-semibold transition-opacity hover:opacity-80"
              style={{ color: "var(--text-secondary)" }}>
              <ArrowLeft size={16} /> Back to partners
            </button>

            {partnerDetailLoading || !partnerDetail ? (
              <p style={{ color: "var(--text-secondary)" }}>Loading partner...</p>
            ) : (
              <>
                {/* Header */}
                <div className="rounded-lg border p-6" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-default)" }}>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h2 className="text-2xl font-bold mb-1" style={{ color: "var(--text-primary)" }}>{partnerDetail.partner.company_name}</h2>
                      <div className="flex items-center gap-3 text-sm flex-wrap" style={{ color: "var(--text-secondary)" }}>
                        {partnerDetail.partner.contact_name && <span>{partnerDetail.partner.contact_name}</span>}
                        {partnerDetail.partner.phone && <span>{partnerDetail.partner.phone}</span>}
                        {partnerDetail.partner.email && <span>{partnerDetail.partner.email}</span>}
                        {partnerDetail.partner.city && <span className="flex items-center gap-1"><MapPin size={12} />{partnerDetail.partner.city}, {partnerDetail.partner.state}</span>}
                      </div>
                      {partnerDetail.partner.alt_contact_name && (
                        <div className="text-xs mt-2" style={{ color: "var(--text-secondary)" }}>
                          Alt: {partnerDetail.partner.alt_contact_name} {partnerDetail.partner.alt_contact_phone && `(${partnerDetail.partner.alt_contact_phone})`}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <select value={partnerDetail.partner.pipeline_stage}
                        onChange={(e) => updatePartner(partnerDetail.partner.id, { pipeline_stage: e.target.value })}
                        className="text-xs px-3 py-1 rounded-md font-semibold border"
                        style={{ backgroundColor: `${getPipelineStageColor(partnerDetail.partner.pipeline_stage)}20`, color: getPipelineStageColor(partnerDetail.partner.pipeline_stage), borderColor: getPipelineStageColor(partnerDetail.partner.pipeline_stage) }}>
                        {["prospect","contacted","interested","verified","compliant","rate_card","active","inactive"].map((s) => (
                          <option key={s} value={s}>{s.replace(/_/g," ")}</option>
                        ))}
                      </select>
                      <select value={partnerDetail.partner.tier || "unrated"}
                        onChange={(e) => updatePartner(partnerDetail.partner.id, { tier: e.target.value })}
                        className="text-xs px-3 py-1 rounded-md font-semibold border"
                        style={{ backgroundColor: `${getTierColor(partnerDetail.partner.tier)}20`, color: getTierColor(partnerDetail.partner.tier), borderColor: getTierColor(partnerDetail.partner.tier) }}>
                        {["unrated","gold","silver","bronze","probation"].map((t) => (
                          <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  {partnerDetail.partner.avg_rating > 0 && (
                    <div className="flex items-center gap-4 mt-2 pt-3 border-t" style={{ borderColor: "var(--border-default)" }}>
                      <span className="text-sm font-semibold" style={{ color: "var(--green-accent)" }}>
                        {Number(partnerDetail.partner.avg_rating).toFixed(1)}★ avg
                      </span>
                      <span className="text-xs" style={{ color: "var(--text-secondary)" }}>{partnerDetail.partner.review_count} reviews</span>
                    </div>
                  )}
                  {partnerDetail.partner.notes && (
                    <p className="text-sm mt-2 pt-3 border-t" style={{ color: "var(--text-secondary)", borderColor: "var(--border-default)" }}>
                      {partnerDetail.partner.notes}
                    </p>
                  )}
                </div>

                {/* Compliance Checklist */}
                <div className="rounded-lg border p-6" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-default)" }}>
                  <h3 className="font-bold mb-4" style={{ color: "var(--text-primary)" }}>Compliance Status</h3>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {[
                      { label: "W9 On File", value: partnerDetail.partner.w9_on_file },
                      { label: "NDA Signed", value: partnerDetail.partner.nda_signed },
                      { label: "Insurance Verified", value: partnerDetail.partner.insurance_verified },
                      { label: "Rate Card Received", value: partnerDetail.partner.rate_card_received },
                      { label: "Insurance Current", value: partnerDetail.partner.insurance_expiration ? new Date(partnerDetail.partner.insurance_expiration) > new Date() : false },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.value ? "var(--green-accent)" : "#EF4444" }} />
                        <span className="text-xs" style={{ color: "var(--text-secondary)" }}>{item.label}</span>
                      </div>
                    ))}
                  </div>
                  {partnerDetail.partner.insurance_provider && (
                    <div className="mt-3 text-xs" style={{ color: "var(--text-secondary)" }}>
                      Insurance: {partnerDetail.partner.insurance_provider}
                      {partnerDetail.partner.insurance_expiration && ` (expires ${partnerDetail.partner.insurance_expiration})`}
                    </div>
                  )}
                </div>

                {/* Two-column grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Services */}
                  <div className="rounded-lg border p-6" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-default)" }}>
                    <h3 className="font-bold mb-4 flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
                      <Wrench size={18} /> Services
                    </h3>
                    {!partnerDetail.partner.service_types?.length ? (
                      <p className="text-sm" style={{ color: "var(--text-secondary)" }}>No services listed — needs verification</p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {partnerDetail.partner.service_types.map((s: string) => (
                          <span key={s} className="px-3 py-1 rounded-md text-xs font-semibold capitalize"
                            style={{ backgroundColor: "var(--green-bg)", color: "var(--green-accent)" }}>
                            {s.replace(/_/g, " ")}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Coverage */}
                  <div className="rounded-lg border p-6" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-default)" }}>
                    <h3 className="font-bold mb-4 flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
                      <MapPin size={18} /> Coverage ({partnerDetail.partner.coverage_states?.length || 0} states)
                    </h3>
                    {!partnerDetail.partner.coverage_states?.length ? (
                      <p className="text-sm" style={{ color: "var(--text-secondary)" }}>No coverage listed</p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {partnerDetail.partner.coverage_states.map((s: string) => (
                          <span key={s} className="text-xs px-2 py-1 rounded-md" style={{ backgroundColor: "var(--bg-primary)", color: "var(--text-secondary)" }}>{s}</span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Pricing */}
                  <div className="rounded-lg border p-6" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-default)" }}>
                    <h3 className="font-bold mb-4 flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
                      <DollarSign size={18} /> Pricing ({partnerDetail.pricing.length})
                    </h3>
                    {partnerDetail.pricing.length === 0 ? (
                      <p className="text-sm" style={{ color: "var(--text-secondary)" }}>No pricing on file</p>
                    ) : (
                      <div className="space-y-2">
                        {partnerDetail.pricing.map((p: any) => (
                          <div key={p.id} className="p-3 rounded-md border" style={{ backgroundColor: "var(--bg-primary)", borderColor: "var(--border-default)" }}>
                            <div className="flex items-start justify-between mb-1">
                              <p className="text-sm font-semibold capitalize" style={{ color: "var(--text-primary)" }}>
                                {p.pricing_type.replace(/_/g, " ")}
                              </p>
                              <span style={{ color: "var(--green-accent)" }} className="font-semibold">${Number(p.amount_usd).toLocaleString()}</span>
                            </div>
                            <div className="text-xs flex gap-3 flex-wrap" style={{ color: "var(--text-secondary)" }}>
                              {p.unit_description && <span>{p.unit_description}</span>}
                              {p.expires_date && <span>Expires: {p.expires_date}</span>}
                              {p.steel_index_reference && <span>Steel index: ${p.steel_index_reference}/ton</span>}
                              {p.is_current && <span style={{ color: "var(--green-accent)" }} className="font-semibold">Current</span>}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Reviews */}
                  <div className="rounded-lg border p-6" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-default)" }}>
                    <h3 className="font-bold mb-4 flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
                      <Users size={18} /> Reviews ({partnerDetail.reviews.length})
                    </h3>
                    {partnerDetail.reviews.length === 0 ? (
                      <p className="text-sm" style={{ color: "var(--text-secondary)" }}>No reviews yet</p>
                    ) : (
                      <div className="space-y-3">
                        {partnerDetail.reviews.slice(0, 10).map((r: any) => (
                          <div key={r.id} className="p-3 rounded-md border" style={{ backgroundColor: "var(--bg-primary)", borderColor: "var(--border-default)" }}>
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-semibold" style={{ color: "var(--green-accent)" }}>{r.overall_rating}★</span>
                                <span className="text-xs px-2 py-0.5 rounded-md" style={{ backgroundColor: "var(--bg-card)", color: "var(--text-secondary)" }}>{r.review_type.replace(/_/g," ")}</span>
                              </div>
                              <span className="text-xs" style={{ color: "var(--text-secondary)" }}>{formatDate(r.created_at)}</span>
                            </div>
                            {r.feedback && <p className="text-xs" style={{ color: "var(--text-secondary)" }}>{r.feedback}</p>}
                            {(r.quality_rating || r.timeliness_rating || r.communication_rating) && (
                              <div className="flex gap-3 mt-2 text-xs" style={{ color: "var(--text-secondary)" }}>
                                {r.quality_rating && <span>Quality: {r.quality_rating}★</span>}
                                {r.timeliness_rating && <span>Timeliness: {r.timeliness_rating}★</span>}
                                {r.communication_rating && <span>Communication: {r.communication_rating}★</span>}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
