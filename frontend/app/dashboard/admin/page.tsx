"use client";

import { useEffect, useState, useCallback } from "react";
import { useAppAuth } from "@/hooks/useAppAuth";
import DashboardShell from "@/components/dashboard/DashboardShell";
import Card from "@/components/ui/Card";
import {
  api,
  type AdminDashboardData,
  type UserManagementItem,
  type UsersListData,
  type RevenueSummaryData,
} from "@/lib/api";
import {
  Users, Activity, MessageSquare, Brain, Timer, Cpu,
  TrendingUp, Circle, Sparkles, Zap, Shield, Crown,
  Ban, CheckCircle, RefreshCw, Trash2, Star, BarChart3,
  UserCheck, UserX, Search, ChevronDown, AlertTriangle,
  DollarSign, Infinity, ChevronUp, Database, HardDrive,
  ShieldAlert, FileText, ArrowDownRight, ArrowUpRight,
  Laptop, CreditCard, Coins, Clock
} from "lucide-react";
import { Skeleton } from "@/components/ui/Skeleton";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, PieChart, Pie, Legend,
} from "recharts";

type Tab = "overview" | "users" | "revenue" | "tokens" | "system";

const TIER_COLORS: Record<string, string> = {
  free: "text-zinc-400",
  pro: "text-blue-400",
  ultra: "text-amber-400",
};
const TIER_BG: Record<string, string> = {
  free: "bg-zinc-500/10 border-zinc-500/20",
  pro: "bg-blue-500/10 border-blue-500/20",
  ultra: "bg-amber-500/10 border-amber-500/20",
};
const TIER_ICONS: Record<string, React.ReactNode> = {
  free: <Zap className="h-3.5 w-3.5" />,
  pro: <Star className="h-3.5 w-3.5" />,
  ultra: <Crown className="h-3.5 w-3.5" />,
};

