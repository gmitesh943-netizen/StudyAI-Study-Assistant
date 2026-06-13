"use client";

import { UserButton } from "@clerk/nextjs";
import { LogOut, ShieldCheck, User } from "lucide-react";
import { DEV_BYPASS } from "@/lib/auth";
import { useAppAuth, useAppUser } from "@/hooks/useAppAuth";

export default function UserMenu() {
  const { user } = useAppUser();
  const { isAdmin, signOut } = useAppAuth();

  if (!DEV_BYPASS) {
    return <UserButton />;
  }

  const name = user
    ? `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || "Student"
    : "Student";

  return (
    <div className="flex items-center gap-2 rounded-full border border-border bg-card py-1 pl-1 pr-2">
      <div
        className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white text-sm font-semibold"
        title={name}
      >
        {user?.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={user.imageUrl} alt={name} className="h-8 w-8 rounded-full object-cover" />
        ) : isAdmin ? (
          <ShieldCheck className="h-4 w-4" />
        ) : (
          <User className="h-4 w-4" />
        )}
      </div>
      <span className="hidden max-w-28 truncate text-xs font-medium sm:block">{name}</span>
      <button
        type="button"
        onClick={signOut}
        className="rounded-full p-1 text-muted transition-colors hover:bg-gray-100 hover:text-foreground dark:hover:bg-gray-800"
        aria-label="Log out"
        title="Log out"
      >
        <LogOut className="h-4 w-4" />
      </button>
    </div>
  );
}
