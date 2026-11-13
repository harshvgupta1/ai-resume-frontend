"use client";

import { useState } from "react";
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
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { initiateRazorpayPayment } from "@/lib/razorpay";
import { User } from "@/types";

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  reason?: string;
}

export function UpgradeModal({ isOpen, onClose, reason }: UpgradeModalProps) {
  const { user, refreshUser, upgradeToPro } = useAuth();
  const [loading, setLoading] = useState(false);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentPrice = billingCycle === "monthly" ? "₹499" : "₹2,999";
  const perMonthPrice = billingCycle === "monthly" ? "₹499 / mo" : "~₹250 / mo (billed ₹2,999/yr)";

  const handleRazorpayCheckout = async () => {
    if (!user) {
      setErrorMessage("Please sign in first before upgrading.");
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    await initiateRazorpayPayment({
      plan: billingCycle,
      user,
      onSuccess: async (updatedUser: User) => {
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
      className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-3xl border border-indigo-200/80 bg-white p-6 sm:p-8 shadow-2xl dark:border-indigo-900/60 dark:bg-zinc-900 transition-all relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Ambient background glow */}
        <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 rounded-full p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="text-center sm:text-left">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 dark:border-indigo-900 dark:bg-indigo-950/60 dark:text-indigo-300 mb-3">
            <Sparkles className="h-3.5 w-3.5" />
            <span>ResumeAI Pro Membership</span>
          </div>

          <h3 className="text-2xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight">
            Unlock Unlimited ATS Intelligence
          </h3>
          <p className="mt-1.5 text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
            {reason || "You've reached your free limit. Upgrade to Pro for unlimited Gemini AI scans and tailored cover letters."}
          </p>
        </div>

        {/* Billing Toggle */}
        <div className="mt-5 flex items-center justify-center sm:justify-start gap-2">
          <div className="inline-flex rounded-xl bg-zinc-100 p-1 dark:bg-zinc-800/80">
            <button
              type="button"
              onClick={() => setBillingCycle("monthly")}
              className={`rounded-lg px-3.5 py-1 text-xs font-semibold transition-all ${
                billingCycle === "monthly"
                  ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-900 dark:text-zinc-100"
                  : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200"
              }`}
            >
              Monthly (₹499)
            </button>
            <button
              type="button"
              onClick={() => setBillingCycle("yearly")}
              className={`rounded-lg px-3.5 py-1 text-xs font-semibold transition-all flex items-center gap-1 ${
                billingCycle === "yearly"
                  ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-900 dark:text-zinc-100"
                  : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200"
              }`}
            >
              <span>Annual</span>
              <span className="rounded-full bg-emerald-100 px-1.5 py-0.2 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                Save 50%
              </span>
            </button>
          </div>
        </div>

        {/* Price Card */}
        <div className="my-5 rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50/60 to-purple-50/40 p-5 dark:border-indigo-950 dark:from-indigo-950/30 dark:to-purple-950/20">
          <div className="flex items-baseline justify-between">
            <div>
              <span className="text-3xl font-black text-zinc-900 dark:text-zinc-50">
                {currentPrice}
              </span>
              <span className="text-xs text-zinc-500 ml-1.5">
                {perMonthPrice}
              </span>
            </div>
            <span className="rounded-full bg-indigo-600 px-2.5 py-0.5 text-[11px] font-bold text-white shadow-sm">
              Razorpay Secured
            </span>
          </div>

          <div className="mt-4 space-y-2.5 text-xs text-zinc-700 dark:text-zinc-300">
            <div className="flex items-center gap-2">
              <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-white">
                <Check className="h-2.5 w-2.5 stroke-[3]" />
              </div>
              <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                Unlimited Gemini 3.5 AI ATS match scans
              </span>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-white">
                <Check className="h-2.5 w-2.5 stroke-[3]" />
              </div>
              <span>AI Tailored Cover Letter Generator for every role</span>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-white">
                <Check className="h-2.5 w-2.5 stroke-[3]" />
              </div>
              <span>Actionable ATS keywords & bullet point polish</span>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-white">
                <Check className="h-2.5 w-2.5 stroke-[3]" />
              </div>
              <span>Cloud SQL multi-device sync & full scan vault</span>
            </div>
          </div>

          {/* Payment Methods Pill */}
          <div className="mt-4 pt-3 border-t border-indigo-100/80 dark:border-indigo-900/40 flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400">
            <span className="font-medium">Supported Payment Modes:</span>
            <span className="font-bold text-indigo-700 dark:text-indigo-300">
              UPI • Cards • Netbanking
            </span>
          </div>
        </div>

        {errorMessage && (
          <div className="mb-4 flex items-center gap-2 rounded-xl bg-red-50 p-3 text-xs text-red-700 dark:bg-red-950/40 dark:text-red-300">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Action Button */}
        {success ? (
          <div className="flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-500/25">
            <Check className="h-5 w-5" />
            <span>Payment Verified! You are now PRO 🎉</span>
          </div>
        ) : !user ? (
          <div className="space-y-2">
            <a
              href="/login?redirect=/pricing"
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-indigo-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-600/25 hover:bg-indigo-500 transition-all cursor-pointer"
            >
              <span>Sign In with Google / Email to Continue</span>
              <ArrowRight className="h-4 w-4" />
            </a>
            <p className="text-center text-[11px] text-zinc-400">
              You must sign in so your Pro subscription is linked to your account.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <button
              type="button"
              onClick={handleRazorpayCheckout}
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-600/25 hover:from-blue-500 hover:via-indigo-500 hover:to-violet-500 disabled:opacity-60 transition-all cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Opening Razorpay...</span>
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4 fill-white" />
                  <span>Pay with UPI / Card ({currentPrice})</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleDemoInstantUpgrade}
              className="w-full text-center text-[11px] text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors py-1 cursor-pointer"
            >
              (Or click here for Instant Test Sandbox Activation)
            </button>
          </div>
        )}

        <div className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-zinc-400">
          <Shield className="h-3 w-3" />
          <span>Secured by Razorpay. 100% encrypted & verified.</span>
        </div>
      </div>
    </div>
  );
}