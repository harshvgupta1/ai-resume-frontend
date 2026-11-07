export interface MatchAnalysis {
  matchScore: number; // 0 - 100
  verdict: "Strong Match" | "Moderate Match" | "Low Match";
  matchingSkills: string[];
  missingSkills: string[];
  strengths: string[];
  improvements: string[];
  suggestedResumeEdits: string[];
}

export interface ResumeScan {
  id: string;
  candidateName?: string;
  targetRole: string;
  matchScore: number;
  createdAt: string;
  fileName: string;
}

export interface JobApplication {
  id: string;
  company: string;
  role: string;
  salary?: string;
  location?: string;
  status: "applied" | "interviewing" | "offered" | "rejected";
  appliedDate: string;
  matchScore?: number;
}
