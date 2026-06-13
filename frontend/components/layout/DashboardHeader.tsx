"use client";

import { Menu, Search } from "lucide-react";
import ThemeToggle from "@/components/ui/ThemeToggle";
import UserMenu from "@/components/auth/UserMenu";

interface DashboardHeaderProps {
  title: string;
  subtitle?: string;
  onMenuClick?: () => void;
}

export default function DashboardHeader({ title, subtitle, onMenuClick }: DashboardHeaderProps) {
  return (
    <header className="sticky top-0 z-30 glass border-b border-border">
      <div className="flex items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800 lg:hidden"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold sm:text-2xl">{title}</h1>
            {subtitle && <p className="text-sm text-muted">{subtitle}</p>}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2">
            <Search className="h-4 w-4 text-muted" />
            <input
              type="search"
              placeholder="Search..."
              className="bg-transparent text-sm outline-none w-40 lg:w-56"
            />
          </div>
          <ThemeToggle />
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
