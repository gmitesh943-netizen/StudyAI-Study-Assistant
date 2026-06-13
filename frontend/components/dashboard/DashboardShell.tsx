"use client";

import DashboardHeader from "@/components/layout/DashboardHeader";
import { useSidebar } from "@/app/dashboard/layout";

interface DashboardShellProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export default function DashboardShell({ title, subtitle, children }: DashboardShellProps) {
  const { openSidebar } = useSidebar();

  return (
    <>
      <DashboardHeader title={title} subtitle={subtitle} onMenuClick={openSidebar} />
      <div className="flex-1 p-4 sm:p-6">{children}</div>
    </>
  );
}
