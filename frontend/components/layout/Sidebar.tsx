"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAppAuth, useAppUser } from "@/hooks/useAppAuth";
import {
  LayoutDashboard,
  MessageSquare,
  FileText,
  Layers,
  Calendar,
  Upload,
  BookOpen,
  Mic,
  Settings,
  Shield,
  Brain,
  X,
  Zap,
  Star,
  Crown,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/ai-tutor", label: "AI Tutor", icon: MessageSquare },
  { href: "/dashboard/quiz", label: "Quiz", icon: Brain },
  { href: "/dashboard/notes", label: "Notes", icon: FileText },
  { href: "/dashboard/flashcards", label: "Flashcards", icon: Layers },
  { href: "/dashboard/planner", label: "Planner", icon: Calendar },
  { href: "/dashboard/pdf", label: "PDF Tools", icon: Upload },
  { href: "/dashboard/courses", label: "Courses", icon: BookOpen },
  { href: "/dashboard/voice", label: "Voice", icon: Mic },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
  { href: "/dashboard/admin", label: "Admin", icon: Shield, adminOnly: true },
];

const adminNavItems = [
  { href: "/dashboard/admin", label: "Admin Overview", icon: Shield },
  { href: "/dashboard", label: "Student Panel", icon: LayoutDashboard },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

const TIER_ICON: Record<string, React.ReactNode> = {
  free: <Zap className="h-3 w-3" />,
  pro: <Star className="h-3 w-3" />,
  ultra: <Crown className="h-3 w-3" />,
};

interface SidebarProps {
  open?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { isAdmin } = useAppAuth();
  const { user } = useAppUser();
  
  const isAdminRoute = pathname.startsWith("/dashboard/admin");
  const visibleNavItems = isAdminRoute
    ? adminNavItems
    : navItems.filter((item) => !item.adminOnly || isAdmin);

  const tier = user?.subscription_tier ?? "free";
  const tokensUsed = user?.tokens_used ?? 0;
  const tokenLimit = user?.token_limit ?? 1000;
  const tokenPct = tier === "ultra" ? 0 : Math.min(100, (tokensUsed / tokenLimit) * 100);

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={onClose} />
      )}
      <aside
        className={cn(
          "fixed left-0 top-0 z-50 flex h-full w-64 flex-col border-r border-border bg-background transition-transform duration-300 lg:static lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex items-center justify-between border-b border-border p-4">
          <Link href="/dashboard" className="flex items-center gap-2 font-bold">
            <Brain className="h-6 w-6 text-primary" />
            <span>Study<span className="text-primary">AI</span></span>
          </Link>
          <button onClick={onClose} className="lg:hidden rounded-lg p-1 hover:bg-gray-100 dark:hover:bg-gray-800">
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto p-4">
          <ul className="space-y-1">
            {visibleNavItems.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onClose}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                      active
                        ? "bg-primary/10 text-primary"
                        : "text-muted hover:bg-gray-100 hover:text-foreground dark:hover:bg-gray-800"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Token Usage Footer */}
        <div className="border-t border-border p-4">
          <Link href="/dashboard/settings" className="block group">
            <div className="flex items-center justify-between mb-2">
              <div className={`flex items-center gap-1.5 text-xs font-semibold ${
                tier === "ultra" ? "text-amber-400" : tier === "pro" ? "text-blue-400" : "text-zinc-400"
              }`}>
                {TIER_ICON[tier]}
                {tier.charAt(0).toUpperCase() + tier.slice(1)} Plan
              </div>
              <span className="text-[10px] text-muted">
                {tier === "ultra" ? "∞" : `${tokensUsed}/${tokenLimit}`}
              </span>
            </div>
            {tier !== "ultra" && (
              <div className="w-full h-1.5 rounded-full bg-muted/30 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    tokenPct > 80 ? "bg-red-500" : tokenPct > 50 ? "bg-amber-500" : "bg-emerald-500"
                  }`}
                  style={{ width: `${tokenPct}%` }}
                />
              </div>
            )}
            {tier === "ultra" && (
              <div className="w-full h-1.5 rounded-full bg-gradient-to-r from-amber-500/30 via-amber-400/50 to-amber-500/30" />
            )}
          </Link>
        </div>
      </aside>
    </>
  );
}
