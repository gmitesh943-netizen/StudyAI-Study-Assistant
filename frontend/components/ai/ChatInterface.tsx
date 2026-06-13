"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useAppAuth } from "@/hooks/useAppAuth";
import {
  Send, Bot, User, Sparkles, Globe, Zap, AlertTriangle,
  Coins, X, ArrowUpRight, RefreshCw, Loader2, ChevronDown,
} from "lucide-react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { api, type UserData } from "@/lib/api";
import { useToast } from "@/hooks/useToast";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Message {
  role: "user" | "assistant";
  content: string;
}

// ── Simple language detector (client-side hint for UI badge) ──────────────
function detectLanguage(text: string): { code: string; label: string; flag: string } {
  const trimmed = text.trim();

  // Gujarati Unicode range: U+0A80–U+0AFF
  const gujaratiRegex = /[\u0A80-\u0AFF]/;
  // Hindi/Devanagari range: U+0900–U+097F
  const hindiRegex = /[\u0900-\u097F]/;
  // Tamil: U+0B80–U+0BFF
  const tamilRegex = /[\u0B80-\u0BFF]/;
  // Telugu: U+0C00–U+0C7F
  const teluguRegex = /[\u0C00-\u0C7F]/;
  // Bengali: U+0980–U+09FF
  const bengaliRegex = /[\u0980-\u09FF]/;

  const gujCount = (trimmed.match(gujaratiRegex) || []).length;
  const hinCount = (trimmed.match(hindiRegex) || []).length;
  const tamCount = (trimmed.match(tamilRegex) || []).length;
  const telCount = (trimmed.match(teluguRegex) || []).length;
  const benCount = (trimmed.match(bengaliRegex) || []).length;

  const total = trimmed.length || 1;
  const latinChars = trimmed.replace(/[^a-zA-Z]/g, "").length;

  // Mixed language detection
  if (gujCount > 2 && latinChars > 3) return { code: "gu-en", label: "Gujlish", flag: "🇮🇳" };
  if (hinCount > 2 && latinChars > 3) return { code: "hi-en", label: "Hinglish", flag: "🇮🇳" };

  if (gujCount / total > 0.15) return { code: "gu", label: "ગુજરાતી", flag: "🇮🇳" };
  if (hinCount / total > 0.15) return { code: "hi", label: "हिन्दी", flag: "🇮🇳" };
  if (tamCount / total > 0.15) return { code: "ta", label: "தமிழ்", flag: "🇮🇳" };
  if (telCount / total > 0.15) return { code: "te", label: "తెలుగు", flag: "🇮🇳" };
  if (benCount / total > 0.15) return { code: "bn", label: "বাংলা", flag: "🇮🇳" };

  return { code: "en", label: "English", flag: "🌐" };
}

// ── Animated counter component ────────────────────────────────────────────
function AnimatedNumber({ value, duration = 600 }: { value: number; duration?: number }) {
  const safeValue = typeof value === "number" && !isNaN(value) ? value : 0;
  const [display, setDisplay] = useState(safeValue);
  const prevRef = useRef(safeValue);

  useEffect(() => {
    const safeTo = typeof value === "number" && !isNaN(value) ? value : 0;
    const from = prevRef.current;
    const to = safeTo;
    if (from === to) return;

    const diff = to - from;
    const startTime = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(from + diff * eased));
      if (progress < 1) requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
    prevRef.current = to;
  }, [value, duration]);

  return <>{(typeof display === "number" && !isNaN(display) ? display : 0).toLocaleString()}</>;
}

