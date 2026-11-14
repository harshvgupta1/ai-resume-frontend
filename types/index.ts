export interface Subscription {
  id: string;
  plan: string;
  billingCycle: "monthly" | "yearly";
  status: "active" | "expired" | "cancelled" | "past_due";
  amount: number;
  currency: string;
  amountFormatted?: string;
  razorpayPaymentId?: string;
  razorpayOrderId?: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  expiresAtFormatted?: string;
  daysRemaining?: number;
  isExpired?: boolean;
  cancelAtPeriodEnd?: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  plan?: "free" | "pro";
  scansUsed?: number;
  scansLimit?: number;
  proExpiresAt?: string;
  subscription?: Subscription | null;
}

export interface MatchAnalysis {
  id?: string;
  targetRole?: string;
  matchScore: number; // 0 - 100
  verdict: "Strong Match" | "Moderate Match" | "Low Match";
  matchingSkills: string[];
  missingSkills: string[];
  strengths: string[];
  improvements: string[];
  suggestedResumeEdits: string[];
  userPlan?: "free" | "pro";
  scansUsed?: number;
  scansLimit?: number;
}

export interface ResumeScan {
  id: string;
  candidateName?: string;
  targetRole: string;
  matchScore: number;
  verdict?: "Strong Match" | "Moderate Match" | "Low Match" | string;
  createdAt: string;
  fileName: string;
  matchingSkills?: string[];
  missingSkills?: string[];
  strengths?: string[];
  improvements?: string[];
  suggestedResumeEdits?: string[];
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