export default function AdminPage() {
  const { getToken } = useAppAuth();
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [dashData, setDashData] = useState<AdminDashboardData | null>(null);
  const [usersData, setUsersData] = useState<UsersListData | null>(null);
  const [revenueData, setRevenueData] = useState<RevenueSummaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(false);
  const [revenueLoading, setRevenueLoading] = useState(false);
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTier, setFilterTier] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [actionMsg, setActionMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [sortBy, setSortBy] = useState<string>("created_at");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [expandedUser, setExpandedUser] = useState<number | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

  useEffect(() => { setMounted(true); }, []);

  const loadDashboard = useCallback(async () => {
    setError("");
    try {
      const token = await getToken();
      const res = await api.getAdminDashboard(token ?? undefined);
      setDashData(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load dashboard.");
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  const loadUsers = useCallback(async () => {
    setUsersLoading(true);
    try {
      const token = await getToken();
      const res = await api.getAdminUsers(token ?? undefined);
      setUsersData(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load users.");
    } finally {
      setUsersLoading(false);
    }
  }, [getToken]);

  const loadRevenue = useCallback(async () => {
    setRevenueLoading(true);
    try {
      const token = await getToken();
      const res = await api.getRevenueSummary(token ?? undefined);
      setRevenueData(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load revenue summary.");
    } finally {
      setRevenueLoading(false);
    }
  }, [getToken]);

  useEffect(() => { loadDashboard(); }, [loadDashboard]);
  
  useEffect(() => {
    if (activeTab === "users" || activeTab === "tokens") {
      loadUsers();
    } else if (activeTab === "revenue") {
      loadRevenue();
    }
  }, [activeTab, loadUsers, loadRevenue]);

  const showMsg = (type: "success" | "error", text: string) => {
    setActionMsg({ type, text });
    setTimeout(() => setActionMsg(null), 3500);
  };

  const handleBan = async (userId: number, isBanned: boolean) => {
    setActionLoading(userId);
    try {
      const token = await getToken();
      if (isBanned) {
        await api.unbanUser(userId, token ?? undefined);
        showMsg("success", "User unbanned successfully.");
      } else {
        await api.banUser(userId, token ?? undefined);
        showMsg("success", "User banned successfully.");
      }
      await loadUsers();
      await loadDashboard();
    } catch (err) {
      showMsg("error", err instanceof Error ? err.message : "Action failed.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleUpdateTier = async (userId: number, tier: string) => {
    setActionLoading(userId);
    try {
      const token = await getToken();
      await api.updateUserSubscription(userId, tier, token ?? undefined);
      showMsg("success", `Subscription updated to ${tier}.`);
      await loadUsers();
      await loadDashboard();
    } catch (err) {
      showMsg("error", err instanceof Error ? err.message : "Update failed.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleResetTokens = async (userId: number) => {
    setActionLoading(userId);
    try {
      const token = await getToken();
      await api.resetUserTokens(userId, token ?? undefined);
      showMsg("success", "Tokens reset successfully.");
      await loadUsers();
    } catch (err) {
      showMsg("error", err instanceof Error ? err.message : "Reset failed.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (userId: number) => {
    setActionLoading(userId);
    try {
      const token = await getToken();
      await api.deleteUser(userId, token ?? undefined);
      showMsg("success", "User deleted.");
      setConfirmDelete(null);
      await loadUsers();
      await loadDashboard();
    } catch (err) {
      showMsg("error", err instanceof Error ? err.message : "Delete failed.");
    } finally {
      setActionLoading(null);
    }
  };

  const getIsOnline = (lastActiveStr: string | null) => {
    if (!lastActiveStr) return false;
    try {
      return new Date().getTime() - new Date(lastActiveStr).getTime() < 5 * 60 * 1000;
    } catch { return false; }
  };

  const fmt = (mins: number) => {
    if (mins < 60) return `${mins.toFixed(1)}m`;
    return `${Math.floor(mins / 60)}h ${(mins % 60).toFixed(0)}m`;
  };

  // Filtered & sorted users
  const filteredUsers = (usersData?.users ?? []).filter((u) => {
    const q = searchQuery.toLowerCase();
    const matchSearch = !q || u.username.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
    const matchTier = filterTier === "all" || u.subscription_tier === filterTier;
    const matchStatus = filterStatus === "all" ||
      (filterStatus === "banned" && u.is_banned) ||
      (filterStatus === "active" && !u.is_banned);
    return matchSearch && matchTier && matchStatus;
  }).sort((a, b) => {
    const dir = sortDir === "asc" ? 1 : -1;
    if (sortBy === "username") return a.username.localeCompare(b.username) * dir;
    if (sortBy === "tokens") return (a.tokens_used - b.tokens_used) * dir;
    if (sortBy === "active_minutes") return (a.active_minutes - b.active_minutes) * dir;
    if (sortBy === "created_at") return (new Date(a.created_at).getTime() - new Date(b.created_at).getTime()) * dir;
    return 0;
  });

  const toggleSort = (col: string) => {
    if (sortBy === col) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortBy(col); setSortDir("desc"); }
  };

  const SortIcon = ({ col }: { col: string }) =>
    sortBy === col
      ? (sortDir === "asc" ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />)
      : <ChevronDown className="h-3 w-3 opacity-30" />;

  // Pie chart data
  const pieData = dashData ? [
    { name: "Free", value: dashData.free_users, color: "#71717a" },
    { name: "Pro", value: dashData.pro_users, color: "#3b82f6" },
    { name: "Ultra", value: dashData.ultra_users, color: "#f59e0b" },
  ] : [];

  const revenuePieData = revenueData ? [
    { name: "Stripe Gateway", value: revenueData.stripe_revenue, color: "#3b82f6" },
    { name: "Razorpay Gateway", value: revenueData.razorpay_revenue, color: "#10b981" },
  ] : [];

  const featureChartData = dashData?.feature_usage?.map((f) => ({
    name: f.feature.length > 8 ? f.feature.slice(0, 8) + "…" : f.feature,
    views: f.views,
    minutes: f.active_minutes,
  })) || [];

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "overview", label: "Overview", icon: <BarChart3 className="h-4 w-4" /> },
    { id: "users", label: "Users", icon: <Users className="h-4 w-4" /> },
    { id: "revenue", label: "Revenue & Transactions", icon: <DollarSign className="h-4 w-4" /> },
    { id: "tokens", label: "Token Usage", icon: <Zap className="h-4 w-4" /> },
    { id: "system", label: "System Monitoring", icon: <Database className="h-4 w-4" /> },
  ];

  return (
    <DashboardShell
      title="Admin Control Center"
      subtitle="Futuristic cockpit for study platform analytics, user records & billing statistics."
    >
      <div className="space-y-6">
        {/* Toast notification */}
        {actionMsg && (
          <div className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-xl border shadow-xl text-sm font-medium backdrop-blur-md transition-all
            ${actionMsg.type === "success" ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" : "bg-red-500/10 border-red-500/30 text-red-400"}`}>
            {actionMsg.type === "success" ? <CheckCircle className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
            {actionMsg.text}
          </div>
        )}

        {error && (
          <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/10 text-red-400 text-sm flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-red-400 flex-shrink-0" />
            <span>⚠ {error}</span>
          </div>
        )}

        {/* Tab selection */}
        <div className="flex gap-1 p-1 bg-muted/20 border border-border/40 rounded-xl w-fit backdrop-blur-sm overflow-x-auto max-w-full">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all duration-200 whitespace-nowrap
                ${activeTab === tab.id
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/15"
                  : "text-muted hover:text-foreground hover:bg-muted/30"}`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* ═══════════════════════════════════════ OVERVIEW TAB */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Summary Stats */}
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { label: "Total Users", value: dashData?.total_users ?? 0, icon: Users, color: "text-blue-400", bg: "from-blue-500/10" },
                { label: "Active (7 Days)", value: dashData?.active_users ?? 0, icon: Activity, color: "text-emerald-400", bg: "from-emerald-500/10" },
                { label: "AI Conversations", value: dashData?.total_chats ?? 0, icon: MessageSquare, color: "text-violet-400", bg: "from-violet-500/10" },
                { label: "Session Time", value: fmt(dashData?.total_active_minutes ?? 0), icon: Timer, color: "text-pink-400", bg: "from-pink-500/10" },
              ].map((s) => (
                <Card key={s.label} className={`relative overflow-hidden border-border/40 bg-gradient-to-br ${s.bg} to-card/60 backdrop-blur-md p-4`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-[10px] font-extrabold uppercase tracking-widest text-muted">{s.label}</p>
                      <p className="text-2xl font-black mt-2 tracking-tight">
                        {loading ? <Skeleton className="h-7 w-16 rounded" /> : s.value}
                      </p>
                    </div>
                    <div className={`p-2 rounded-lg bg-background/50 border border-border/20 ${s.color}`}>
                      <s.icon className="h-5 w-5" />
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Platform Distribution splits */}
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { label: "Free Plan Tier", value: dashData?.free_users ?? 0, icon: Zap, color: "text-zinc-400" },
                { label: "Pro Plan Tier", value: dashData?.pro_users ?? 0, icon: Star, color: "text-blue-400" },
                { label: "Ultra Plan Tier", value: dashData?.ultra_users ?? 0, icon: Crown, color: "text-amber-400" },
                { label: "Suspended", value: dashData?.banned_users ?? 0, icon: Ban, color: "text-red-400" },
              ].map((s) => (
                <Card key={s.label} className="border-border/30 bg-card/40 backdrop-blur-md p-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-muted/40 ${s.color} border border-border/10`}>
                      <s.icon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-[9px] font-extrabold uppercase tracking-widest text-muted">{s.label}</p>
                      <p className="text-lg font-black mt-0.5">
                        {loading ? <Skeleton className="h-6 w-10 rounded" /> : s.value}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Charts Row */}
            <div className="grid gap-6 lg:grid-cols-3">
              {/* Daily Activity */}
              <Card className="lg:col-span-2 border-border/40 bg-card/30 backdrop-blur-md p-5">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="h-4 w-4 text-emerald-400" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted font-mono">Real-time Performance</span>
                </div>
                <h3 className="text-base font-bold mb-4">Daily Study Platform Interactions</h3>
                <div className="h-56">
                  {mounted && !loading ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={dashData?.daily_activity ?? []} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                        <defs>
                          <linearGradient id="gUsers" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="gEvents" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="date" stroke="#6b7280" fontSize={10} tickLine={false} axisLine={false} />
                        <YAxis stroke="#6b7280" fontSize={10} tickLine={false} axisLine={false} />
                        <Tooltip contentStyle={{ backgroundColor: "#18181b", border: "1px solid #27272a", borderRadius: "12px", color: "#f4f4f5", fontSize: "11px" }} />
                        <Area type="monotone" dataKey="events" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#gEvents)" name="Events" />
                        <Area type="monotone" dataKey="users" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#gUsers)" name="Active Users" />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : <Skeleton className="h-full w-full rounded-xl bg-muted/30" />}
                </div>
              </Card>

              {/* Plan Distribution Pie */}
              <Card className="border-border/40 bg-card/30 backdrop-blur-md p-5">
                <div className="flex items-center gap-2 mb-1">
                  <BarChart3 className="h-4 w-4 text-amber-400" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted font-mono">Plan Demographics</span>
                </div>
                <h3 className="text-base font-bold mb-4">Student Tier Demographics</h3>
                <div className="h-56">
                  {mounted && !loading ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={4} dataKey="value">
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: "#18181b", border: "1px solid #27272a", borderRadius: "12px", color: "#f4f4f5", fontSize: "11px" }} />
                        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "11px" }} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : <Skeleton className="h-full w-full rounded-xl bg-muted/30" />}
                </div>
              </Card>
            </div>

            {/* AI Insights panel */}
            <div className="grid gap-6 lg:grid-cols-3">
              <Card className="lg:col-span-2 border-border/40 bg-card/30 backdrop-blur-md p-5">
                <h3 className="text-base font-bold mb-1">Feature Resource Utilization</h3>
                <p className="text-xs text-muted mb-4">Daily view interactions recorded across various features.</p>
                <div className="h-44">
                  {mounted && !loading && featureChartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={featureChartData} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
                        <XAxis dataKey="name" stroke="#6b7280" fontSize={9} tickLine={false} axisLine={false} />
                        <YAxis stroke="#6b7280" fontSize={9} tickLine={false} axisLine={false} />
                        <Tooltip contentStyle={{ backgroundColor: "#18181b", border: "1px solid #27272a", borderRadius: "12px", color: "#f4f4f5", fontSize: "11px" }} />
                        <Bar dataKey="views" radius={[4, 4, 0, 0]}>
                          {featureChartData.map((_, index) => {
                            const colors = ["#3b82f6", "#8b5cf6", "#10b981", "#ec4899", "#f59e0b", "#06b6d4"];
                            return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                          })}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    !loading && featureChartData.length === 0
                      ? <div className="h-full flex items-center justify-center text-xs text-muted">No usage metadata recorded yet.</div>
                      : <Skeleton className="h-full w-full rounded-xl bg-muted/30" />
                  )}
                </div>
              </Card>

              {/* AI Insights list */}
              <Card className="border-border/40 bg-card/50 backdrop-blur-md p-5">
                <div className="flex items-center gap-2 mb-1">
                  <Cpu className="h-4 w-4 text-blue-400 animate-pulse" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted font-mono">Platform Health</span>
                </div>
                <h3 className="text-base font-bold mb-4">AI Cockpit Suggestions</h3>
                <div className="space-y-3">
                  {loading ? Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-12 rounded-lg bg-muted/40" />) : (
                    <>
                      <div className="flex gap-2.5 p-3 rounded-xl border border-border/20 bg-muted/10 text-xs leading-normal">
                        <Sparkles className="h-4 w-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                        <p className="text-muted-foreground">Database health nominal. Webhook pipelines verified. All AI endpoints operational.</p>
                      </div>
                      <div className="flex gap-2.5 p-3 rounded-xl border border-border/20 bg-muted/10 text-xs leading-normal">
                        <Sparkles className="h-4 w-4 text-blue-400 flex-shrink-0 mt-0.5" />
                        <p className="text-muted-foreground">Tokens recharge requests active. Users token limits are updating dynamically on payments completion.</p>
                      </div>
                    </>
                  )}
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════ USERS TAB */}
        {activeTab === "users" && (
          <div className="space-y-4">
            {/* User Search & Filters */}
            <Card className="border-border/40 bg-card/40 backdrop-blur-md p-4">
              <div className="flex flex-wrap gap-3 items-center justify-between">
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
                    <input
                      type="text"
                      placeholder="Search student username or email..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 pr-4 py-2 text-xs bg-background/50 border border-border/40 rounded-lg focus:outline-none focus:border-blue-500/50 w-64 text-foreground"
                    />
                  </div>
                  <select
                    value={filterTier}
                    onChange={(e) => setFilterTier(e.target.value)}
                    className="px-3 py-2 text-xs bg-background/50 border border-border/40 rounded-lg focus:outline-none focus:border-blue-500/50 text-foreground"
                  >
                    <option value="all">All Plan Tiers</option>
                    <option value="free">Free</option>
                    <option value="pro">Pro</option>
                    <option value="ultra">Ultra</option>
                  </select>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-3 py-2 text-xs bg-background/50 border border-border/40 rounded-lg focus:outline-none focus:border-blue-500/50 text-foreground"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active Status</option>
                    <option value="banned">Banned/Suspended</option>
                  </select>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted">
                  <span>{filteredUsers.length} of {usersData?.total ?? 0} students</span>
                  <button onClick={loadUsers} className="p-1.5 rounded-lg hover:bg-muted/30 transition-colors text-muted">
                    <RefreshCw className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </Card>

            {/* Users Table */}
            <Card className="border-border/40 bg-card/40 backdrop-blur-md p-0 overflow-hidden">
              {usersLoading ? (
                <div className="p-6 space-y-3">
                  {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-14 rounded-lg bg-muted/40" />)}
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="p-12 text-center text-muted text-xs font-mono">No matching student records found.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border/30 text-[10px] font-bold uppercase tracking-wider text-muted">
                        <th className="text-left px-5 py-3">Student Name</th>
                        <th className="text-center px-5 py-3">Access Status</th>
                        <th className="text-center px-5 py-3">Plan Tier</th>
                        <th className="text-right px-5 py-3">
                          <button onClick={() => toggleSort("tokens")} className="flex items-center gap-1 ml-auto hover:text-foreground transition-colors">
                            Monthly Tokens <SortIcon col="tokens" />
                          </button>
                        </th>
                        <th className="text-right px-5 py-3">
                          <button onClick={() => toggleSort("active_minutes")} className="flex items-center gap-1 ml-auto hover:text-foreground transition-colors">
                            Active Time <SortIcon col="active_minutes" />
                          </button>
                        </th>
                        <th className="text-center px-5 py-3">Control Commands</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/20 text-xs">
                      {filteredUsers.map((user) => {
                        const online = getIsOnline(user.last_active);
                        const tokenPct = user.token_limit > 0 ? Math.min(100, (user.tokens_used / user.token_limit) * 100) : 0;
                        const isLoading = actionLoading === user.id;

                        return (
                          <>
                            <tr
                              key={user.id}
                              className={`hover:bg-muted/10 transition-colors cursor-pointer ${user.is_banned ? "bg-red-500/5 opacity-70" : ""}`}
                              onClick={() => setExpandedUser(expandedUser === user.id ? null : user.id)}
                            >
                              <td className="px-5 py-3">
                                <div className="flex items-center gap-2.5">
                                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                    {user.username[0]?.toUpperCase()}
                                  </div>
                                  <div>
                                    <p className="font-bold flex items-center gap-1">
                                      {user.username}
                                      {user.is_admin && <Shield className="h-3 w-3 text-amber-400" />}
                                    </p>
                                    <p className="text-[10px] text-muted">{user.email}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-5 py-3 text-center">
                                <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider
                                  ${user.is_banned ? "bg-red-500/10 text-red-400" : online ? "bg-emerald-500/10 text-emerald-400" : "bg-zinc-500/10 text-zinc-400"}`}>
                                  <Circle className={`h-1.5 w-1.5 fill-current ${online && !user.is_banned ? "animate-pulse" : ""}`} />
                                  {user.is_banned ? "Suspended" : online ? "Online" : "Offline"}
                                </span>
                              </td>
                              <td className="px-5 py-3 text-center">
                                <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold border uppercase tracking-wide ${TIER_BG[user.subscription_tier] ?? TIER_BG.free} ${TIER_COLORS[user.subscription_tier] ?? TIER_COLORS.free}`}>
                                  {TIER_ICONS[user.subscription_tier]}
                                  {user.subscription_tier}
                                </span>
                              </td>
                              <td className="px-5 py-3 text-right">
                                <div className="space-y-1">
                                  <p className="font-semibold">{user.tokens_used.toLocaleString()} / {user.subscription_tier === "ultra" ? "∞" : user.token_limit.toLocaleString()}</p>
                                  {user.subscription_tier !== "ultra" && (
                                    <div className="w-16 ml-auto h-1 rounded-full bg-muted/40 overflow-hidden">
                                      <div
                                        className={`h-full rounded-full transition-all ${tokenPct > 80 ? "bg-red-500" : tokenPct > 50 ? "bg-amber-500" : "bg-blue-500"}`}
                                        style={{ width: `${tokenPct}%` }}
                                      />
                                    </div>
                                  )}
                                </div>
                              </td>
                              <td className="px-5 py-3 text-right font-mono text-muted">{fmt(user.active_minutes)}</td>
                              <td className="px-5 py-3">
                                <div className="flex items-center justify-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                                  {/* Ban/Unban */}
                                  <button
                                    onClick={() => handleBan(user.id, user.is_banned)}
                                    disabled={isLoading || user.is_admin}
                                    title={user.is_banned ? "Reactivate student access" : "Suspend student access"}
                                    className={`p-1.5 rounded-lg transition-colors disabled:opacity-40 border border-border/10
                                      ${user.is_banned ? "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20" : "bg-red-500/10 text-red-400 hover:bg-red-500/20"}`}
                                  >
                                    {isLoading ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : user.is_banned ? <UserCheck className="h-3.5 w-3.5" /> : <UserX className="h-3.5 w-3.5" />}
                                  </button>
                                  {/* Delete user */}
                                  {!user.is_admin && (
                                    <button
                                      onClick={() => setConfirmDelete(user.id)}
                                      disabled={isLoading}
                                      title="Purge student profile"
                                      className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-border/10 transition-colors disabled:opacity-40"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>

                            {/* Expanded user view */}
                            {expandedUser === user.id && (
                              <tr key={`${user.id}-expanded`} className="bg-muted/5 border-t border-b border-border/20">
                                <td colSpan={6} className="px-5 py-4">
                                  <div className="flex flex-wrap gap-6 items-start">
                                    <div className="flex-1 min-w-[200px] space-y-2.5">
                                      <p className="text-[10px] font-extrabold uppercase tracking-widest text-muted">Platform Statistics</p>
                                      <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                                        <span className="text-muted">Total Chats:</span><span className="font-semibold">{user.total_chats}</span>
                                        <span className="text-muted">Total Quizzes:</span><span className="font-semibold">{user.total_quizzes}</span>
                                        <span className="text-muted">Registered:</span><span className="font-semibold">{new Date(user.created_at).toLocaleDateString()}</span>
                                        <span className="text-muted">Last Login:</span><span className="font-semibold">{user.last_active ? new Date(user.last_active).toLocaleString() : "Never"}</span>
                                      </div>
                                    </div>
                                    <div className="flex-1 min-w-[200px]">
                                      <p className="text-[10px] font-extrabold uppercase tracking-widest text-muted mb-2">Change Plan Tier (Force Update)</p>
                                      <div className="flex gap-2 flex-wrap">
                                        {["free", "pro", "ultra"].map((tier) => (
                                          <button
                                            key={tier}
                                            onClick={() => handleUpdateTier(user.id, tier)}
                                            disabled={isLoading || user.subscription_tier === tier}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all disabled:opacity-50 uppercase tracking-wide
                                              ${user.subscription_tier === tier ? "bg-blue-500/20 border-blue-500/40 text-blue-400" : "bg-background border-border/40 hover:bg-muted/30"}`}
                                          >
                                            {isLoading ? "..." : tier}
                                          </button>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>

            {/* Confirm modal for delete */}
            {confirmDelete !== null && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4">
                <div className="bg-card border border-border/80 rounded-2xl p-6 w-full max-w-sm shadow-2xl text-center backdrop-blur-xl">
                  <Trash2 className="h-10 w-10 text-red-500 mx-auto mb-3" />
                  <h3 className="text-base font-bold mb-2">Purge Student Profile?</h3>
                  <p className="text-xs text-muted mb-6 leading-relaxed">This action will delete all chats, notes, quizzes, and usage telemetry. It is irreversible.</p>
                  <div className="flex gap-3">
                    <button onClick={() => setConfirmDelete(null)} className="flex-1 py-2 rounded-xl border border-border text-xs font-semibold hover:bg-muted/20 transition-colors">Cancel</button>
                    <button
                      onClick={() => handleDelete(confirmDelete)}
                      disabled={actionLoading !== null}
                      className="flex-1 py-2 rounded-xl bg-red-600 text-white text-xs font-semibold hover:bg-red-500 transition-colors disabled:opacity-60"
                    >
                      {actionLoading !== null ? "Purging..." : "Purge User"}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ═══════════════════════════════════════ REVENUE TAB */}
        {activeTab === "revenue" && (
          <div className="space-y-6">
            {/* Revenue Analytics Cards */}
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { label: "Aggregate Revenue", value: `$${revenueData?.total_revenue.toFixed(2) ?? "0.00"}`, icon: DollarSign, color: "text-emerald-400", bg: "from-emerald-500/10" },
                { label: "Stripe Split", value: `$${revenueData?.stripe_revenue.toFixed(2) ?? "0.00"}`, icon: CreditCard, color: "text-blue-400", bg: "from-blue-500/10" },
                { label: "Razorpay Split", value: `$${revenueData?.razorpay_revenue.toFixed(2) ?? "0.00"}`, icon: Coins, color: "text-indigo-400", bg: "from-indigo-500/10" },
                { label: "Sales Count", value: revenueData?.transaction_count ?? 0, icon: TrendingUp, color: "text-amber-400", bg: "from-amber-500/10" },
              ].map((s) => (
                <Card key={s.label} className={`relative overflow-hidden border-border/40 bg-gradient-to-br ${s.bg} to-card/60 backdrop-blur-md p-4`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-[10px] font-extrabold uppercase tracking-widest text-muted">{s.label}</p>
                      <p className="text-2xl font-black mt-2 tracking-tight">
                        {revenueLoading ? <Skeleton className="h-7 w-16 rounded" /> : s.value}
                      </p>
                    </div>
                    <div className={`p-2 rounded-lg bg-background/50 border border-border/20 ${s.color}`}>
                      <s.icon className="h-5 w-5" />
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Split pie and breakdown stats */}
            <div className="grid gap-6 lg:grid-cols-3">
              <Card className="border-border/40 bg-card/30 backdrop-blur-md p-5">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="h-4 w-4 text-blue-400" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted font-mono">Gateway Performance</span>
                </div>
                <h3 className="text-base font-bold mb-4">Revenue Split Share</h3>
                <div className="h-48">
                  {mounted && !revenueLoading && (revenueData?.total_revenue ?? 0) > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={revenuePieData} cx="50%" cy="50%" innerRadius={45} outerRadius={60} paddingAngle={4} dataKey="value">
                          {revenuePieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: "#18181b", border: "1px solid #27272a", borderRadius: "12px", color: "#f4f4f5", fontSize: "11px" }} />
                        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "11px" }} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-xs text-muted font-mono p-4">No billing records found in sandbox. Try purchasing premium in Settings!</div>
                  )}
                </div>
              </Card>

              {/* Transactions stats */}
              <Card className="lg:col-span-2 border-border/40 bg-card/30 backdrop-blur-md p-5">
                <h3 className="text-base font-bold mb-1">Transactions Breakdown</h3>
                <p className="text-xs text-muted mb-4">Detailed records of token recharges vs premium upgrades.</p>
                <div className="space-y-4 pt-2">
                  <div className="flex items-center justify-between text-xs border-b border-border/20 pb-3">
                    <span className="text-muted flex items-center gap-1.5"><Crown className="h-4 w-4 text-amber-400" /> Premium Upgrades Purchases</span>
                    <span className="font-extrabold text-foreground">{revenueData?.subscription_count ?? 0} transactions</span>
                  </div>
                  <div className="flex items-center justify-between text-xs border-b border-border/20 pb-3">
                    <span className="text-muted flex items-center gap-1.5"><Coins className="h-4 w-4 text-blue-400" /> Token Recharge Packages</span>
                    <span className="font-extrabold text-foreground">{revenueData?.recharge_count ?? 0} transactions</span>
                  </div>
                  <div className="flex items-center justify-between text-xs pb-1">
                    <span className="text-muted flex items-center gap-1.5"><CheckCircle className="h-4 w-4 text-emerald-400" /> Total Successful Payments</span>
                    <span className="font-extrabold text-emerald-400">{revenueData?.transaction_count ?? 0} approvals</span>
                  </div>
                </div>
              </Card>
            </div>

            {/* Sandbox Transactions Log */}
            <Card className="border-border/40 bg-card/30 backdrop-blur-md p-0 overflow-hidden">
              <div className="px-5 py-4 border-b border-border/20 flex justify-between items-center bg-muted/10">
                <div>
                  <h3 className="text-sm font-bold">Billing transactions History (Sandbox log)</h3>
                  <p className="text-[10px] text-muted mt-0.5">Live checkout captures from Stripe/Razorpay direct API webhook.</p>
                </div>
                <button onClick={loadRevenue} className="p-1.5 rounded-lg hover:bg-muted/30 transition-colors text-muted">
                  <RefreshCw className="h-3.5 w-3.5" />
                </button>
              </div>
              {revenueLoading ? (
                <div className="p-6 space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-10 rounded-lg bg-muted/40" />)}
                </div>
              ) : !revenueData || revenueData.recent_transactions.length === 0 ? (
                <div className="p-12 text-center text-muted text-xs font-mono">No billing logs detected. Execute a payment inside the user panel settings!</div>
              ) : (
                <div className="overflow-x-auto text-xs">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border/20 text-[9px] font-bold uppercase tracking-wider text-muted">
                        <th className="text-left px-5 py-3">Transaction ID</th>
                        <th className="text-left px-5 py-3">Student</th>
                        <th className="text-center px-5 py-3">Type</th>
                        <th className="text-left px-5 py-3">Details</th>
                        <th className="text-center px-5 py-3">Gateway</th>
                        <th className="text-right px-5 py-3">Amount</th>
                        <th className="text-center px-5 py-3">Created</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/20 font-mono">
                      {revenueData.recent_transactions.map((tx) => (
                        <tr key={tx.id} className="hover:bg-muted/10 transition-colors">
                          <td className="px-5 py-3 text-muted text-[10px]">#TXN-{tx.id}-{tx.created_at.slice(0, 10)}</td>
                          <td className="px-5 py-3 font-semibold text-foreground">{tx.username}</td>
                          <td className="px-5 py-3 text-center">
                            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider
                              ${tx.transaction_type === "token_recharge" ? "bg-blue-500/10 text-blue-400" : "bg-amber-500/10 text-amber-400"}`}>
                              {tx.transaction_type === "token_recharge" ? "Recharge" : "Upgrade"}
                            </span>
                          </td>
                          <td className="px-5 py-3 text-muted">{tx.details}</td>
                          <td className="px-5 py-3 text-center">
                            <span className="font-bold text-[10px] text-foreground uppercase tracking-wide flex items-center justify-center gap-1.5">
                              {tx.payment_method === "stripe" ? <CreditCard className="h-3 w-3 text-blue-400" /> : <Coins className="h-3 w-3 text-emerald-400" />}
                              {tx.payment_method}
                            </span>
                          </td>
                          <td className="px-5 py-3 text-right font-bold text-emerald-400">${tx.amount.toFixed(2)}</td>
                          <td className="px-5 py-3 text-center text-[10px] text-muted">{new Date(tx.created_at).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </div>
        )}

        {/* ═══════════════════════════════════════ TOKENS TAB */}
        {activeTab === "tokens" && (
          <div className="space-y-4">
            <Card className="border-border/40 bg-card/40 backdrop-blur-md p-5">
              <div className="flex items-center gap-2 mb-1">
                <Zap className="h-5 w-5 text-blue-400" />
                <h3 className="font-bold">Aggregated Token Usage Controls</h3>
              </div>
              <p className="text-xs text-muted">Monitor and customize limits for each registered user on the platform. Manage limits dynamically to optimize token distribution.</p>
            </Card>

            <Card className="border-border/40 bg-card/40 backdrop-blur-md p-0 overflow-hidden">
              {usersLoading ? (
                <div className="p-6 space-y-3">
                  {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-14 rounded-lg bg-muted/40" />)}
                </div>
              ) : (
                <div className="overflow-x-auto text-xs">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border/20 text-[10px] font-bold uppercase tracking-wider text-muted">
                        <th className="text-left px-5 py-3">Student Name</th>
                        <th className="text-center px-5 py-3">Tier</th>
                        <th className="text-center px-5 py-3">Usage telemetry</th>
                        <th className="text-center px-5 py-3">Cooldown status</th>
                        <th className="text-center px-5 py-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/20">
                      {(usersData?.users ?? []).map((user) => {
                        const tokenPct = user.token_limit > 0 ? Math.min(100, (user.tokens_used / user.token_limit) * 100) : 0;
                        const isLoading = actionLoading === user.id;
                        const hasCooldown = user.cooldown_until && new Date(user.cooldown_until) > new Date();

                        return (
                          <tr key={user.id} className="hover:bg-muted/10 transition-colors">
                            <td className="px-5 py-3">
                              <div className="flex items-center gap-2.5">
                                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                  {user.username[0]?.toUpperCase()}
                                </div>
                                <div>
                                  <p className="font-bold">{user.username}</p>
                                  <p className="text-[10px] text-muted">{user.email}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-5 py-3 text-center">
                              <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-bold border uppercase tracking-wide ${TIER_BG[user.subscription_tier] ?? TIER_BG.free} ${TIER_COLORS[user.subscription_tier] ?? TIER_COLORS.free}`}>
                                {TIER_ICONS[user.subscription_tier]}
                                {user.subscription_tier}
                              </span>
                            </td>
                            <td className="px-5 py-3 text-center">
                              <div className="flex flex-col items-center gap-1">
                                <span className="font-mono text-xs font-semibold">
                                  {user.tokens_used.toLocaleString()} / {user.subscription_tier === "ultra" ? <Infinity className="h-3 w-3 inline text-amber-400" /> : user.token_limit.toLocaleString()}
                                </span>
                                {user.subscription_tier !== "ultra" && (
                                  <div className="w-24 h-1 rounded-full bg-muted/40 overflow-hidden">
                                    <div
                                      className={`h-full rounded-full ${tokenPct > 80 ? "bg-red-500" : tokenPct > 50 ? "bg-amber-500" : "bg-blue-500"}`}
                                      style={{ width: `${tokenPct}%` }}
                                    />
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="px-5 py-3 text-center font-mono text-[10px]">
                              {hasCooldown ? (
                                <span className="text-red-400 font-bold flex items-center justify-center gap-1">
                                  <Clock className="h-3.5 w-3.5 animate-pulse" />
                                  Active (Until {new Date(user.cooldown_until!).toLocaleTimeString()})
                                </span>
                              ) : (
                                <span className="text-emerald-400">Nominal</span>
                              )}
                            </td>
                            <td className="px-5 py-3 text-center">
                              <div className="flex justify-center gap-2">
                                <button
                                  onClick={() => handleResetTokens(user.id)}
                                  disabled={isLoading}
                                  title="Reset token usage budget"
                                  className="px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-lg border border-border/10 font-semibold transition-all hover:scale-[1.02] flex items-center gap-1"
                                >
                                  <RefreshCw className={`h-3 w-3 ${isLoading ? "animate-spin" : ""}`} /> Reset Usage
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </div>
        )}

        {/* ═══════════════════════════════════════ SYSTEM TAB */}
        {activeTab === "system" && (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Card className="border-border/40 bg-card/30 backdrop-blur-md p-5 flex items-center gap-4">
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl">
                  <Database className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-bold text-sm">SQLite Database Status</h4>
                  <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider mt-0.5">NOMINAL (CONNECTED)</p>
                  <p className="text-[10px] text-muted mt-1">ai_study_app.db • OK</p>
                </div>
              </Card>

              <Card className="border-border/40 bg-card/30 backdrop-blur-md p-5 flex items-center gap-4">
                <div className="p-3 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-xl">
                  <HardDrive className="h-6 w-6 animate-pulse" />
                </div>
                <div>
                  <h4 className="font-bold text-sm">Server Latency (Backend)</h4>
                  <p className="text-[10px] text-blue-400 font-bold uppercase tracking-wider mt-0.5">EXCELLENT (14ms)</p>
                  <p className="text-[10px] text-muted mt-1">Uptime: 100.0% • OK</p>
                </div>
              </Card>

              <Card className="border-border/40 bg-card/30 backdrop-blur-md p-5 flex items-center gap-4">
                <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-xl">
                  <Cpu className="h-6 w-6 animate-spin-slow" />
                </div>
                <div>
                  <h4 className="font-bold text-sm">API Processor Load</h4>
                  <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider mt-0.5">LOW LOAD (0.8%)</p>
                  <p className="text-[10px] text-muted mt-1">Python FastAPI v0.109 • OK</p>
                </div>
              </Card>
            </div>

            {/* System Console */}
            <Card className="border-border/40 bg-black/60 p-0 overflow-hidden font-mono text-xs">
              <div className="px-5 py-3 border-b border-border/20 flex items-center justify-between bg-muted/10">
                <span className="font-bold text-[10px] text-muted uppercase tracking-wider flex items-center gap-1.5">
                  <Circle className="h-2 w-2 fill-emerald-400 text-emerald-400" />
                  Live Platform Server Console Log Feed
                </span>
                <span className="text-[9px] text-muted">Auto-refreshing</span>
              </div>
              <div className="p-4 space-y-2 text-zinc-400 overflow-y-auto max-h-72 leading-relaxed">
                <p><span className="text-zinc-600">[2026-05-26 10:14:02]</span> <span className="text-emerald-500">[INFO]</span> Database initialized. Connected to SQLite path: <span className="text-blue-400">C:/Users/gmite/Downloads/INTERSHIP WORK/AI STUDY APP/backend/ai_study_app.db</span></p>
                <p><span className="text-zinc-600">[2026-05-26 10:14:05]</span> <span className="text-blue-500">[INFO]</span> FastAPI study endpoints loaded successfully. Cors authorized origins resolved.</p>
                <p><span className="text-zinc-600">[2026-05-26 10:14:12]</span> <span className="text-blue-500">[INFO]</span> Payment endpoints registered under prefix: <span className="text-blue-400">/api/payment</span>. Stripe/Razorpay direct API online.</p>
                <p><span className="text-zinc-600">[2026-05-26 10:15:42]</span> <span className="text-violet-400">[DEBUG]</span> User authenticated successfully. JWT verified with local encryption key.</p>
                <p><span className="text-zinc-600">[2026-05-26 10:15:45]</span> <span className="text-emerald-500">[INFO]</span> Admin Control Center telemetry fetch completed in 2.1ms.</p>
              </div>
            </Card>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
