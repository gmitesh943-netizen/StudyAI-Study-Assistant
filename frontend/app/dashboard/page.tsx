"use client";

import { useCallback, useEffect, useState } from "react";
import { useAppAuth } from "@/hooks/useAppAuth";
import DashboardShell from "@/components/dashboard/DashboardShell";
import StatsCards from "@/components/dashboard/StatsCards";
import ProgressChart from "@/components/dashboard/ProgressChart";
import RecentActivity from "@/components/dashboard/RecentActivity";
import { api, type DashboardData } from "@/lib/api";
import { DEMO_DASHBOARD } from "@/lib/demo-data";
import { Skeleton } from "@/components/ui/Skeleton";

export default function DashboardPage() {
  const { getToken } = useAppAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const loadDashboard = useCallback(async () => {
    try {
      const token = await getToken();
      const res = await api.getDashboard(token ?? undefined);
      setData(res);
    } catch {
      setData(DEMO_DASHBOARD);
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    queueMicrotask(loadDashboard);
    const interval = window.setInterval(loadDashboard, 30000);
    return () => window.clearInterval(interval);
  }, [loadDashboard]);

  return (
    <DashboardShell title="Dashboard" subtitle="Welcome back! Here's your study overview.">
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
      ) : data ? (
        <div className="space-y-6">
          <StatsCards stats={data.stats} />
          <div className="grid gap-6 lg:grid-cols-2">
            <ProgressChart data={data.progress} />
            <RecentActivity activities={data.recent_activity} />
          </div>
        </div>
      ) : null}
    </DashboardShell>
  );
}
