"use client";

import { useState, useEffect } from "react";
import { Plus, Briefcase, MapPin, Calendar, ChevronRight } from "lucide-react";
import { JobApplication } from "@/types";

const COLUMNS: { id: JobApplication["status"]; label: string; color: string }[] = [
  { id: "applied", label: "Applied", color: "border-blue-500" },
  { id: "interviewing", label: "Interviewing", color: "border-amber-500" },
  { id: "offered", label: "Offered", color: "border-emerald-500" },
  { id: "rejected", label: "Archived", color: "border-zinc-400" },
];

export default function TrackerPage() {
  const [jobs, setJobs] = useState<JobApplication[]>([]);
  const [newCompany, setNewCompany] = useState("");
  const [newRole, setNewRole] = useState("");
  const [showModal, setShowModal] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("job_applications");
      if (stored) setJobs(JSON.parse(stored));
    } catch (e) {}
  }, []);

  // Persist to localStorage whenever jobs change
  useEffect(() => {
    try {
      localStorage.setItem("job_applications", JSON.stringify(jobs));
    } catch (e) {}
  }, [jobs]);

  const handleAddJob = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompany.trim() || !newRole.trim()) return;

    const newJob: JobApplication = {
      id: `job-${Date.now()}`,
      company: newCompany,
      role: newRole,
      status: "applied",
      appliedDate: "Just now",
      matchScore: Math.floor(Math.random() * 20) + 78,
    };

    setJobs((prev) => [newJob, ...prev]);
    setNewCompany("");
    setNewRole("");
    setShowModal(false);
  };

  const advanceStatus = (id: string, currentStatus: JobApplication["status"]) => {
    const sequence: JobApplication["status"][] = ["applied", "interviewing", "offered"];
    const currentIndex = sequence.indexOf(currentStatus);
    if (currentIndex >= 0 && currentIndex < sequence.length - 1) {
      const nextStatus = sequence[currentIndex + 1];
      setJobs((prev) =>
        prev.map((j) => (j.id === id ? { ...j, status: nextStatus } : j))
      );
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-50">
            Job Application Tracker
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Keep track of all your applied roles and resume ATS match scores across pipeline stages.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Add Application</span>
        </button>
      </div>

      {/* Kanban Board Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {COLUMNS.map((col) => {
          const colJobs = jobs.filter((j) => j.status === col.id);
          return (
            <div
              key={col.id}
              className="flex flex-col rounded-2xl border border-zinc-200 bg-zinc-50/70 p-4 dark:border-zinc-800 dark:bg-zinc-900/40"
            >
              <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center gap-2">
                  <span className={`h-2.5 w-2.5 rounded-full border-2 ${col.color}`} />
                  <span className="font-bold text-sm text-zinc-800 dark:text-zinc-200">
                    {col.label}
                  </span>
                </div>
                <span className="rounded-full bg-zinc-200 dark:bg-zinc-800 px-2 py-0.5 text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                  {colJobs.length}
                </span>
              </div>

              {/* Cards list */}
              <div className="mt-4 space-y-3 flex-1">
                {colJobs.map((job) => (
                  <div
                    key={job.id}
                    className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow dark:border-zinc-800 dark:bg-zinc-900"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                        {job.role}
                      </h4>
                      {job.matchScore && (
                        <span className="rounded-md bg-indigo-50 px-2 py-0.5 text-[11px] font-bold text-indigo-600 dark:bg-indigo-950 dark:text-indigo-300 shrink-0">
                          {job.matchScore}% ATS
                        </span>
                      )}
                    </div>

                    <div className="mt-1 flex items-center gap-1 text-xs font-medium text-zinc-600 dark:text-zinc-400">
                      <Briefcase className="h-3 w-3" />
                      <span>{job.company}</span>
                    </div>

                    {job.location && (
                      <div className="mt-1 flex items-center gap-1 text-xs text-zinc-400">
                        <MapPin className="h-3 w-3" />
                        <span>{job.location}</span>
                      </div>
                    )}

                    <div className="mt-3 flex items-center justify-between border-t border-zinc-100 dark:border-zinc-800 pt-2 text-[11px] text-zinc-400">
                      <span>{job.appliedDate}</span>
                      {col.id !== "offered" && col.id !== "rejected" && (
                        <button
                          onClick={() => advanceStatus(job.id, job.status)}
                          className="flex items-center gap-0.5 font-semibold text-indigo-600 hover:text-indigo-500"
                        >
                          <span>Move</span>
                          <ChevronRight className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}

                {colJobs.length === 0 && (
                  <div className="py-8 text-center text-xs text-zinc-400">
                    No roles in this column
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Job Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Add New Job Application</h3>
            <form onSubmit={handleAddJob} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Company Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Google, Stripe, Microsoft"
                  value={newCompany}
                  onChange={(e) => setNewCompany(e.target.value)}
                  className="w-full rounded-lg border border-zinc-300 p-2 text-sm focus:border-indigo-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-950"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Job Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Full Stack Engineer (React/Node)"
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="w-full rounded-lg border border-zinc-300 p-2 text-sm focus:border-indigo-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-950"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-lg px-4 py-2 text-xs font-semibold text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500"
                >
                  Save Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
