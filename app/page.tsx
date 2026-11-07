import Link from "next/link";
import { Sparkles, ArrowRight, CheckCircle2, ShieldCheck, Zap, FileSpreadsheet, Bot, Cloud } from "lucide-react";

export default function Home() {
  return (
    <div className="relative overflow-hidden">
      {/* Background Glow */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-[500px] w-[1000px] -translate-x-1/2 bg-gradient-to-tr from-indigo-500/20 via-purple-500/10 to-transparent blur-3xl" />

      {/* Hero Section */}
      <section className="mx-auto max-w-7xl px-4 pt-20 pb-16 sm:px-6 lg:px-8 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50/60 px-4 py-1.5 text-xs font-semibold text-indigo-700 dark:border-indigo-900/60 dark:bg-indigo-950/40 dark:text-indigo-300 mb-8 backdrop-blur-sm">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Powered by Gemini 1.5 Flash & Google Cloud</span>
        </div>

        <h1 className="mx-auto max-w-4xl text-4xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl">
          Screen Resumes with{" "}
          <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
            AI Precision
          </span>{" "}
          in Seconds
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-lg text-zinc-600 dark:text-zinc-400">
          Upload any resume PDF and paste a job description. Our Gemini-powered AI engine parses the candidate's skills, computes an ATS match score, identifies missing requirements, and suggests resume fixes.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/upload"
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3.5 text-base font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:bg-indigo-500 hover:scale-105"
          >
            <span>Analyze a Resume Now</span>
            <ArrowRight className="h-4 w-4" />
          </Link>

          <Link
            href="/dashboard"
            className="flex items-center gap-2 rounded-xl border border-zinc-300 bg-white px-6 py-3.5 text-base font-semibold text-zinc-800 shadow-sm transition-all hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            <span>View Demo Dashboard</span>
          </Link>
        </div>

        {/* Feature Highlights Grid */}
        <div className="mx-auto mt-24 grid max-w-5xl grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 text-left">
          <div className="rounded-2xl border border-zinc-200/80 bg-white/70 p-6 shadow-sm backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/60">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400 mb-4">
              <Bot className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-100">Gemini AI Match Scoring</h3>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Calculates a multi-factor score: core tech stack match, soft skills, seniority alignment, and missing keywords.
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-200/80 bg-white/70 p-6 shadow-sm backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/60">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400 mb-4">
              <FileSpreadsheet className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-100">PDF Parsing & Extraction</h3>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Express backend parses unstructured PDF text, sanitizes input, and streams files directly to GCP Cloud Storage.
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-200/80 bg-white/70 p-6 shadow-sm backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/60">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-100 text-violet-600 dark:bg-violet-950 dark:text-violet-400 mb-4">
              <Cloud className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-100">GCP Native Stack</h3>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Designed for Cloud Run container deployment, Firestore document persistence, and Google Cloud Storage buckets.
            </p>
          </div>
        </div>

        {/* Stats Section */}
        <div className="mt-20 border-t border-zinc-200 dark:border-zinc-800 pt-12">
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            <div>
              <div className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">&lt; 3s</div>
              <div className="mt-1 text-sm text-zinc-500">Gemini Parsing Speed</div>
            </div>
            <div>
              <div className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">98%</div>
              <div className="mt-1 text-sm text-zinc-500">ATS Precision</div>
            </div>
            <div>
              <div className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">100%</div>
              <div className="mt-1 text-sm text-zinc-500">Serverless on GCP</div>
            </div>
            <div>
              <div className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">Free Tier</div>
              <div className="mt-1 text-sm text-zinc-500">Zero Idle Cost</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
