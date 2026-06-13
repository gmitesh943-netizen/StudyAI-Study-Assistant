"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import {
  Brain, Eye, EyeOff, Lock, ShieldCheck, UserRound,
  Sparkles, BookOpen, Zap, Star, ArrowRight
} from "lucide-react";
import { useAppAuth } from "@/hooks/useAppAuth";
import { cn } from "@/lib/utils";

interface LocalAuthFormProps {
  mode: "sign-in" | "sign-up";
}

type LoginRole = "user" | "admin";

const features = [
  { icon: Brain,    text: "AI-powered tutoring & quizzes" },
  { icon: BookOpen, text: "Notes, flashcards & PDF tools" },
  { icon: Zap,      text: "Study planner & voice tutor" },
  { icon: Star,     text: "Real-time progress analytics" },
];

export default function LocalAuthForm({ mode }: LocalAuthFormProps) {
  const router = useRouter();
  const { signIn, signUp } = useAppAuth();
  const [role, setRole]       = useState<LoginRole>("user");
  const [email, setEmail]     = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);

  const isSignUp = mode === "sign-up";

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (isSignUp) {
        await signUp(email, username, password);
        router.replace("/dashboard");
      } else {
        await signIn(email, password, role);
        router.replace(role === "admin" ? "/dashboard/admin" : "/dashboard");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    /* Full-screen centred background */
    <div className="min-h-screen flex items-center justify-center p-4 bg-white">

      {/* ── CARD ── */}
      <div className="flex w-full max-w-4xl rounded-2xl overflow-hidden shadow-2xl shadow-black/20">

        {/* ── LEFT PANEL ── */}
        <div
          className="hidden sm:flex flex-col items-center justify-center w-[42%] p-10 relative overflow-hidden"
          style={{
            background: "linear-gradient(145deg, #7f1d1d 0%, #b91c1c 45%, #ef4444 100%)",
          }}
        >
          {/* Blobs */}
          <div className="absolute -top-16 -left-16 w-48 h-48 rounded-full opacity-20"
            style={{ background: "radial-gradient(circle, #fca5a5 0%, transparent 70%)" }} />
          <div className="absolute -bottom-16 -right-10 w-56 h-56 rounded-full opacity-15"
            style={{ background: "radial-gradient(circle, #fecaca 0%, transparent 70%)" }} />

          {/* Logo */}
          <Link href="/" className="absolute top-5 left-5 flex items-center gap-1.5">
            <div className="w-7 h-7 rounded-lg bg-white/20 border border-white/30 flex items-center justify-center">
              <Brain className="h-4 w-4 text-white" />
            </div>
            <span className="text-white font-bold text-sm tracking-wide">StudyAI</span>
          </Link>

          {/* Content */}
          <div className="relative z-10 text-white text-center">
            {/* Icon */}
            <div className="mx-auto mb-4 w-14 h-14 rounded-xl bg-white/15 border border-white/25 flex items-center justify-center shadow-xl">
              <Brain className="h-7 w-7 text-white" />
            </div>

            <h2 className="text-xl font-extrabold mb-2 leading-tight">
              {isSignUp ? "Start Your\nJourney!" : "Welcome\nBack!"}
            </h2>
            <p className="text-red-100 text-xs leading-relaxed mb-5">
              {isSignUp
                ? "Join students learning smarter with AI tools."
                : "Stay connected and continue your learning journey."}
            </p>

            {/* Feature pills */}
            <div className="space-y-2 text-left">
              {features.map((f, i) => {
                const Icon = f.icon;
                return (
                  <div key={i} className="flex items-center gap-2.5 bg-white/10 border border-white/15 rounded-lg px-3 py-2">
                    <div className="w-6 h-6 rounded-md bg-white/20 flex items-center justify-center flex-shrink-0">
                      <Icon className="h-3 w-3 text-white" />
                    </div>
                    <span className="text-[11px] text-red-50 font-medium leading-snug">{f.text}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bottom tagline */}
          <div className="absolute bottom-4 flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-red-300" />
            <span className="text-red-200 text-[10px] font-medium">AI-Powered Learning</span>
          </div>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div className="flex-1 bg-white dark:bg-zinc-950 flex flex-col justify-center px-10 py-10">
          {/* Mobile logo */}
          <Link href="/" className="sm:hidden mb-6 flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #7f1d1d, #dc2626)" }}>
              <Brain className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-lg">Study<span style={{ color: "#ef4444" }}>AI</span></span>
          </Link>

          {/* Header */}
          <div className="mb-5">
            <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-white mb-1">
              {isSignUp ? "Create Account" : "welcome"}
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400 text-xs">
              {isSignUp ? "Fill in your details to get started." : "Login in to your account to continue"}
            </p>
          </div>

          {/* Role toggle */}
          {!isSignUp && (
            <div className="mb-4 flex gap-1.5 p-1 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
              {[
                { value: "user" as const, label: "Student", icon: UserRound },
                { value: "admin" as const, label: "Admin",   icon: ShieldCheck },
              ].map((item) => {
                const Icon   = item.icon;
                const active = role === item.value;
                return (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setRole(item.value)}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-all duration-200",
                      active ? "text-white shadow-sm" : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-700"
                    )}
                    style={active ? { background: "linear-gradient(135deg, #b91c1c, #ef4444)" } : {}}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {item.label}
                  </button>
                );
              })}
            </div>
          )}

          {/* Form */}
          <form className="space-y-3" onSubmit={onSubmit}>
            {isSignUp && (
              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                  Username
                </label>
                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required minLength={3}
                  placeholder="mgauswami"
                  className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 px-3 py-2.5 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 outline-none transition-all focus:border-red-400 focus:ring-2 focus:ring-red-400/15"
                />
              </div>
            )}

            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                Email...
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 px-3 py-2.5 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 outline-none transition-all focus:border-red-400 focus:ring-2 focus:ring-red-400/15"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                  Password...
                </label>
                {!isSignUp && (
                  <button type="button" className="text-[10px] font-semibold" style={{ color: "#ef4444" }}>
                    Forgot your password?
                  </button>
                )}
              </div>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required minLength={6}
                  placeholder="Minimum 6 characters"
                  className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 px-3 py-2.5 pr-9 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 outline-none transition-all focus:border-red-400 focus:ring-2 focus:ring-red-400/15"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors"
                >
                  {showPass ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex gap-2 rounded-lg border border-red-200 bg-red-50 dark:border-red-500/20 dark:bg-red-500/10 p-2.5 text-xs text-red-600 dark:text-red-400">
                <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-bold text-white transition-all duration-200 hover:opacity-90 active:scale-[0.98] disabled:opacity-60"
              style={{
                background: "linear-gradient(135deg, #7f1d1d 0%, #b91c1c 50%, #ef4444 100%)",
                boxShadow: "0 4px 16px rgba(239,68,68,0.35)",
              }}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Please wait...
                </span>
              ) : (
                <>{isSignUp ? "CREATE ACCOUNT" : "LOG IN"}<ArrowRight className="h-3.5 w-3.5" /></>
              )}
            </button>
          </form>

          {/* Footer */}
          <p className="mt-4 text-center text-xs text-zinc-500 dark:text-zinc-400">
            {isSignUp ? (
              <>Already have an account?{" "}
                <Link href="/sign-in" className="font-semibold hover:underline" style={{ color: "#ef4444" }}>Sign in</Link>
              </>
            ) : (
              <>Don&apos;t have an account?{" "}
                <Link href="/sign-up" className="font-semibold hover:underline" style={{ color: "#ef4444" }}>Sign up</Link>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
