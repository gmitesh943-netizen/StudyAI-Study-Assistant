"use client";

import { useCallback, useEffect, useState } from "react";
import DashboardShell from "@/components/dashboard/DashboardShell";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { useAppAuth, useAppUser } from "@/hooks/useAppAuth";
import { api, type UserData } from "@/lib/api";
import {
  Bell, Shield, User, Zap, Star, Crown, Clock,
  Timer, Sparkles, ArrowUpRight, Infinity, RefreshCw,
  CreditCard, Check, Loader2, Coins, AlertCircle, Laptop
} from "lucide-react";

const TIER_CONFIG: Record<string, { label: string; icon: React.ReactNode; color: string; bg: string; tokenLimit: number | null; desc: string }> = {
  free: { label: "Free", icon: <Zap className="h-4 w-4" />, color: "text-zinc-400", bg: "from-zinc-500/10 to-zinc-500/5", tokenLimit: 1000, desc: "Basic AI features with limited usage" },
  pro: { label: "Pro", icon: <Star className="h-4 w-4" />, color: "text-blue-400", bg: "from-blue-500/10 to-blue-500/5", tokenLimit: 5000, desc: "Enhanced AI with extended token limits" },
  ultra: { label: "Ultra", icon: <Crown className="h-4 w-4" />, color: "text-amber-400", bg: "from-amber-500/10 to-amber-500/5", tokenLimit: null, desc: "Unlimited tokens & priority AI processing" },
};

