"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Shield,
  MapPin,
  Clock,
  TrendingUp,
  ThumbsUp,
  Star,
  CheckCircle2,
  Building2,
  ArrowLeft,
  FileImage,
  Layers,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

interface PublicIssueDetail {
  id: string;
  referenceCode: string;
  category: string;
  title: string;
  description: string;
  location: { addressText?: string; zoneName?: string };
  departmentId?: { name: string; code: string };
  priorityLevel: string;
  priorityScore: number;
  priorityReasons: string[];
  status: string;
  duplicateCount: number;
  firstReportedAt: string;
  lastUpdatedAt: string;
  resolvedAt?: string;
  initialDetectionFrame?: string;
}

export default function PublicIssueTrackingPage() {
  const params = useParams();
  const id = params?.id as string;

  const [issue, setIssue] = useState<PublicIssueDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSupporting, setIsSupporting] = useState(false);
  const [supportCount, setSupportCount] = useState(0);
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchIssue = async () => {
      try {
        const res = await fetch(`/api/issues/${id}`);
        const data = await res.json();
        if (data.success && data.data.issue) {
          setIssue(data.data.issue);
          setSupportCount(data.data.issue.duplicateCount || 0);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchIssue();
  }, [id]);

  const handleSupport = async () => {
    setIsSupporting(true);
    try {
      setSupportCount((prev) => prev + 1);
      // Optional call to update priority
    } finally {
      setIsSupporting(false);
    }
  };

  const getStatusSteps = (status: string) => {
    const steps = [
      { key: "NEW", label: "Reported / Detected", done: true },
      { key: "TRIAGED", label: "Operations Triaged", done: ["TRIAGED", "ASSIGNED", "IN_PROGRESS", "SUBMITTED_FOR_VERIFICATION", "RESOLVED"].includes(status) },
      { key: "ASSIGNED", label: "Contractor Dispatched", done: ["ASSIGNED", "IN_PROGRESS", "SUBMITTED_FOR_VERIFICATION", "RESOLVED"].includes(status) },
      { key: "IN_PROGRESS", label: "Repair In Progress", done: ["IN_PROGRESS", "SUBMITTED_FOR_VERIFICATION", "RESOLVED"].includes(status) },
      { key: "RESOLVED", label: "Quality Verified & Resolved", done: status === "RESOLVED" },
    ];
    return steps;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 text-xs">
        Loading grievance tracking details...
      </div>
    );
  }

  if (!issue) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-center">
        <h2 className="text-lg font-bold text-white mb-2">Grievance Not Found</h2>
        <p className="text-xs text-slate-400 mb-4">The requested reference code does not exist in the NMC registry.</p>
        <Link href="/report">
          <Button size="sm" variant="primary">Submit New Grievance</Button>
        </Link>
      </div>
    );
  }

  const steps = getStatusSteps(issue.status);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-xs text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
          <span className="text-xs font-bold text-sky-400 font-mono">{issue.referenceCode}</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8 space-y-6">
        {/* Title Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-sky-400">{issue.referenceCode}</span>
              <Badge variant="warning" size="sm">
                {issue.priorityLevel} PRIORITY
              </Badge>
            </div>
            <Badge variant={issue.status === "RESOLVED" ? "success" : "info"} size="md">
              {issue.status.replace("_", " ")}
            </Badge>
          </div>

          <h1 className="text-2xl font-extrabold text-white tracking-tight">{issue.title}</h1>
          <p className="text-xs text-slate-400 leading-relaxed">{issue.description}</p>

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-2 border-t border-slate-800">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-sky-400" />
              <span>{issue.location.addressText || "Nagpur Urban Zone"}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-slate-500" />
              <span>{issue.departmentId?.name || "Roads & Traffic"}</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-500">
              <Clock className="w-3.5 h-3.5" />
              <span>First Reported: {new Date(issue.firstReportedAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        {/* Progress Timeline */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Grievance Resolution Lifecycle
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
            {steps.map((step, index) => (
              <div
                key={step.key}
                className={`p-3 rounded-2xl border text-left transition-all ${
                  step.done
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                    : "bg-slate-950/40 border-slate-800 text-slate-500"
                }`}
              >
                <div className="flex items-center gap-1.5 text-[11px] font-bold">
                  {step.done ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <span className="w-3.5 h-3.5 rounded-full border border-slate-600 inline-block text-center text-[9px] leading-3">{index + 1}</span>}
                  <span>Step {index + 1}</span>
                </div>
                <div className="text-xs font-semibold mt-1 text-slate-200">{step.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Community Support & Citizen Feedback */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Community Support */}
          <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-purple-400">
              <Layers className="w-4 h-4" /> Community Proximity Support
            </div>
            <p className="text-xs text-slate-400">
              Are you also experiencing this infrastructure defect? Upvote to boost urgency.
            </p>
            <div className="flex items-center justify-between pt-2">
              <span className="text-xs font-mono font-bold text-white">
                {supportCount} Citizen(s) Supported
              </span>
              <Button size="sm" variant="secondary" isLoading={isSupporting} onClick={handleSupport}>
                <ThumbsUp className="w-3.5 h-3.5 mr-1 text-purple-400" />
                I Experience This Too
              </Button>
            </div>
          </div>

          {/* Citizen Resolution Feedback */}
          <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
              <Star className="w-4 h-4" /> Resident Satisfaction Rating
            </div>
            {feedbackSubmitted ? (
              <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 text-xs text-center flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> Thank you for rating the municipal repair!
              </div>
            ) : (
              <div>
                <p className="text-xs text-slate-400 mb-2">Rate the speed and quality of this resolution:</p>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFeedbackRating(star)}
                      className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                        star <= feedbackRating ? "text-amber-400 bg-amber-500/10" : "text-slate-600"
                      }`}
                    >
                      <Star className="w-5 h-5 fill-current" />
                    </button>
                  ))}
                  <Button size="sm" variant="outline" className="ml-auto" onClick={() => setFeedbackSubmitted(true)}>
                    Submit
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
