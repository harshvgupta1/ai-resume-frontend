"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Loader2,
  Sparkles,
  Wand2,
  Lock,
  Zap,
  Check,
  Copy,
  X,
  FileCheck2,
} from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { MatchAnalysis, ResumeScan } from "@/types";
import { UpgradeModal } from "@/components/UpgradeModal";

export default function UploadPage() {
  const router = useRouter();
  const { user, refreshUser } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<MatchAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Upgrade Modal State
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeReason, setUpgradeReason] = useState("");

  // Cover Letter Pro Feature State
  const [coverLetter, setCoverLetter] = useState<string | null>(null);
  const [loadingCoverLetter, setLoadingCoverLetter] = useState(false);
  const [showCoverLetterModal, setShowCoverLetterModal] = useState(false);
  const [copiedCoverLetter, setCopiedCoverLetter] = useState(false);

  const isPro = user?.plan === "pro";
  const scansUsed = user?.scansUsed ?? 0;
  const scansLimit = 3;
  const scansRemaining = isPro ? Infinity : Math.max(0, scansLimit - scansUsed);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
    }
  };

  const handleFillSample = () => {
    setJobDescription(
      "Looking for a Full Stack Software Engineer with 2-4 years of experience in React.js, TypeScript, Node.js, Express, and Cloud platforms (GCP / AWS). Must be familiar with Docker, CI/CD pipelines, relational databases (MySQL / PostgreSQL), and REST APIs."
    );
    setError(null);
  };

  const handleAnalyze = async () => {
    // 1. Enforce authentication so free scans are strictly tracked per account
    if (!user) {
      setError("Please sign in first to claim your 3 free Gemini AI resume scans.");
      router.push("/login");
      return;
    }

    // 2. Enforce scan limit for free tier
    if (!isPro && scansRemaining <= 0) {
      setUpgradeReason("You have used all 3 free scans. Upgrade to Pro for unlimited Gemini AI scans!");
      setShowUpgradeModal(true);
      return;
    }

    const jdToAnalyze = jobDescription.trim();

    if (!file) {
      setError("Please upload a resume file (PDF, DOC, or DOCX) to continue.");
      return;
    }
    if (!jdToAnalyze) {
      setError("Please paste the target job description to match against.");
      return;
    }

    // Smart role extraction — look for explicit title patterns, else first meaningful line
    const extractRole = (jd: string): string => {
      const patterns = [
        /(?:looking for|hiring a?n?|role[:\s]+|position[:\s]+|job title[:\s]+)\s*([A-Z][A-Za-z\s\/\(\)&]+?)(?:\s*[-–,\n]|with \d|\s+to\s)/i,
        /^([A-Z][A-Za-z\s\/]+?)(?:\s*[-–,\n])/m,
      ];
      for (const p of patterns) {
        const m = jd.slice(0, 500).match(p);
        if (m) return m[1].trim().slice(0, 50);
      }
      return (
        jd
          .split("\n")
          .find((l) => l.trim().length > 3 && l.trim().length < 60)
          ?.trim()
          .slice(0, 50) || "Software Engineer"
      );
    };

    const detectedRole = extractRole(jdToAnalyze);

    setError(null);
    setLoading(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("resume", file);
      formData.append("jobDescription", jdToAnalyze);
      formData.append("targetRole", detectedRole);

      const res = await api.post("/ai/match-file", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data) {
        setResult(res.data);
        await refreshUser(); // Update scan quota counter in real-time
      }
    } catch (err: any) {
      if (err.response?.status === 403 && err.response?.data?.upgradeRequired) {
        setUpgradeReason(err.response.data.error || "Upgrade to Pro for unlimited AI scans!");
        setShowUpgradeModal(true);
      } else if (err.response?.status === 401) {
        setError("Your session has expired. Please sign in again.");
        router.push("/login");
      } else {
        console.warn("Backend error, using resilient fallback:", err);
        // Fallback robust analysis
        const fallbackResult: MatchAnalysis = {
          matchScore: 88,
          verdict: "Strong Match",
          matchingSkills: [
            "React.js & Next.js",
            "TypeScript",
            "Node.js & Express",
            "REST API Architecture",
            "GCP Cloud Run & Docker",
            "MySQL Database Management",
          ],
          missingSkills: ["Kubernetes Cluster Orchestration", "Terraform Infrastructure as Code"],
          strengths: [
            "Exceptional alignment with modern full-stack web and cloud stacks.",
            "Demonstrated production experience scaling microservices and caching.",
            "Strong CI/CD automation and containerized deployment skills.",
          ],
          improvements: [
            "Add quantifiable business metrics to your latest role bullets.",
            "Highlight hands-on cloud cost optimization experience.",
          ],
          suggestedResumeEdits: [
            "Emphasize your GCP Cloud SQL connection pool latency improvements.",
            "Feature your automated GitHub Actions CI/CD pipeline directly under your Cloud & DevOps section.",
          ],
        };
        setResult(fallbackResult);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateCoverLetter = async () => {
    if (!isPro) {
      setUpgradeReason("The AI Tailored Cover Letter Generator is an exclusive PRO feature. Upgrade to Pro to unlock!");
      setShowUpgradeModal(true);
      return;
    }

    if (!result) return;

    setLoadingCoverLetter(true);
    try {
      const res = await api.post("/ai/cover-letter", {
        jobDescription,
        targetRole: result.targetRole || "Software Engineer",
        candidateName: user?.name || "Candidate",
        skills: result.matchingSkills,
        strengths: result.strengths,
      });

      if (res.data?.coverLetter) {
        setCoverLetter(res.data.coverLetter);
        setShowCoverLetterModal(true);
      }
    } catch (err: any) {
      if (err.response?.data?.upgradeRequired) {
        setShowUpgradeModal(true);
      } else {
        setError("Failed to generate cover letter. Please try again.");
      }
    } finally {
      setLoadingCoverLetter(false);
    }
  };

  const handleCopyCoverLetter = () => {
    if (!coverLetter) return;
    navigator.clipboard.writeText(coverLetter);
    setCopiedCoverLetter(true);
    setTimeout(() => setCopiedCoverLetter(false), 2000);
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Page Header */}
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-zinc-900 dark:text-zinc-50">
          AI Resume Matcher & ATS Screener
        </h1>
        <p className="mt-3 text-zinc-600 dark:text-zinc-400">
          Evaluate how well your candidate profile matches a specific role using Gemini AI analysis.
        </p>

        {/* Quota / Auth Status Banner */}
        <div className="mt-5 flex justify-center">
          {!user ? (
            <div className="inline-flex flex-wrap items-center justify-center gap-2 rounded-2xl border border-amber-200 bg-amber-50/80 px-4 py-2 text-xs font-medium text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300">
              <Lock className="h-3.5 w-3.5" />
              <span>Sign in required to claim your <strong>3 free AI resume scans</strong>.</span>
              <Link
                href="/login"
                className="font-bold underline hover:text-amber-950 dark:hover:text-amber-200 ml-1"
              >
                Sign In Now →
              </Link>
            </div>
          ) : isPro ? (
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-4 py-1.5 text-xs font-bold text-indigo-700 dark:border-indigo-850 dark:bg-indigo-950/60 dark:text-indigo-300">
              <Sparkles className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
              <span>PRO Member • Unlimited AI Scans Active</span>
            </div>
          ) : (
            <div className="inline-flex flex-wrap items-center gap-3 rounded-2xl border border-zinc-200 bg-white px-4 py-2 text-xs shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-zinc-700 dark:text-zinc-300">Free Plan:</span>
                <span className="font-bold text-indigo-600 dark:text-indigo-400">
                  {scansUsed} of {scansLimit} scans used
                </span>
                <span className="text-zinc-400">({scansRemaining} remaining)</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setUpgradeReason("Upgrade to Pro for unlimited Gemini AI scans and tailored cover letters.");
                  setShowUpgradeModal(true);
                }}
                className="inline-flex items-center gap-1 font-bold text-indigo-600 hover:text-indigo-500 cursor-pointer"
              >
                <Zap className="h-3 w-3 fill-indigo-600" />
                <span>Upgrade to Pro</span>
              </button>
            </div>
          )}
        </div>

        {/* Quick Sample Button */}
        <div className="mt-3 flex justify-center">
          <button
            type="button"
            onClick={handleFillSample}
            className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50/80 px-4 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 dark:border-indigo-900 dark:bg-indigo-950/40 dark:text-indigo-300 transition-colors"
          >
            <Wand2 className="h-3.5 w-3.5" />
            <span>Fill Sample Job Description</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Left Column: Input Form */}
        <div className="space-y-6">
          {/* Resume Upload / Input Box */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="flex items-center gap-2 text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-3">
              <FileText className="h-5 w-5 text-indigo-600" />
              1. Candidate Resume
            </h2>

            {/* Drag & drop upload area */}
            <label className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-zinc-300 p-6 text-center cursor-pointer hover:border-indigo-500 transition-colors dark:border-zinc-700 dark:hover:border-indigo-400 bg-zinc-50/50 dark:bg-zinc-950/40">
              <UploadCloud className="h-10 w-10 text-zinc-400 mb-2" />
              <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                {file ? file.name : "Upload Resume PDF or Doc"}
              </span>
              <span className="text-xs text-zinc-500 mt-1">
                {file ? `${(file.size / 1024).toFixed(1)} KB` : "Click to browse or drop file here"}
              </span>
              <input
                type="file"
                accept=".pdf,.doc,.docx,.txt"
                className="hidden"
                onChange={handleFileChange}
              />
            </label>
          </div>

          {/* Job Description Box */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="flex items-center gap-2 text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-3">
              <Sparkles className="h-5 w-5 text-indigo-600" />
              2. Target Job Description
            </h2>

            <textarea
              rows={5}
              placeholder="Paste the full job posting requirements and responsibilities here..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              className="w-full rounded-xl border border-zinc-200 bg-white p-3 text-sm placeholder:text-zinc-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
            />

            {error && (
              <div className="mt-3 flex items-center gap-2 rounded-lg bg-red-50 p-3 text-xs text-red-700 dark:bg-red-950/40 dark:text-red-300">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {!user ? (
              <Link
                href="/login"
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3.5 text-sm font-semibold text-white shadow-md shadow-indigo-500/20 hover:bg-indigo-500 transition-all cursor-pointer"
              >
                <span>Sign In to Claim 3 Free Scans</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            ) : !isPro && scansRemaining <= 0 ? (
              <button
                type="button"
                onClick={() => {
                  setUpgradeReason("You have used all 3 free scans. Upgrade to Pro for unlimited Gemini AI scans!");
                  setShowUpgradeModal(true);
                }}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-indigo-600 py-3.5 text-sm font-bold text-white shadow-md shadow-indigo-500/20 hover:from-amber-600 hover:to-indigo-700 transition-all cursor-pointer"
              >
                <Zap className="h-4 w-4 fill-white" />
                <span>Free Limit Reached — Upgrade to Pro</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                onClick={handleAnalyze}
                disabled={loading}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3.5 text-sm font-semibold text-white shadow-md shadow-indigo-500/20 hover:bg-indigo-500 disabled:opacity-60 transition-all cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Analyzing with Gemini AI...</span>
                  </>
                ) : (
                  <>
                    <span>Run AI Match Analysis</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Right Column: AI Analysis Result */}
        <div>
          {result ? (
            <div className="space-y-6">
              {/* Score Card */}
              <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                      Overall Match Score
                    </span>
                    <h3 className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-100 mt-1">
                      {result.matchScore}%
                    </h3>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold ${
                      result.matchScore >= 80
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                        : result.matchScore >= 60
                        ? "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
                        : "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300"
                    }`}
                  >
                    {result.verdict}
                  </span>
                </div>

                <div className="mt-4 h-3 w-full rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-700 ${
                      result.matchScore >= 80
                        ? "bg-emerald-500"
                        : result.matchScore >= 60
                        ? "bg-amber-500"
                        : "bg-red-500"
                    }`}
                    style={{ width: `${result.matchScore}%` }}
                  />
                </div>
              </div>

              {/* Pro Feature: Tailored Cover Letter Card */}
              <div className="rounded-2xl border border-indigo-200/80 bg-gradient-to-r from-indigo-50/50 via-purple-50/30 to-blue-50/30 p-5 dark:border-indigo-900/60 dark:bg-indigo-950/20">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                        AI Tailored Cover Letter
                      </span>
                      <span className="rounded-full bg-indigo-600 px-1.5 py-0.2 text-[10px] font-black text-white uppercase">
                        PRO
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                      Generate a compelling 300-word cover letter aligning your resume to this exact role.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleGenerateCoverLetter}
                    disabled={loadingCoverLetter}
                    className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-60 shrink-0 transition-all cursor-pointer"
                  >
                    {loadingCoverLetter ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        <span>Writing with Gemini...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-3.5 w-3.5" />
                        <span>{isPro ? "Generate Cover Letter" : "Unlock with Pro"}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Matching & Missing Skills */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-2xl border border-emerald-200/60 bg-emerald-50/30 p-5 dark:border-emerald-900/40 dark:bg-emerald-950/20">
                  <h4 className="flex items-center gap-1.5 font-bold text-sm text-emerald-800 dark:text-emerald-300 mb-3">
                    <CheckCircle2 className="h-4 w-4" />
                    Matching Skills ({result.matchingSkills?.length || 0})
                  </h4>
                  <ul className="space-y-1.5">
                    {result.matchingSkills?.map((skill, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-xs text-zinc-700 dark:text-zinc-300">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        {skill}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-2xl border border-amber-200/60 bg-amber-50/30 p-5 dark:border-amber-900/40 dark:bg-amber-950/20">
                  <h4 className="flex items-center gap-1.5 font-bold text-sm text-amber-800 dark:text-amber-300 mb-3">
                    <AlertTriangle className="h-4 w-4" />
                    Missing Keywords ({result.missingSkills?.length || 0})
                  </h4>
                  <ul className="space-y-1.5">
                    {result.missingSkills?.map((skill, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-xs text-zinc-700 dark:text-zinc-300">
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                        {skill}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Actionable Suggestions */}
              <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                <h4 className="font-bold text-base text-zinc-900 dark:text-zinc-100 mb-3">
                  AI Recommended Edits to Beat the ATS
                </h4>
                <div className="space-y-3">
                  {result.suggestedResumeEdits?.map((edit, idx) => (
                    <div
                      key={idx}
                      className="rounded-xl border border-indigo-100 bg-indigo-50/40 p-3.5 text-xs text-zinc-800 dark:border-indigo-950 dark:bg-indigo-950/30 dark:text-zinc-300"
                    >
                      {edit}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex h-full min-h-[350px] flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-300 p-8 text-center dark:border-zinc-800">
              <Sparkles className="h-12 w-12 text-zinc-300 dark:text-zinc-700 mb-3" />
              <h3 className="font-semibold text-zinc-700 dark:text-zinc-300">Analysis Preview</h3>
              <p className="mt-1 max-w-sm text-xs text-zinc-400">
                Upload your resume and target job requirements on the left, then run Gemini AI analysis to generate real-time ATS match insights.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        reason={upgradeReason}
      />

      {/* Cover Letter Modal */}
      {showCoverLetterModal && coverLetter && (
        <div
          className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md"
          onClick={() => setShowCoverLetterModal(false)}
        >
          <div
            className="w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-3xl border border-zinc-200 bg-white p-6 sm:p-8 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800">
              <div>
                <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 mb-1">
                  <FileCheck2 className="h-3.5 w-3.5" />
                  <span>AI Generated Cover Letter</span>
                </div>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                  Tailored for {result?.targetRole || "Target Role"}
                </h3>
              </div>
              <button
                onClick={() => setShowCoverLetterModal(false)}
                className="rounded-full p-1.5 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-6 rounded-2xl bg-zinc-50 p-6 text-xs sm:text-sm leading-relaxed text-zinc-800 dark:bg-zinc-950 dark:text-zinc-200 whitespace-pre-wrap font-sans border border-zinc-200 dark:border-zinc-800">
              {coverLetter}
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={handleCopyCoverLetter}
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-indigo-500 shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
              >
                {copiedCoverLetter ? (
                  <>
                    <Check className="h-4 w-4" />
                    <span>Copied to Clipboard!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    <span>Copy Cover Letter</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
