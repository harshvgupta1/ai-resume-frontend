"use client";

import Link from "next/link";
import { FileText, Briefcase, TrendingUp, CheckCircle, ArrowUpRight, Plus } from "lucide-react";
import { ResumeScan } from "@/types";

const mockScans: ResumeScan[] = [
  {
    id: "scan-1",
    candidateName: "Harsh Vardhan Gupta",
    targetRole: "Full Stack Engineer (React/Node/GCP)",
    matchScore: 88,
    createdAt: "Today at 2:30 PM",
    fileName: "Harsh_FullStack_Resume.pdf",
  },
  {
    id: "scan-2",
    candidateName: "Harsh Vardhan Gupta",
    targetRole: "Senior Frontend Engineer (Next.js)",
    matchScore: 92,
    createdAt: "Yesterday",
    fileName: "Harsh_Frontend_Resume.pdf",
  },
  {
    id: "scan-3",
    candidateName: "Harsh Vardhan Gupta",
    targetRole: "AI Application Developer",
    matchScore: 78,
    createdAt: "Nov 4, 2026",
    fileName: "Harsh_AI_Resume.pdf",
  },
];

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-50">
            Candidate Analytics Dashboard
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Real-time breakdown of resume compatibility, ATS scores, and target roles.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/upload"
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>New Scan</span>
          </Link>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Total Scans</span>
            <div className="rounded-lg bg-indigo-50 p-2 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
              <FileText className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4 text-2xl font-black text-zinc-900 dark:text-zinc-50">24</div>
          <div className="mt-1 text-xs text-emerald-600 font-medium">+12% from last month</div>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Avg ATS Score</span>
            <div className="rounded-lg bg-blue-50 p-2 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4 text-2xl font-black text-zinc-900 dark:text-zinc-50">84.2%</div>
          <div className="mt-1 text-xs text-emerald-600 font-medium">Top 15% candidate percentile</div>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Active Applications</span>
            <div className="rounded-lg bg-violet-50 p-2 text-violet-600 dark:bg-violet-950 dark:text-violet-400">
              <Briefcase className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4 text-2xl font-black text-zinc-900 dark:text-zinc-50">8</div>
          <div className="mt-1 text-xs text-zinc-500">Tracked in Kanban board</div>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Interview Calls</span>
            <div className="rounded-lg bg-emerald-50 p-2 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
              <CheckCircle className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4 text-2xl font-black text-zinc-900 dark:text-zinc-50">3</div>
          <div className="mt-1 text-xs text-emerald-600 font-medium">37.5% conversion rate</div>
        </div>
      </div>

      {/* Recent Scans Table */}
      <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900 overflow-hidden">
        <div className="border-b border-zinc-200 dark:border-zinc-800 px-6 py-4 flex items-center justify-between">
          <h2 className="font-bold text-base text-zinc-900 dark:text-zinc-100">Recent Resume Analyses</h2>
          <Link href="/upload" className="text-xs font-semibold text-indigo-600 hover:text-indigo-500 flex items-center gap-1">
            <span>Analyze another</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="divide-y divide-zinc-200 dark:divide-zinc-800 overflow-x-auto">
          {mockScans.map((scan) => (
            <div key={scan.id} className="flex items-center justify-between px-6 py-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">{scan.targetRole}</h3>
                  <div className="flex items-center gap-2 text-xs text-zinc-400 mt-0.5">
                    <span>{scan.fileName}</span>
                    <span>•</span>
                    <span>{scan.createdAt}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-right">
                  <div className="text-sm font-black text-indigo-600 dark:text-indigo-400">{scan.matchScore}%</div>
                  <div className="text-[10px] text-zinc-400">Match score</div>
                </div>

                <Link
                  href="/upload"
                  className="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800 transition-colors"
                >
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
