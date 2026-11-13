"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  FileText,
  Briefcase,
  TrendingUp,
  CheckCircle,
  ArrowUpRight,
  Plus,
  X,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Trash2,
  Cloud,
} from "lucide-react";
import { ResumeScan, JobApplication } from "@/types";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const [scans, setScans] = useState<ResumeScan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedScan, setSelectedScan] = useState<ResumeScan | null>(null);
  const [appStats, setAppStats] = useState({ active: 0, interviews: 0 });

  useEffect(() => {
    if (authLoading) return;

    if (user) {
      // Authenticated user: fetch saved analyses from Cloud SQL backend
      api
        .get("/ai/history")
        .then((res) => {
          if (Array.isArray(res.data)) {
            setScans(res.data);
          }
        })
        .catch((err) => {
          console.warn("Could not fetch remote scans from /api/ai/history:", err?.message);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      // Unauthenticated / guest user: load strictly from localStorage
      try {
        const stored = localStorage.getItem("resume_scans");
        if (stored) {
          const parsed = JSON.parse(stored);
          setScans(Array.isArray(parsed) ? parsed : []);
        } else {
          setScans([]);
        }
      } catch (e) {
        console.warn("Error reading local scans", e);
        setScans([]);
      }
      setLoading(false);
    }

    // Read stored job tracker applications to compute active & interviews stats
    try {
      const storedJobs = localStorage.getItem("job_applications");
      if (storedJobs) {
        const jobs: JobApplication[] = JSON.parse(storedJobs);
        const active = jobs.filter((j) => j.status === "applied" || j.status === "interviewing").length;
        const interviews = jobs.filter((j) => j.status === "interviewing" || j.status === "offered").length;
        setAppStats({ active, interviews });
      }
    } catch (e) {}
  }, [user, authLoading]);

  const handleDeleteScan = async (scanId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this scan?")) return;

    // Remove from UI state
    setScans((prev) => prev.filter((s) => s.id !== scanId));

    // Remove from localStorage
    try {
      const stored = localStorage.getItem("resume_scans");
      if (stored) {
        const parsed: ResumeScan[] = JSON.parse(stored);
        localStorage.setItem("resume_scans", JSON.stringify(parsed.filter((s) => s.id !== scanId)));
      }
    } catch (err) {}

    // If authenticated, also delete from MySQL
    if (user) {
      try {
        await api.delete(`/ai/history/${scanId}`);
      } catch (err) {
        console.warn("Could not delete from backend:", err);
      }
    }
  };

  // Close details modal on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelectedScan(null);
      }
    };
    if (selectedScan) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedScan]);

  const totalScans = scans.length;
  const avgAtsScore =
    scans.length > 0
      ? (scans.reduce((acc, s) => acc + s.matchScore, 0) / scans.length).toFixed(1)
      : "0";

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-50">
            Candidate Analytics Dashboard
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Real-time breakdown of stored resume compatibility, ATS scores, and target roles.
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
          <div className="mt-4 text-2xl font-black text-zinc-900 dark:text-zinc-50">{totalScans}</div>
          <div className="mt-1 flex items-center gap-1 text-xs text-emerald-600 font-medium">
            <Cloud className="h-3 w-3" />
            <span>Cloud SQL Synced</span>
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Avg ATS Score</span>
            <div className="rounded-lg bg-blue-50 p-2 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4 text-2xl font-black text-zinc-900 dark:text-zinc-50">{avgAtsScore}%</div>
          <div className="mt-1 text-xs text-emerald-600 font-medium">Computed across stored scans</div>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Active Applications</span>
            <div className="rounded-lg bg-violet-50 p-2 text-violet-600 dark:bg-violet-950 dark:text-violet-400">
              <Briefcase className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4 text-2xl font-black text-zinc-900 dark:text-zinc-50">{appStats.active}</div>
          <div className="mt-1 text-xs text-zinc-500">Tracked in Kanban board</div>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Interview Calls</span>
            <div className="rounded-lg bg-emerald-50 p-2 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
              <CheckCircle className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4 text-2xl font-black text-zinc-900 dark:text-zinc-50">{appStats.interviews}</div>
          <div className="mt-1 text-xs text-emerald-600 font-medium">Pipeline active stages</div>
        </div>
      </div>

      {/* Recent Scans Table */}
      <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900 overflow-hidden">
        <div className="border-b border-zinc-200 dark:border-zinc-800 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-base text-zinc-900 dark:text-zinc-100">All Resume Analyses</h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              {scans.length} scan{scans.length !== 1 ? "s" : ""} saved in your vault
            </p>
          </div>
          <Link href="/upload" className="text-xs font-semibold text-indigo-600 hover:text-indigo-500 flex items-center gap-1">
            <span>Analyze another</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="flex items-center justify-center p-12 text-zinc-400 gap-2">
            <Loader2 className="h-5 w-5 animate-spin text-indigo-600" />
            <span className="text-sm">Loading stored analyses...</span>
          </div>
        ) : scans.length === 0 ? (
          <div className="p-12 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-400 mb-3">
              <FileText className="h-6 w-6" />
            </div>
            <h3 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">No stored resume scans yet</h3>
            <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
              Run your first resume match scan to see real-time ATS compatibility scores and personalized recommendations.
            </p>
            <Link
              href="/upload"
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-500 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Scan Resume Now</span>
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-zinc-200 dark:divide-zinc-800 overflow-x-auto">
            {scans.map((scan) => (
              <div key={scan.id} className="flex items-center justify-between px-6 py-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">{scan.targetRole}</h3>
                    <div className="flex items-center gap-2 text-xs text-zinc-400 mt-0.5">
                      <span className="font-medium text-zinc-600 dark:text-zinc-300">{scan.fileName}</span>
                      <span>•</span>
                      <span>{scan.createdAt}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="text-right">
                    <div className="text-sm font-black text-indigo-600 dark:text-indigo-400">{scan.matchScore}%</div>
                    <div className="text-[10px] text-zinc-400">{scan.verdict || "Match score"}</div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedScan(scan)}
                    className="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                  >
                    View Details
                  </button>

                  <button
                    type="button"
                    onClick={(e) => handleDeleteScan(scan.id, e)}
                    title="Delete this scan"
                    className="rounded-lg p-1.5 text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 dark:hover:text-red-400 transition-colors cursor-pointer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Details Modal for Stored Scan */}
      {selectedScan && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150"
          onClick={() => setSelectedScan(null)}
        >
          <div
            className="w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-3xl border border-zinc-200 bg-white p-6 sm:p-8 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900 transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800">
              <div>
                <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 mb-2">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Stored ATS Analysis</span>
                </div>
                <h3 className="text-xl font-extrabold text-zinc-900 dark:text-zinc-50">
                  {selectedScan.targetRole}
                </h3>
                <p className="text-xs text-zinc-500 mt-1">
                  File: <span className="font-semibold text-zinc-700 dark:text-zinc-300">{selectedScan.fileName}</span> • Scanned: {selectedScan.createdAt}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedScan(null)}
                className="rounded-xl p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Score Banner */}
            <div className="my-6 rounded-2xl border border-zinc-200 bg-zinc-50 p-5 dark:border-zinc-800 dark:bg-zinc-950/50 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">ATS Match Score</span>
                <div className="text-3xl font-black text-indigo-600 dark:text-indigo-400 mt-0.5">
                  {selectedScan.matchScore}%
                </div>
              </div>
              <span
                className={`rounded-full px-3.5 py-1 text-xs font-bold ${
                  selectedScan.matchScore >= 80
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                    : selectedScan.matchScore >= 60
                    ? "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
                    : "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300"
                }`}
              >
                {selectedScan.verdict || (selectedScan.matchScore >= 80 ? "Strong Match" : "Moderate Match")}
              </span>
            </div>

            {/* Matching & Missing Skills */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div className="rounded-2xl border border-emerald-200/60 bg-emerald-50/30 p-4 dark:border-emerald-900/40 dark:bg-emerald-950/20">
                <h4 className="flex items-center gap-1.5 font-bold text-xs text-emerald-800 dark:text-emerald-300 mb-2.5">
                  <CheckCircle2 className="h-4 w-4" />
                  Matching Skills ({selectedScan.matchingSkills?.length || 0})
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {selectedScan.matchingSkills && selectedScan.matchingSkills.length > 0 ? (
                    selectedScan.matchingSkills.map((skill, idx) => (
                      <span key={idx} className="rounded-lg bg-emerald-100/70 dark:bg-emerald-900/40 px-2.5 py-1 text-[11px] font-medium text-emerald-800 dark:text-emerald-200">
                        {skill}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-zinc-400 italic">No specific skills listed</span>
                  )}
                </div>
              </div>

              <div className="rounded-2xl border border-amber-200/60 bg-amber-50/30 p-4 dark:border-amber-900/40 dark:bg-amber-950/20">
                <h4 className="flex items-center gap-1.5 font-bold text-xs text-amber-800 dark:text-amber-300 mb-2.5">
                  <AlertTriangle className="h-4 w-4" />
                  Missing Keywords ({selectedScan.missingSkills?.length || 0})
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {selectedScan.missingSkills && selectedScan.missingSkills.length > 0 ? (
                    selectedScan.missingSkills.map((skill, idx) => (
                      <span key={idx} className="rounded-lg bg-amber-100/70 dark:bg-amber-900/40 px-2.5 py-1 text-[11px] font-medium text-amber-800 dark:text-amber-200">
                        {skill}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-zinc-400 italic">No missing skills detected</span>
                  )}
                </div>
              </div>
            </div>

            {/* Recommended Edits */}
            {selectedScan.suggestedResumeEdits && selectedScan.suggestedResumeEdits.length > 0 && (
              <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950/60 mb-6">
                <h4 className="font-bold text-xs uppercase tracking-wider text-zinc-500 mb-2.5">
                  Recommended Edits for ATS Optimization
                </h4>
                <div className="space-y-2">
                  {selectedScan.suggestedResumeEdits.map((edit, idx) => (
                    <div key={idx} className="rounded-xl border border-indigo-100 bg-indigo-50/40 p-3 text-xs text-zinc-800 dark:border-indigo-950 dark:bg-indigo-950/30 dark:text-zinc-300">
                      {edit}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-zinc-200 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => setSelectedScan(null)}
                className="rounded-xl border border-zinc-200 bg-white px-5 py-2.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-200 transition-colors"
              >
                Close
              </button>
              <Link
                href="/upload"
                className="rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-indigo-500 shadow-md shadow-indigo-600/20 transition-all flex items-center gap-1.5"
              >
                <span>Analyze New Resume</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
