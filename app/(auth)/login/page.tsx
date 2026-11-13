"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { GoogleLogin, CredentialResponse } from "@react-oauth/google";
import { Sparkles, ArrowRight, Mail, Lock, AlertCircle, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = searchParams.get("redirect") || "/dashboard";

  const { loginWithGoogleCredential, loginWithEmail, user } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // If already logged in, redirect
  useEffect(() => {
    if (user) {
      router.push(redirectTarget);
    }
  }, [user, router, redirectTarget]);

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    if (!credentialResponse.credential) {
      setError("Google sign-in did not return a valid credential.");
      return;
    }

    setLoading(true);
    setError(null);

    const success = await loginWithGoogleCredential(credentialResponse.credential);
    setLoading(false);

    if (success) {
      router.push(redirectTarget);
    } else {
      setError("Failed to verify Google token with backend API.");
    }
  };

  const handleGoogleError = () => {
    setError("Google authentication was closed or encountered an error.");
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError("Please enter your email address.");
      return;
    }

    setLoading(true);
    setError(null);

    const success = await loginWithEmail(email);
    setLoading(false);

    if (success) {
      router.push(redirectTarget);
    } else {
      setError("Failed to sign in. Please try again.");
    }
  };

  return (
    <div className="w-full max-w-md space-y-4 rounded-3xl border border-zinc-200 bg-white p-6 sm:p-7 shadow-xl shadow-zinc-950/5 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="text-center">
        <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-lg shadow-indigo-500/25">
          <Sparkles className="h-5 w-5" />
        </div>
        <h2 className="mt-2.5 text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
          Welcome to ResumeAI
        </h2>
        <p className="mt-1 text-xs text-zinc-500">
          {redirectTarget.includes("upload")
            ? "Sign in to claim your 3 free AI resume scans"
            : redirectTarget.includes("pricing")
            ? "Sign in to unlock ResumeAI Pro"
            : "Sign in to your candidate account"}
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl bg-red-50 p-2.5 text-xs text-red-700 dark:bg-red-950/40 dark:text-red-300">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="space-y-3">
        {/* Official Google SSO Button */}
        <div className="flex justify-center">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            useOneTap
            theme="outline"
            size="large"
            shape="pill"
            text="continue_with"
          />
        </div>

        <div className="relative flex items-center justify-center py-1">
          <div className="w-full border-t border-zinc-200 dark:border-zinc-800" />
          <span className="absolute bg-white px-3 text-[11px] font-bold uppercase tracking-widest text-zinc-400 dark:bg-zinc-900">
            OR
          </span>
        </div>
      </div>

      {/* Regular Email Form */}
      <form onSubmit={handleEmailSubmit} className="space-y-3">
        <div>
          <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
            Email Address
          </label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 py-2.5 pl-9 pr-3 text-sm focus:border-indigo-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
            Password
          </label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 py-2.5 pl-9 pr-3 text-sm focus:border-indigo-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-900 py-3 text-xs font-semibold text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 transition-colors disabled:opacity-50 cursor-pointer"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <span>Continue with Email</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </>
          )}
        </button>
      </form>

      <p className="text-center text-xs text-zinc-500">
        Don&apos;t have an account?{" "}
        <Link
          href={`/signup${redirectTarget !== "/dashboard" ? `?redirect=${encodeURIComponent(redirectTarget)}` : ""}`}
          className="font-semibold text-indigo-600 hover:text-indigo-500"
        >
          Sign up for free
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="flex min-h-[calc(100vh-5rem)] items-center justify-center px-4 py-6 sm:px-6 lg:px-8">
      <Suspense fallback={<div className="text-sm text-zinc-500">Loading sign in...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