export default function ChatInterface() {
  const { getToken } = useAppAuth();
  const { addToast } = useToast();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "👋 Hi! I'm your **AI Study Tutor**. I can help you in any language — English, Hindi, Gujarati, or even mixed!\n\nAsk me anything about your coursework and I'll explain it step-by-step. 🚀",
    },
  ]);
  const [input, setInput] = useState("");
  const [subject, setSubject] = useState("General");
  const [loading, setLoading] = useState(false);
  const [detectedLang, setDetectedLang] = useState({ code: "en", label: "English", flag: "🌐" });
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // ── Token tracking state ────────────────────────────────────────────
  const [tokensUsed, setTokensUsed] = useState(0);
  const [tokenLimit, setTokenLimit] = useState(1000);
  const [cooldownUntil, setCooldownUntil] = useState<string | null>(null);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [showExhaustedModal, setShowExhaustedModal] = useState(false);
  const [tokenFlash, setTokenFlash] = useState(false);

  // Load initial token data from profile
  const loadTokenData = useCallback(async () => {
    try {
      const token = await getToken();
      if (token) {
        const me: UserData = await api.me(token);
        setTokensUsed(me.tokens_used);
        setTokenLimit(me.token_limit);
        setCooldownUntil(me.cooldown_until);
        setProfileLoaded(true);
      }
    } catch {
      /* silent */
    }
  }, [getToken]);

  useEffect(() => {
    loadTokenData();
  }, [loadTokenData]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Detect language as user types
  useEffect(() => {
    if (input.trim().length > 2) {
      setDetectedLang(detectLanguage(input));
    }
  }, [input]);

  const safeUsed = typeof tokensUsed === "number" && !isNaN(tokensUsed) ? tokensUsed : 0;
  const safeLimit = typeof tokenLimit === "number" && !isNaN(tokenLimit) && tokenLimit > 0 ? tokenLimit : 1000;
  const remaining = safeLimit - safeUsed;
  const tokenPct = Math.min(100, (safeUsed / safeLimit) * 100);
  const isLow = tokenPct > 75;
  const isExhausted = remaining <= 0;
  const hasCooldown = cooldownUntil ? new Date(cooldownUntil) > new Date() : false;

  const send = async () => {
    if (!input.trim() || loading) return;
    if (isExhausted || hasCooldown) {
      setShowExhaustedModal(true);
      return;
    }

    const userMsg = input.trim();
    const lang = detectLanguage(userMsg);
    setDetectedLang(lang);
    const history = messages.slice(-10);
    setInput("");
    setMessages((m) => [...m, { role: "user", content: userMsg }]);
    setLoading(true);

    try {
      const token = await getToken();
      const res = await api.chat(userMsg, subject, history, token ?? undefined);
      setMessages((m) => [...m, { role: "assistant", content: res.response }]);

      // Update token state from response
      if (res.tokens_used !== undefined) {
        setTokensUsed(res.tokens_used);
        setTokenFlash(true);
        setTimeout(() => setTokenFlash(false), 800);
      }
      if (res.token_limit !== undefined) setTokenLimit(res.token_limit);
      if (res.cooldown_until !== undefined) setCooldownUntil(res.cooldown_until ?? null);

      // Check if tokens are now exhausted
      if (res.tokens_used !== undefined && res.token_limit !== undefined) {
        if (res.tokens_used >= res.token_limit) {
          setShowExhaustedModal(true);
        }
      }
    } catch (error) {
      const detail = error instanceof Error ? error.message : "Please try again.";
      
      if (detail.includes("Cooldown") || detail.includes("Token limit")) {
        setShowExhaustedModal(true);
        // Refresh token data
        loadTokenData();
      }

      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content: `⚠️ ${detail}\n\nPlease check your token balance or upgrade your plan.`,
        },
      ]);
      addToast("AI tutor is unavailable", "error");
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const subjects = ["General", "Mathematics", "Physics", "Chemistry", "Biology", "Computer Science", "History", "English Literature"];

  return (
    <>
      <Card className="flex h-[calc(100vh-12rem)] min-h-[500px] flex-col overflow-hidden relative border-border/40 bg-card/50 backdrop-blur-sm">
        {/* ── Header: Subject + Token Tracker ────────────────────────── */}
        <div className="flex items-center gap-3 border-b border-border/30 pb-4 mb-4 flex-wrap">
          {/* AI Bot identity */}
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Bot className="h-5 w-5 text-white" />
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-card animate-pulse" />
          </div>

          <div className="flex-1 min-w-0">
            <h2 className="font-bold text-sm flex items-center gap-1.5">
              StudyGPT
              <span className="text-[9px] font-extrabold uppercase tracking-widest bg-blue-500/15 text-blue-400 px-2 py-0.5 rounded-full">
                Multilingual
              </span>
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="rounded-lg border border-border/40 bg-transparent px-2 py-0.5 text-xs text-muted hover:text-foreground transition-colors cursor-pointer focus:outline-none focus:border-blue-500/50"
              >
                {subjects.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>

              {/* Language badge */}
              <div className="flex items-center gap-1 text-[10px] text-muted bg-muted/10 px-2 py-0.5 rounded-full border border-border/20">
                <Globe className="h-3 w-3 text-blue-400" />
                <span>{detectedLang.flag} {detectedLang.label}</span>
              </div>
            </div>
          </div>

          {/* ── Live Token Counter ──────────────────────────────── */}
          {profileLoaded && (
            <div className={`flex flex-col items-end gap-1 transition-all duration-300 ${tokenFlash ? "scale-105" : ""}`}>
              <div className="flex items-center gap-1.5 text-xs font-bold">
                <Zap className={`h-3.5 w-3.5 ${isLow ? "text-amber-400" : "text-blue-400"} ${tokenFlash ? "animate-bounce" : ""}`} />
                <span className={`tabular-nums ${isLow ? "text-amber-400" : "text-foreground"}`}>
                  <AnimatedNumber value={Math.max(0, remaining)} />
                </span>
                <span className="text-muted font-normal text-[10px]">tokens left</span>
              </div>

              {/* Mini progress bar */}
              <div className="w-28 h-1.5 rounded-full bg-muted/20 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ease-out ${
                    tokenPct > 90 ? "bg-red-500" :
                    tokenPct > 75 ? "bg-amber-500" :
                    "bg-gradient-to-r from-blue-500 to-indigo-500"
                  }`}
                  style={{ width: `${tokenPct}%` }}
                />
              </div>

              {/* Used / Limit text */}
              <span className="text-[9px] text-muted tabular-nums">
                <AnimatedNumber value={safeUsed} /> / {safeLimit.toLocaleString()} used
              </span>
            </div>
          )}
        </div>

        {/* ── Low Token Warning Banner ────────────────────────────── */}
        {isLow && !isExhausted && profileLoaded && (
          <div className="mx-0 mb-3 flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs animate-fadeIn">
            <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0" />
            <span className="font-semibold">Low tokens!</span>
            <span className="text-amber-400/70">Only {Math.max(0, remaining).toLocaleString()} tokens remaining. Recharge or upgrade to continue studying.</span>
          </div>
        )}

        {/* ── Messages Area ──────────────────────────────────────── */}
        <div className="flex-1 space-y-4 overflow-y-auto pr-1 scrollbar-thin">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex gap-3 animate-slideUp ${msg.role === "user" ? "flex-row-reverse" : ""}`}
              style={{ animationDelay: `${Math.min(i * 50, 300)}ms` }}
            >
              {/* Avatar */}
              <div
                className={`shrink-0 w-8 h-8 rounded-xl flex items-center justify-center shadow-md ${
                  msg.role === "user"
                    ? "bg-gradient-to-br from-blue-500 to-indigo-600 text-white"
                    : "bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/20"
                }`}
              >
                {msg.role === "user" ? (
                  <User className="h-4 w-4" />
                ) : (
                  <Sparkles className="h-4 w-4 text-indigo-400" />
                )}
              </div>

              {/* Message bubble */}
              <div
                className={`max-w-[82%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/10"
                    : "markdown-body border border-border/30 bg-card/80 backdrop-blur-sm shadow-sm"
                }`}
              >
                {msg.role === "assistant" ? (
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                ) : (
                  msg.content
                )}
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {loading && (
            <div className="flex gap-3 animate-fadeIn">
              <div className="shrink-0 w-8 h-8 rounded-xl flex items-center justify-center bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/20">
                <Sparkles className="h-4 w-4 text-indigo-400 animate-pulse" />
              </div>
              <div className="rounded-2xl border border-border/30 bg-card/80 backdrop-blur-sm px-4 py-3 shadow-sm">
                <div className="flex items-center gap-2 text-sm text-muted">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                  <span className="text-xs">Thinking...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* ── Input Area ─────────────────────────────────────────── */}
        <div className="mt-4 flex gap-2 items-end">
          <div className="relative flex-1">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              placeholder={
                hasCooldown
                  ? "⏳ Cooldown active — please wait or upgrade..."
                  : isExhausted
                  ? "🚫 Tokens exhausted — recharge to continue..."
                  : "Ask anything in any language..."
              }
              rows={1}
              disabled={isExhausted || hasCooldown}
              className={`max-h-32 min-h-[48px] w-full resize-none rounded-xl border bg-transparent px-4 py-3 pr-12 text-sm outline-none transition-all duration-200 ${
                isExhausted || hasCooldown
                  ? "border-red-500/30 text-muted cursor-not-allowed opacity-60"
                  : "border-border/40 focus:border-blue-500/60 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.1)]"
              }`}
            />
            {/* Char count hint */}
            {input.length > 0 && (
              <span className="absolute right-3 bottom-2 text-[9px] text-muted tabular-nums">
                ~{Math.max(25, Math.min(200, Math.floor(input.length / 4) + 10))} tokens
              </span>
            )}
          </div>
          <Button
            onClick={send}
            disabled={loading || !input.trim() || isExhausted || hasCooldown}
            className="h-[48px] w-[48px] rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 border-none text-white shadow-lg shadow-blue-500/20 flex items-center justify-center transition-all hover:scale-105 disabled:opacity-40 disabled:hover:scale-100"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </Card>

      {/* ── Token Exhausted Modal ────────────────────────────────── */}
      {showExhaustedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-fadeIn">
          <div className="bg-card/95 border border-border/60 rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden backdrop-blur-xl animate-scaleUp">
            {/* Header */}
            <div className="p-6 text-center border-b border-border/20">
              <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-red-500/20 to-amber-500/20 border border-red-500/20 flex items-center justify-center">
                <Coins className="h-7 w-7 text-amber-400" />
              </div>
              <h3 className="text-lg font-extrabold">
                {hasCooldown ? "Cooldown Active ⏳" : "Tokens Exhausted 🚫"}
              </h3>
              <p className="text-xs text-muted mt-2 leading-relaxed">
                {hasCooldown
                  ? "You've hit your token limit. Cooldown is active. Recharge tokens or upgrade your plan for instant access."
                  : "You've used all your study tokens. Recharge or upgrade to keep learning with AI."}
              </p>
            </div>

            {/* Actions */}
            <div className="p-5 space-y-2.5">
              <a href="/dashboard/settings">
                <button className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-sm font-bold border-none shadow-lg shadow-blue-500/15 transition-all hover:scale-[1.02]">
                  <Coins className="h-4 w-4" />
                  Recharge Tokens
                </button>
              </a>
              <a href="/dashboard/settings">
                <button className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-muted/20 hover:bg-muted/30 border border-border/30 text-sm font-semibold transition-all mt-2">
                  <ArrowUpRight className="h-4 w-4 text-amber-400" />
                  Upgrade Plan
                </button>
              </a>
              <button
                onClick={() => setShowExhaustedModal(false)}
                className="w-full py-2 text-xs text-muted hover:text-foreground transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
