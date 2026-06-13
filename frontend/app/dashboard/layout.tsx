"use client";

import { createContext, useContext, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import Button from "@/components/ui/Button";
import { useAppAuth } from "@/hooks/useAppAuth";
import { useUsageAnalytics } from "@/hooks/useUsageAnalytics";
import { Lock, ShieldAlert } from "lucide-react";

const SidebarContext = createContext<{ openSidebar: () => void }>({ openSidebar: () => {} });

export function useSidebar() {
  return useContext(SidebarContext);
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { isLoaded, isSignedIn, isAdmin } = useAppAuth();
  const isAdminRoute = pathname.startsWith("/dashboard/admin");
  useUsageAnalytics();

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.replace("/sign-in");
    }
  }, [isLoaded, isSignedIn, router]);

  if (!isLoaded || !isSignedIn) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 text-center shadow-sm">
          <Lock className="mx-auto mb-4 h-10 w-10 text-primary" />
          <h1 className="text-xl font-bold">Login required</h1>
          <p className="mt-2 text-sm text-muted">Please log in to continue to your study workspace.</p>
        </div>
      </div>
    );
  }

  if (isAdminRoute && !isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 text-center shadow-sm">
          <ShieldAlert className="mx-auto mb-4 h-12 w-12 text-primary" />
          <h1 className="text-2xl font-bold">Admin access only</h1>
          <p className="mt-2 text-sm text-muted">
            This area is separated from student accounts. Log in with an admin account to manage platform data.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link href="/dashboard">
              <Button variant="outline" className="w-full sm:w-auto">Go to Dashboard</Button>
            </Link>
            <Link href="/sign-in">
              <Button className="w-full sm:w-auto">Admin Login</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <SidebarContext.Provider value={{ openSidebar: () => setSidebarOpen(true) }}>
      <div className="flex min-h-screen">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex flex-1 flex-col min-w-0">{children}</div>
      </div>
    </SidebarContext.Provider>
  );
}
