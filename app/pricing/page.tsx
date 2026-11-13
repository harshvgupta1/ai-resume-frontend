"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Sparkles, Zap, Shield, ArrowRight, HelpCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { UpgradeModal } from "@/components/UpgradeModal";

export default function PricingPage() {
  const { user } = useAuth();
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [showModal, setShowModal] = useState(false);

  const isPro = user?.plan === "pro";

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
      {/* Page Header */}
      <div className="text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50 px-3.5 py-1 text-xs font-semibold text-indigo-700 dark:border-indigo-900 dark:bg-indigo-950/60 dark:text-indigo-300 mb-4">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Simple, Transparent Pricing</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight">
          Invest in Your Next Career Move
        </h1>
        <p className="mt-4 text-base sm:text-lg text-zinc-600 dark:text-zinc-400">
          Land more interviews by matching your resume directly to ATS systems with Gemini AI intelligence.
        </p>

        {/* Billing Toggle */}
        <div className="mt-8 flex items-center justify-center gap-3">
          <div className="inline-flex rounded-xl bg-zinc-200/60 p-1 dark:bg-zinc-800">
            <button
              type="button"
              onClick={() => setBillingCycle("monthly")}
              className={`rounded-lg px-4 py-1.5 text-xs font-bold transition-all ${
                billingCycle === "monthly"
                  ? "bg-white text-zinc-900 shadow dark:bg-zinc-900 dark:text-zinc-100"
                  : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200"
              }`}
            >
              Monthly Billing
            </button>
            <button
              type="button"
              onClick={() => setBillingCycle("yearly")}
              className={`rounded-lg px-4 py-1.5 text-xs font-bold transition-all flex items-center gap-1.5 ${
                billingCycle === "yearly"
                  ? "bg-white text-zinc-900 shadow dark:bg-zinc-900 dark:text-zinc-100"
                  : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200"
              }`}
            >
              <span>Annual Billing</span>
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-black text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                Save 25%
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-2 max-w-4xl mx-auto">
        {/* Free Plan */}
        <div className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Starter Free</h3>
              <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                Free Forever
              </span>
            </div>
            <p className="mt-2 text-xs text-zinc-500">
              For candidates exploring ATS keyword alignment for their first job applications.
            </p>

            <div className="mt-6 flex items-baseline">
              <span className="text-4xl font-black text-zinc-900 dark:text-zinc-100">$0</span>
              <span className="text-xs text-zinc-400 ml-1">/ forever</span>
            </div>

            <ul className="mt-8 space-y-3.5 text-xs text-zinc-600 dark:text-zinc-400">
              <li className="flex items-center gap-3">
                <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                <span><strong>3 Free AI Resume Scans</strong> total</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                <span>Overall ATS Match Score (0–100%)</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                <span>Missing keywords & matched skills list</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                <span>Kanban Job Application Tracker</span>
              </li>
              <li className="flex items-center gap-3 text-zinc-400 line-through">
                <span className="h-4 w-4 flex items-center justify-center font-bold">✕</span>
                <span>Unlimited scans</span>
              </li>
              <li className="flex items-center gap-3 text-zinc-400 line-through">
                <span className="h-4 w-4 flex items-center justify-center font-bold">✕</span>
                <span>AI Tailored Cover Letter Generator</span>
              </li>
            </ul>
          </div>

          <div className="mt-8">
            <Link
              href="/upload"
              className="flex w-full items-center justify-center rounded-xl border border-zinc-200 bg-zinc-50 py-3 text-xs font-bold text-zinc-800 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700 transition-colors"
            >
              {user && !isPro ? "Current Plan" : "Get Started Free"}
            </Link>
          </div>
        </div>

        {/* Pro Plan */}
        <div className="rounded-3xl border-2 border-indigo-600 bg-gradient-to-b from-white via-indigo-50/20 to-purple-50/20 p-8 shadow-xl dark:bg-zinc-900 dark:from-zinc-900 dark:via-indigo-950/20 dark:to-purple-950/10 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-indigo-600 text-white text-[10px] font-black tracking-wider uppercase px-4 py-1 rounded-bl-xl shadow-sm">
            Recommended
          </div>

          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <span>ResumeAI Pro</span>
                <Sparkles className="h-4 w-4 text-indigo-600" />
              </h3>
            </div>
            <p className="mt-2 text-xs text-zinc-500">
              For active job hunters applying to competitive roles who need every interview advantage.
            </p>

            <div className="mt-6 flex items-baseline">
              <span className="text-4xl font-black text-indigo-600 dark:text-indigo-400">
                {billingCycle === "monthly" ? "₹499" : "₹2,999"}
              </span>
              <span className="text-xs text-zinc-400 ml-1.5">
                {billingCycle === "monthly" ? "/ month" : "/ year (~₹250/mo)"}
              </span>
            </div>

            <div className="mt-3 flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
              <span>UPI (Google Pay, PhonePe, Paytm) • Cards • Netbanking</span>
            </div>

            <ul className="mt-8 space-y-3.5 text-xs text-zinc-700 dark:text-zinc-300">
              <li className="flex items-center gap-3 font-semibold">
                <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-white">
                  <Check className="h-2.5 w-2.5 stroke-[3]" />
                </div>
                <span><strong>Unlimited Gemini 3.5 Flash AI Scans</strong></span>
              </li>
              <li className="flex items-center gap-3">
                <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-white">
                  <Check className="h-2.5 w-2.5 stroke-[3]" />
                </div>
                <span><strong>AI Tailored Cover Letter Generator</strong> for every role</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-white">
                  <Check className="h-2.5 w-2.5 stroke-[3]" />
                </div>
                <span>Targeted CAR (Context-Action-Result) bullet point rewrites</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-white">
                  <Check className="h-2.5 w-2.5 stroke-[3]" />
                </div>
                <span>Cloud SQL Multi-device sync & full scan vault</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-white">
                  <Check className="h-2.5 w-2.5 stroke-[3]" />
                </div>
                <span>Priority queue processing & zero waiting</span>
              </li>
            </ul>
          </div>

          <div className="mt-8">
            {isPro ? (
              <div className="flex w-full items-center justify-center rounded-xl bg-emerald-600 py-3 text-xs font-bold text-white shadow-md shadow-emerald-600/20">
                <Check className="h-4 w-4 mr-1.5" />
                <span>You are on Pro</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowModal(true)}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3.5 text-xs font-bold text-white shadow-md shadow-indigo-600/25 hover:bg-indigo-500 transition-all cursor-pointer"
              >
                <Zap className="h-4 w-4 fill-white" />
                <span>Upgrade to Pro Now</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="mt-20 max-w-3xl mx-auto">
        <h3 className="text-xl font-bold text-center text-zinc-900 dark:text-zinc-100 mb-8">
          Frequently Asked Questions
        </h3>

        <div className="space-y-4">
          <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
            <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
              Why do I need to sign in for free scans?
            </h4>
            <p className="mt-1.5 text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Signing in connects your scans to your profile and lets us accurately credit your 3 free scans. You can access your scans from any device without losing your progress.
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
            <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
              Can I cancel my Pro subscription anytime?
            </h4>
            <p className="mt-1.5 text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Yes, absolutely. There are no long-term contracts. You can cancel with a single click and retain Pro benefits until the end of your billing cycle.
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
            <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
              Which AI model powers the ATS scanner?
            </h4>
            <p className="mt-1.5 text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              We use Google's official Gemini 3.5 Flash model, hosted on high-throughput Google Cloud infrastructure for sub-second, intelligent candidate matching.
            </p>
          </div>
        </div>
      </div>

      <UpgradeModal isOpen={showModal} onClose={() => setShowModal(false)} />
    </div>
  );
}