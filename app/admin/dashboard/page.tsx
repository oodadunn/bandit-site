"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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

type TabType = "overview" | "accounts" | "leads" | "calls" | "traffic";

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

export default function AdminDashboard() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>("overview");

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
            {(["overview", "accounts", "leads", "calls", "traffic"] as const).map((tab) => (
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
                  No Traffic Data Yet
                </h3>
                <p style={{ color: "var(--text-secondary)" }} className="text-sm">
                  Analytics data will appear here once the Google Analytics 4 pipeline
                  is running and collecting data from your website.
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
      </div>
    </div>
  );
}
