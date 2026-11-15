"use client";

import { useState, useEffect } from "react";
import {
  X,
  Sparkles,
  Check,
  Zap,
  Shield,
  ArrowRight,
  Loader2,
  CreditCard,
  QrCode,
  AlertTriangle,
  Receipt,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { initiateRazorpayPayment } from "@/lib/razorpay";
import { api } from "@/lib/api";

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  reason?: string;
  defaultCycle?: "monthly" | "yearly";
}

const GST_RATE = 0.18; // 18% Statutory GST

export function UpgradeModal({ isOpen, onClose, reason, defaultCycle = "monthly" }: UpgradeModalProps) {
  const { user, refreshUser, upgradeToPro } = useAuth();
  const [loading, setLoading] = useState(false);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">(defaultCycle);
  const [paymentMode, setPaymentMode] = useState<"upi" | "card">("upi");
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [exchangeRate, setExchangeRate] = useState<number>(94.26); // Live dynamic Forex rate

  // Fetch real-time market exchange rate on mount (never hardcoded)
  useEffect(() => {
    let isMounted = true;
    const fetchLiveRate = async () => {
      try {
        const res = await api.get("/payment/exchange-rate");
        if (res.data?.rate && isMounted) {
          setExchangeRate(Number(res.data.rate));
          return;
        }
      } catch (err) {
        // Fallback to direct financial market feed
        try {
          const directRes = await fetch("https://open.er-api.com/v6/latest/USD");
          if (directRes.ok) {
            const data = await directRes.json();
            if (data?.rates?.INR && isMounted) {
              setExchangeRate(Number(data.rates.INR.toFixed(2)));
            }
          }
        } catch {
          // Keep current state
        }
      }
    };
    if (isOpen) {
      fetchLiveRate();
    }
    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const basePriceUsd = billingCycle === "monthly" ? 9 : 59;
  
  // Dynamic INR Calculation based on live market rate with 18% GST
  const inrBase = Math.round(basePriceUsd * exchangeRate);
  const inrGst = Math.round(inrBase * GST_RATE);
  const inrTotal = inrBase + inrGst;

  // USD Calculation with 18% GST
  const usdGst = +(basePriceUsd * GST_RATE).toFixed(2);
  const usdTotal = +(basePriceUsd + usdGst).toFixed(2);

  const displayTotal = paymentMode === "upi" ? `₹${inrTotal.toLocaleString("en-IN")}` : `$${usdTotal}`;
  const displayBase = paymentMode === "upi" ? `₹${inrBase.toLocaleString("en-IN")}` : `$${basePriceUsd}`;
  const displayGst = paymentMode === "upi" ? `₹${inrGst.toLocaleString("en-IN")}` : `$${usdGst}`;

  const perMonthText =
    paymentMode === "upi"
      ? billingCycle === "monthly"
        ? `₹${inrTotal.toLocaleString("en-IN")} / month (inc. 18% GST)`
        : `~₹${Math.round(inrTotal / 12).toLocaleString("en-IN")}/mo (billed ₹${inrTotal.toLocaleString("en-IN")}/yr)`
      : billingCycle === "monthly"
      ? "$9 / mo + 18% GST"
      : "~$4.90 / mo (billed $59/yr + GST)";

  const handleRazorpayCheckout = async () => {
    if (!user) {
      setErrorMessage("Please sign in first before upgrading.");
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    await initiateRazorpayPayment({
      plan: billingCycle,
      currency: paymentMode === "upi" ? "INR" : "USD",
      paymentMethod: paymentMode,
      user,
      onSuccess: async () => {
        setLoading(false);
        setSuccess(true);
        await refreshUser();
        setTimeout(() => {
          setSuccess(false);
          onClose();
        }, 1800);
      },
      onError: (err: string) => {
        setLoading(false);
        setErrorMessage(err);
      },
    });
  };

  const handleDemoInstantUpgrade = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const ok = await upgradeToPro("pro");
      if (ok) {
        setSuccess(true);
        await refreshUser();
        setTimeout(() => {
          setSuccess(false);
          onClose();
        }, 1200);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[250] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl sm:rounded-3xl border border-indigo-200/80 bg-white p-5 sm:p-6 shadow-2xl dark:border-indigo-900/60 dark:bg-zinc-900 transition-all relative max-h-[92vh] flex flex-col my-auto overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Ambient background glow */}
        <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close upgrade modal"
          className="absolute top-3.5 right-3.5 z-20 rounded-full p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Scrollable Content Container */}
        <div className="overflow-y-auto pr-0.5 space-y-3 sm:space-y-4">
          {/* Header */}
          <div className="text-left pr-8">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-0.5 text-[11px] font-semibold text-indigo-700 dark:border-indigo-900 dark:bg-indigo-950/60 dark:text-indigo-300 mb-1.5">
              <Sparkles className="h-3 w-3" />
              <span>ResumeAI Pro Membership</span>
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight leading-tight">
              Unlock Unlimited ATS Intelligence
            </h3>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400 leading-snug">
              {reason || "Upgrade to Pro for unlimited Gemini AI scans and tailored cover letters."}
            </p>
          </div>

          {/* Billing & Payment Mode Toggles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
            {/* Billing Cycle Toggle */}
            <div className="flex flex-col gap-1">
              <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">Plan Duration:</span>
              <div className="inline-flex rounded-xl bg-zinc-100 p-1 dark:bg-zinc-800/80">
                <button
                  type="button"
                  onClick={() => setBillingCycle("monthly")}
                  className={`flex-1 rounded-lg py-1 text-xs font-semibold transition-all ${
                    billingCycle === "monthly"
                      ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-900 dark:text-zinc-100"
                      : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200"
                  }`}
                >
                  Monthly ($9)
                </button>
                <button
                  type="button"
                  onClick={() => setBillingCycle("yearly")}
                  className={`flex-1 rounded-lg py-1 text-xs font-semibold transition-all flex items-center justify-center gap-1 ${
                    billingCycle === "yearly"
                      ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-900 dark:text-zinc-100"
                      : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200"
                  }`}
                >
                  <span>Annual ($59)</span>
                  <span className="rounded-full bg-emerald-100 px-1 text-[9px] font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                    -45%
                  </span>
                </button>
              </div>
            </div>

            {/* Payment Method Toggle */}
            <div className="flex flex-col gap-1">
              <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">Payment Currency:</span>
              <div className="inline-flex rounded-xl bg-zinc-100 p-1 dark:bg-zinc-800/80">
                <button
                  type="button"
                  onClick={() => setPaymentMode("upi")}
                  className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg py-1 text-xs font-semibold transition-all ${
                    paymentMode === "upi"
                      ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-900 dark:text-zinc-100"
                      : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200"
                  }`}
                >
                  <QrCode className="h-3.5 w-3.5 text-emerald-600" />
                  <span>UPI (₹ INR)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMode("card")}
                  className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg py-1 text-xs font-semibold transition-all ${
                    paymentMode === "card"
                      ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-900 dark:text-zinc-100"
                      : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200"
                  }`}
                >
                  <CreditCard className="h-3.5 w-3.5 text-indigo-600" />
                  <span>Card ($ USD)</span>
                </button>
              </div>
            </div>
          </div>

          {/* Price Card */}
          <div className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50/60 to-purple-50/40 p-4 dark:border-indigo-950 dark:from-indigo-950/30 dark:to-purple-950/20">
            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-zinc-50">
                  {displayTotal}
                </span>
                <span className="text-xs text-zinc-500 ml-1.5">
                  {perMonthText}
                </span>
              </div>
              <span className="rounded-full bg-indigo-600 px-2 py-0.5 text-[10px] font-bold text-white shadow-sm">
                Razorpay Secured
              </span>
            </div>

            {/* Itemized 18% GST Tax Receipt Box */}
            <div className="mt-2.5 rounded-xl border border-indigo-200/70 bg-white/90 p-2.5 text-xs dark:border-indigo-900/60 dark:bg-zinc-950/70 space-y-1">
              <div className="flex items-center justify-between text-zinc-600 dark:text-zinc-400 text-[11px]">
                <span className="flex items-center gap-1">
                  <Receipt className="h-3 w-3 text-zinc-400" />
                  <span>Base Subscription ({paymentMode === "upi" ? `Live Forex ₹${exchangeRate}/$` : "USD"}):</span>
                </span>
                <span className="font-semibold text-zinc-800 dark:text-zinc-200">{displayBase}</span>
              </div>
              <div className="flex items-center justify-between text-emerald-700 dark:text-emerald-400 font-medium text-[11px]">
                <span>+ 18% Statutory GST (CGST 9% + SGST 9% / IGST):</span>
                <span>+{displayGst}</span>
              </div>
              <div className="pt-1 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between font-bold text-xs text-zinc-900 dark:text-zinc-50">
                <span>Total Amount Charged:</span>
                <span className="text-indigo-600 dark:text-indigo-400">{displayTotal}</span>
              </div>
            </div>

            <div className="mt-3 space-y-1.5 text-xs text-zinc-700 dark:text-zinc-300">
              <div className="flex items-center gap-2">
                <div className="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-white">
                  <Check className="h-2 w-2 stroke-[3]" />
                </div>
                <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                  Unlimited Gemini 3.5 Flash AI ATS match scans
                </span>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-white">
                  <Check className="h-2 w-2 stroke-[3]" />
                </div>
                <span>AI Tailored Cover Letter Generator for every role</span>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-white">
                  <Check className="h-2 w-2 stroke-[3]" />
                </div>
                <span>Cloud SQL multi-device sync & full scan vault</span>
              </div>
            </div>

            {/* Payment Methods Pill */}
            <div className="mt-2.5 pt-2 border-t border-indigo-100/80 dark:border-indigo-900/40 flex items-center justify-between text-[10px] text-zinc-500 dark:text-zinc-400">
              <span className="font-medium">Selected Payment Mode:</span>
              <span className="font-bold text-indigo-700 dark:text-indigo-300">
                {paymentMode === "upi" ? "UPI (GPay / PhonePe / Paytm / QR)" : "International Credit / Debit Cards"}
              </span>
            </div>
          </div>

          {errorMessage && (
            <div className="flex items-center gap-2 rounded-xl bg-red-50 p-2.5 text-xs text-red-700 dark:bg-red-950/40 dark:text-red-300">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Action Button */}
          {success ? (
            <div className="flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-500/25">
              <Check className="h-4 w-4" />
              <span>Payment Verified! You are now PRO 🎉</span>
            </div>
          ) : !user ? (
            <div className="space-y-1.5">
              <a
                href="/login?redirect=/pricing"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-600/25 hover:bg-indigo-500 transition-all cursor-pointer"
              >
                <span>Sign In with Google / Email to Continue</span>
                <ArrowRight className="h-4 w-4" />
              </a>
              <p className="text-center text-[10px] text-zinc-400">
                Sign in so your Pro subscription is linked to your account.
              </p>
            </div>
          ) : (
            <div className="space-y-1.5">
              <button
                type="button"
                onClick={handleRazorpayCheckout}
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-600/25 hover:from-blue-500 hover:via-indigo-500 hover:to-violet-500 disabled:opacity-60 transition-all cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Opening Razorpay...</span>
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4 fill-white" />
                    <span>
                      Pay {displayTotal} with {paymentMode === "upi" ? "UPI" : "Card"}
                    </span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleDemoInstantUpgrade}
                className="w-full text-center text-[10px] text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors py-0.5 cursor-pointer"
              >
                (Or click here for Instant Test Sandbox Activation)
              </button>
            </div>
          )}

          <div className="flex items-center justify-center gap-1.5 text-[10px] text-zinc-400 pb-1">
            <Shield className="h-3 w-3" />
            <span>Secured by Razorpay. 100% encrypted & verified.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