export default function SettingsPage() {
  const { user } = useAppUser();
  const { getToken } = useAppAuth();
  const [profile, setProfile] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  // Payment Modal States
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentType, setPaymentType] = useState<"subscription" | "recharge">("subscription");
  const [paymentTarget, setPaymentTarget] = useState<"pro" | "ultra" | "recharge_1k" | "recharge_5k">("pro");
  const [paymentMethod, setPaymentMethod] = useState<"stripe" | "razorpay">("stripe");
  const [paymentStep, setPaymentStep] = useState<"details" | "processing" | "success">("details");
  
  // Input fields for payment
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [upiId, setUpiId] = useState("");
  const [paymentError, setPaymentError] = useState("");

  const loadProfile = useCallback(async () => {
    try {
      const token = await getToken();
      if (token) {
        const u = await api.me(token);
        setProfile(u);
      }
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, [getToken]);

  useEffect(() => { loadProfile(); }, [loadProfile]);

  const isAdmin = profile?.is_admin ?? user?.isAdmin ?? false;
  const tier = profile?.subscription_tier ?? user?.subscription_tier ?? "free";
  const tokensUsed = profile?.tokens_used ?? user?.tokens_used ?? 0;
  const tokenLimit = profile?.token_limit ?? user?.token_limit ?? 1000;
  const cooldownUntil = profile?.cooldown_until ?? user?.cooldown_until;
  const tierInfo = TIER_CONFIG[tier] ?? TIER_CONFIG.free;
  const tokenPct = tier === "ultra" ? 0 : Math.min(100, (tokensUsed / tokenLimit) * 100);
  const hasCooldown = cooldownUntil ? new Date(cooldownUntil) > new Date() : false;

  const cooldownRemaining = () => {
    if (!hasCooldown || !cooldownUntil) return "";
    const diff = new Date(cooldownUntil).getTime() - Date.now();
    const mins = Math.max(0, Math.floor(diff / 60000));
    return `${mins} min${mins !== 1 ? "s" : ""}`;
  };

  const handleOpenSubscriptionModal = (target: "pro" | "ultra") => {
    setPaymentType("subscription");
    setPaymentTarget(target);
    setPaymentStep("details");
    setPaymentError("");
    setShowPaymentModal(true);
  };

  const handleOpenRechargeModal = (target: "recharge_1k" | "recharge_5k") => {
    setPaymentType("recharge");
    setPaymentTarget(target);
    setPaymentStep("details");
    setPaymentError("");
    setShowPaymentModal(true);
  };

  const processPayment = async () => {
    // Basic validation
    if (paymentMethod === "stripe") {
      if (cardNumber.replace(/\s/g, "").length < 16) {
        setPaymentError("Please enter a valid 16-digit card number.");
        return;
      }
      if (cardExpiry.length < 5) {
        setPaymentError("Please enter card expiry date (MM/YY).");
        return;
      }
      if (cardCvv.length < 3) {
        setPaymentError("Please enter a valid CVV.");
        return;
      }
    } else {
      if (!upiId.includes("@")) {
        setPaymentError("Please enter a valid UPI ID (e.g., user@okhdfcbank).");
        return;
      }
    }

    setPaymentError("");
    setPaymentStep("processing");

    try {
      const token = await getToken();
      if (!token) throw new Error("Authentication failed. Please login again.");

      if (paymentType === "subscription") {
        const targetTier = paymentTarget === "pro" ? "pro" : "ultra";
        await api.checkout(targetTier, paymentMethod, cardNumber, cardCvv, token);
      } else {
        const tokens = paymentTarget === "recharge_1k" ? 1000 : 5000;
        const price = paymentTarget === "recharge_1k" ? 2.99 : 8.99;
        await api.recharge(tokens, price, paymentMethod, token);
      }

      // Success
      setPaymentStep("success");
      await loadProfile(); // Reload profile from backend to get live values!
    } catch (err) {
      setPaymentStep("details");
      setPaymentError(err instanceof Error ? err.message : "Payment processing failed. Please try again.");
    }
  };

  const getTargetAmount = () => {
    if (paymentTarget === "pro") return 9.99;
    if (paymentTarget === "ultra") return 29.99;
    if (paymentTarget === "recharge_1k") return 2.99;
    if (paymentTarget === "recharge_5k") return 8.99;
    return 0;
  };

  const getTargetLabel = () => {
    if (paymentTarget === "pro") return "Pro Subscription (Monthly)";
    if (paymentTarget === "ultra") return "Ultra Subscription (Monthly)";
    if (paymentTarget === "recharge_1k") return "1,000 AI Study Tokens";
    if (paymentTarget === "recharge_5k") return "5,000 AI Study Tokens";
    return "";
  };

  return (
    <DashboardShell title="Settings & Profile" subtitle="Manage your account, subscription, and AI usage.">
      <div className="max-w-3xl space-y-6">

        {/* ── Subscription & Token Card ────────────────────────────── */}
        <Card className={`relative overflow-hidden border-border/40 bg-gradient-to-br ${tierInfo.bg}`}>
          <div className="p-5">
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div>
                <div className={`flex items-center gap-2 ${tierInfo.color} mb-1`}>
                  {tierInfo.icon}
                  <span className="text-xs font-bold uppercase tracking-widest">{tierInfo.label} Plan</span>
                </div>
                <h3 className="text-xl font-bold mt-1">AI Token Usage</h3>
                <p className="text-xs text-muted mt-1">{tierInfo.desc}</p>
              </div>
              
              {/* Active options for non-admins */}
              {!isAdmin && (
                <div className="flex items-center gap-2">
                  {tier !== "ultra" && (
                    <Button 
                      onClick={() => handleOpenSubscriptionModal(tier === "free" ? "pro" : "ultra")}
                      variant="primary" 
                      className="text-xs flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 border-none shadow-lg shadow-indigo-500/20 text-white font-semibold transition-all hover:scale-[1.02]"
                    >
                      <ArrowUpRight className="h-3.5 w-3.5" />
                      Upgrade Plan
                    </Button>
                  )}
                  <Button 
                    onClick={() => handleOpenRechargeModal("recharge_1k")}
                    variant="outline" 
                    className="text-xs flex items-center gap-1.5 px-3 py-1.5 border-blue-500/30 hover:border-blue-500/60 text-blue-400 hover:bg-blue-500/10 font-semibold"
                  >
                    <Coins className="h-3.5 w-3.5 text-blue-400" />
                    Recharge Tokens
                  </Button>
                </div>
              )}

              {isAdmin && (
                <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-lg text-xs font-semibold">
                  <Shield className="h-3.5 w-3.5" />
                  Admin Account
                </div>
              )}
            </div>

            {/* Token Usage Bar */}
            <div className="mt-6 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold flex items-center gap-1.5">
                  {tokensUsed.toLocaleString()} 
                  <span className="text-muted font-normal">/</span> 
                  {tier === "ultra" ? <Infinity className="h-4 w-4 inline text-amber-400" /> : tokenLimit.toLocaleString()}
                  <span className="text-xs text-muted font-normal ml-1">tokens used</span>
                </span>
                <span className="text-xs text-muted">
                  {tier === "ultra" ? "Unlimited" : `${Math.max(0, 100 - tokenPct).toFixed(0)}% remaining`}
                </span>
              </div>
              {tier !== "ultra" && (
                <div className="w-full h-3 rounded-full bg-muted/20 overflow-hidden border border-border/10">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      tokenPct > 80 ? "bg-gradient-to-r from-red-500 to-red-400" :
                      tokenPct > 50 ? "bg-gradient-to-r from-amber-500 to-amber-400" :
                      "bg-gradient-to-r from-blue-500 to-indigo-500"
                    }`}
                    style={{ width: `${tokenPct}%` }}
                  />
                </div>
              )}
            </div>

            {/* Cooldown Warning */}
            {hasCooldown && (
              <div className="mt-4 flex items-center gap-3 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                <Clock className="h-4 w-4 flex-shrink-0 animate-pulse" />
                <div>
                  <p className="font-semibold">Cooldown Active</p>
                  <p className="text-xs text-red-400/80">AI limit reached. AI access will resume in {cooldownRemaining()}. Recharge tokens or upgrade to Pro or Ultra for immediate access.</p>
                </div>
              </div>
            )}

            {/* Token Breakdown */}
            <div className="mt-5 grid grid-cols-3 gap-3">
              {[
                { label: "Daily Limit", value: tier === "ultra" ? "Unlimited" : `${Math.floor(tokenLimit / 7)}`, icon: Timer },
                { label: "Cooldown status", value: hasCooldown ? "Active" : "None", icon: RefreshCw },
                { label: "Cycle reset", value: "Weekly", icon: Clock },
              ].map((item) => (
                <div key={item.label} className="p-3 rounded-xl bg-background/40 border border-border/30 backdrop-blur-sm">
                  <item.icon className="h-3.5 w-3.5 text-muted mb-1.5" />
                  <p className="text-base font-bold">{item.value}</p>
                  <p className="text-[9px] text-muted uppercase tracking-widest font-bold">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* ── Plan Comparison (Only shown for non-admins) ─────────────────── */}
        {!isAdmin && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-blue-400" />
              Available Premium Plans
            </h3>
            <div className="grid gap-3 sm:grid-cols-3">
              {(["free", "pro", "ultra"] as const).map((t) => {
                const info = TIER_CONFIG[t];
                const isCurrent = tier === t;
                const isPro = t === "pro";
                const isUltra = t === "ultra";

                return (
                  <Card
                    key={t}
                    className={`border-border/40 p-5 transition-all relative overflow-hidden flex flex-col justify-between h-full ${
                      isCurrent 
                        ? "ring-2 ring-blue-500/50 bg-blue-500/5" 
                        : "bg-card/50 hover:bg-card hover:border-border/80"
                    }`}
                  >
                    {isUltra && (
                      <div className="absolute top-0 right-0 bg-gradient-to-l from-amber-500 to-amber-600 text-white text-[9px] font-extrabold uppercase px-2.5 py-0.5 rounded-bl-lg tracking-widest shadow-md">
                        Best Value
                      </div>
                    )}
                    
                    <div>
                      <div className={`flex items-center gap-2 mb-2 ${info.color}`}>
                        {info.icon}
                        <span className="text-xs font-extrabold uppercase tracking-widest">{info.label}</span>
                        {isCurrent && <span className="ml-auto text-[9px] bg-blue-500/20 text-blue-400 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wide">Active</span>}
                      </div>
                      
                      <p className="text-3xl font-extrabold tracking-tight mt-2 flex items-baseline gap-1">
                        {t === "free" ? "Free" : t === "pro" ? "$9.99" : "$29.99"}
                        {t !== "free" && <span className="text-xs text-muted font-normal tracking-normal">/mo</span>}
                      </p>
                      
                      <p className="text-xs text-muted mt-2 leading-relaxed min-h-[32px]">
                        {info.desc}
                      </p>

                      <ul className="mt-4 space-y-2.5 text-xs text-muted border-t border-border/20 pt-4">
                        <li className="flex items-center gap-2">
                          <Zap className={`h-3.5 w-3.5 ${isCurrent ? "text-blue-400" : "text-muted"}`} />
                          <span className="font-medium text-foreground/90">
                            {info.tokenLimit ? `${info.tokenLimit.toLocaleString()} monthly tokens` : "Unlimited AI tokens"}
                          </span>
                        </li>
                        <li className="flex items-center gap-2">
                          <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
                          <span>{t === "free" ? "Basic AI Tutor" : t === "pro" ? "Advanced AI + Courses" : "Priority Support & GPT-4o"}</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <Clock className="h-3.5 w-3.5 text-emerald-400" />
                          <span>{t === "free" ? "1-hour Cooldown" : t === "pro" ? "15-min Cooldown" : "Zero Cooldown"}</span>
                        </li>
                      </ul>
                    </div>

                    <div className="mt-6">
                      {isCurrent ? (
                        <Button className="w-full text-xs font-semibold py-2 bg-muted/30 border-border/40 text-muted" disabled>
                          Your Active Plan
                        </Button>
                      ) : t === "free" ? (
                        <Button className="w-full text-xs font-semibold py-2" variant="outline" disabled>
                          Downgrade Unavailable
                        </Button>
                      ) : (
                        <Button 
                          onClick={() => handleOpenSubscriptionModal(t)}
                          className={`w-full text-xs font-bold py-2 ${
                            isUltra 
                              ? "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 border-none text-white shadow-lg shadow-amber-500/10" 
                              : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 border-none text-white shadow-lg shadow-blue-500/10"
                          }`}
                        >
                          Select Plan
                        </Button>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>

            {/* Token Recharge Quick buy */}
            <Card className="border-border/40 bg-card/30 p-5 mt-4">
              <div className="flex flex-wrap gap-4 items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm flex items-center gap-1.5">
                    <Coins className="h-4 w-4 text-blue-400" />
                    Need more study tokens?
                  </h4>
                  <p className="text-xs text-muted mt-1">Get an instant token recharge without waiting for the cooldown reset.</p>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleOpenRechargeModal("recharge_1k")}
                    className="px-4 py-2 bg-muted/40 hover:bg-muted/80 border border-border/40 hover:border-border/80 rounded-xl text-xs font-bold transition-all text-blue-400 flex items-center gap-1.5"
                  >
                    +1,000 Tokens <span className="text-muted font-normal">($2.99)</span>
                  </button>
                  <button 
                    onClick={() => handleOpenRechargeModal("recharge_5k")}
                    className="px-4 py-2 bg-gradient-to-r from-blue-600/20 to-indigo-600/20 hover:from-blue-600/30 hover:to-indigo-600/30 border border-blue-500/20 hover:border-blue-500/40 rounded-xl text-xs font-bold transition-all text-indigo-400 flex items-center gap-1.5"
                  >
                    +5,000 Tokens <span className="text-muted font-normal">($8.99)</span>
                  </button>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* ── Profile ─────────────────────────────────────────────── */}
        <Card>
          <div className="flex items-center gap-3 mb-4">
            <User className="h-5 w-5 text-blue-400" />
            <h3 className="font-bold">Profile</h3>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted">Username</span>
              <span className="font-medium">{loading ? "..." : profile?.username ?? user?.username ?? "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Email</span>
              <span className="font-medium">{loading ? "..." : profile?.email ?? user?.primaryEmailAddress?.emailAddress ?? "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Role</span>
              <span className="font-medium flex items-center gap-1.5">
                {profile?.is_admin ? <><Shield className="h-3.5 w-3.5 text-amber-400" /> Admin</> : "Student"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Joined</span>
              <span className="font-medium">{profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : "—"}</span>
            </div>
          </div>
        </Card>

        {/* ── Appearance ──────────────────────────────────────────── */}
        <Card>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Laptop className="h-5 w-5 text-blue-400" />
              <div>
                <h3 className="font-bold">Appearance</h3>
                <p className="text-sm text-muted">Toggle dark mode</p>
              </div>
            </div>
            <ThemeToggle />
          </div>
        </Card>

        {/* ── Notifications ───────────────────────────────────────── */}
        <Card>
          <div className="flex items-center gap-3 mb-4">
            <Bell className="h-5 w-5 text-blue-400" />
            <h3 className="font-bold">Notifications</h3>
          </div>
          <div className="space-y-3">
            {["Study reminders", "Quiz results", "Weekly progress report", "Token usage alerts"].map((label) => (
              <label key={label} className="flex items-center justify-between text-sm cursor-pointer">
                <span>{label}</span>
                <input type="checkbox" defaultChecked className="accent-blue-500 h-4 w-4 rounded border-border" />
              </label>
            ))}
          </div>
        </Card>

        <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 border-none font-semibold text-white px-5 py-2">Save Preferences</Button>
      </div>

      {/* ── FUTURISTIC MOCK CHECKOUT MODAL ────────────────────────── */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-fadeIn">
          <div className="bg-card/95 border border-border/80 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden relative backdrop-blur-xl">
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-border/30 flex items-center justify-between bg-muted/20">
              <div>
                <span className="text-[10px] bg-blue-500/20 text-blue-400 font-extrabold uppercase px-2.5 py-0.5 rounded-full tracking-wider">
                  Secured Checkout
                </span>
                <h3 className="text-base font-bold mt-1 text-foreground">
                  {paymentType === "subscription" ? "Upgrade Subscription" : "Recharge Tokens"}
                </h3>
              </div>
              <button 
                onClick={() => setShowPaymentModal(false)}
                className="text-muted hover:text-foreground text-xl font-medium transition-colors p-1"
              >
                &times;
              </button>
            </div>

            {/* DETAILS STEP */}
            {paymentStep === "details" && (
              <div className="p-6 space-y-4">
                <div className="p-3 bg-muted/40 rounded-xl border border-border/20">
                  <p className="text-xs text-muted">Purchase Item</p>
                  <p className="text-sm font-bold text-foreground mt-0.5">{getTargetLabel()}</p>
                  <p className="text-lg font-extrabold text-blue-400 mt-2">${getTargetAmount()}</p>
                </div>

                {/* Gateway Selector */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted uppercase tracking-wider">Select Payment Gateway</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => { setPaymentMethod("stripe"); setPaymentError(""); }}
                      className={`flex flex-col items-center justify-center py-3 rounded-xl border text-sm font-bold transition-all gap-1
                        ${paymentMethod === "stripe" 
                          ? "border-blue-500 bg-blue-500/10 text-blue-400 shadow-md shadow-blue-500/5" 
                          : "border-border/40 bg-muted/10 text-muted hover:text-foreground hover:bg-muted/20"}`}
                    >
                      <CreditCard className="h-4 w-4" />
                      Stripe
                    </button>
                    <button
                      onClick={() => { setPaymentMethod("razorpay"); setPaymentError(""); }}
                      className={`flex flex-col items-center justify-center py-3 rounded-xl border text-sm font-bold transition-all gap-1
                        ${paymentMethod === "razorpay" 
                          ? "border-blue-500 bg-blue-500/10 text-blue-400 shadow-md shadow-blue-500/5" 
                          : "border-border/40 bg-muted/10 text-muted hover:text-foreground hover:bg-muted/20"}`}
                    >
                      <Coins className="h-4 w-4" />
                      Razorpay
                    </button>
                  </div>
                </div>

                {/* Credit Card Details (Stripe) */}
                {paymentMethod === "stripe" && (
                  <div className="space-y-3 p-4 bg-muted/10 border border-border/20 rounded-xl">
                    <div className="flex items-center justify-between text-xs text-muted mb-1">
                      <span className="flex items-center gap-1"><CreditCard className="h-3.5 w-3.5 text-blue-400" /> Card Details</span>
                      <span>Visa/MasterCard Sandbox</span>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div>
                        <label className="text-muted block mb-0.5">Card Number</label>
                        <input
                          type="text"
                          placeholder="4242 4242 4242 4242"
                          maxLength={19}
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value.replace(/[^0-9 ]/g, ""))}
                          className="w-full bg-background border border-border/40 focus:border-blue-500/60 rounded-lg px-3 py-2 text-sm focus:outline-none"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-muted block mb-0.5">Expiry Date</label>
                          <input
                            type="text"
                            placeholder="MM/YY"
                            maxLength={5}
                            value={cardExpiry}
                            onChange={(e) => setCardExpiry(e.target.value)}
                            className="w-full bg-background border border-border/40 focus:border-blue-500/60 rounded-lg px-3 py-2 text-sm focus:outline-none text-center"
                          />
                        </div>
                        <div>
                          <label className="text-muted block mb-0.5">CVV</label>
                          <input
                            type="password"
                            placeholder="•••"
                            maxLength={3}
                            value={cardCvv}
                            onChange={(e) => setCardCvv(e.target.value.replace(/[^0-9]/g, ""))}
                            className="w-full bg-background border border-border/40 focus:border-blue-500/60 rounded-lg px-3 py-2 text-sm focus:outline-none text-center"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-muted block mb-0.5">Cardholder Name</label>
                        <input
                          type="text"
                          placeholder="Your Name"
                          value={cardName}
                          onChange={(e) => setCardName(e.target.value)}
                          className="w-full bg-background border border-border/40 focus:border-blue-500/60 rounded-lg px-3 py-2 text-sm focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* UPI Details (Razorpay) */}
                {paymentMethod === "razorpay" && (
                  <div className="space-y-3 p-4 bg-muted/10 border border-border/20 rounded-xl">
                    <div className="flex items-center justify-between text-xs text-muted mb-1">
                      <span>UPI Quick Pay</span>
                      <span>Razorpay Secure</span>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div>
                        <label className="text-muted block mb-0.5">UPI ID (VPA)</label>
                        <input
                          type="text"
                          placeholder="username@upi"
                          value={upiId}
                          onChange={(e) => setUpiId(e.target.value)}
                          className="w-full bg-background border border-border/40 focus:border-blue-500/60 rounded-lg px-3 py-2 text-sm focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {paymentError && (
                  <p className="text-xs text-red-400 font-semibold flex items-center gap-1 p-2.5 rounded-lg bg-red-500/5 border border-red-500/10">
                    <AlertCircle className="h-4 w-4" /> {paymentError}
                  </p>
                )}

                <div className="pt-2">
                  <Button
                    onClick={processPayment}
                    className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold border-none rounded-xl transition-all flex items-center justify-center gap-2"
                  >
                    Pay ${getTargetAmount()} Securely
                  </Button>
                </div>
              </div>
            )}

            {/* PROCESSING STEP */}
            {paymentStep === "processing" && (
              <div className="p-10 flex flex-col items-center justify-center text-center space-y-4">
                <Loader2 className="h-10 w-10 text-blue-500 animate-spin" />
                <div>
                  <h4 className="font-bold text-foreground">Authorizing Transaction</h4>
                  <p className="text-xs text-muted mt-1">Connecting to payment gateway. Please do not refresh or close this window.</p>
                </div>
              </div>
            )}

            {/* SUCCESS STEP */}
            {paymentStep === "success" && (
              <div className="p-8 flex flex-col items-center justify-center text-center space-y-4 animate-scaleUp">
                <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-full border border-emerald-500/30 flex items-center justify-center shadow-lg shadow-emerald-500/5">
                  <Check className="h-6 w-6 stroke-[3px]" />
                </div>
                <div>
                  <h4 className="font-extrabold text-foreground text-lg">Payment Successful!</h4>
                  <p className="text-xs text-muted mt-1">Your account balance and subscription tier have been updated immediately.</p>
                </div>
                <div className="pt-4 w-full">
                  <Button
                    onClick={() => setShowPaymentModal(false)}
                    className="w-full bg-muted/40 hover:bg-muted border-border/40 text-foreground py-2 font-bold"
                  >
                    Continue Study
                  </Button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}
    </DashboardShell>
  );
}
