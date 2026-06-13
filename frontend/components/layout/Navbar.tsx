"use client";

import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Brain } from "lucide-react";
import Button from "@/components/ui/Button";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { useAppAuth } from "@/hooks/useAppAuth";
import UserMenu from "@/components/auth/UserMenu";

const links = [
  { href: "/features", label: "Features" },
  { href: "/pricing", label: "Pricing" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { isSignedIn } = useAppAuth();

  return (
    <nav className="sticky top-0 z-50 glass border-b border-border">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl">
          <Brain className="h-7 w-7 text-primary" />
          <span>Study<span className="text-primary">AI</span></span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="text-sm text-muted hover:text-primary transition-colors">
              {l.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <ThemeToggle />
          {!isSignedIn ? (
            <>
              <Link href="/sign-in"><Button variant="ghost" size="sm">Log in</Button></Link>
              <Link href="/sign-up"><Button size="sm">Get Started</Button></Link>
            </>
          ) : (
            <>
              <Link href="/dashboard"><Button variant="outline" size="sm">Dashboard</Button></Link>
              <UserMenu />
            </>
          )}
        </div>

        <button className="md:hidden" onClick={() => setOpen(!open)} aria-label="Toggle menu">
          {open ? <X /> : <Menu />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-border md:hidden overflow-hidden"
          >
            <div className="flex flex-col gap-4 p-4">
              {links.map((l) => (
                <Link key={l.href} href={l.href} onClick={() => setOpen(false)}>{l.label}</Link>
              ))}
              <ThemeToggle />
              {!isSignedIn ? (
                <>
                  <Link href="/sign-in"><Button variant="ghost" className="w-full">Log in</Button></Link>
                  <Link href="/sign-up"><Button className="w-full">Get Started</Button></Link>
                </>
              ) : (
                <Link href="/dashboard"><Button className="w-full">Dashboard</Button></Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
