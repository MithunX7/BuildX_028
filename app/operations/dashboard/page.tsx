"use client";

import React, { useState, useEffect } from "react";
import {
  Activity,
  AlertTriangle,
  Flame,
  Radio,
  HardHat,
  CheckCircle2,
  TrendingUp,
} from "lucide-react";
import { LiveVideoPlayer } from "@/components/console/LiveVideoPlayer";
import { DetectionStream } from "@/components/console/DetectionStream";
import { QuickTriagePanel } from "@/components/console/QuickTriagePanel";
import { OperationsMap } from "@/components/console/OperationsMap";
import { CanonicalIssue } from "@/types/issue";
import { DetectionEvent, FrameAnalysisResult } from "@/types/detection";

export default function OperationsDashboard() {
  const [issues, setIssues] = useState<CanonicalIssue[]>([]);
  const [selectedIssue, setSelectedIssue] = useState<CanonicalIssue | null>(null);
  const [latestDetection, setLatestDetection] = useState<DetectionEvent | null>(null);
  const [summary, setSummary] = useState<{
    openIssues: number;
    totalDetections: number;
    criticalIssues: number;
    activeConflicts: number;
    resolutionRatePercent: number;
  }>({
    openIssues: 3,
    totalDetections: 12,
    criticalIssues: 1,
    activeConflicts: 1,
    resolutionRatePercent: 78,
  });

  const fetchIssues = async () => {
    try {
      const res = await fetch("/api/issues");
      const data = await res.json();
      if (data.success && data.data.issues.length > 0) {
        setIssues(data.data.issues);
        if (!selectedIssue) {
          setSelectedIssue(data.data.issues[0]);
        }
      }
    } catch (err) {
      console.error("Failed to fetch issues:", err);
    }
  };

  const fetchSummary = async () => {
    try {
      const res = await fetch("/api/dashboard/summary");
      const data = await res.json();
      if (data.success && data.data.summary) {
        setSummary(data.data.summary);
      }
    } catch (err) {
      console.error("Failed to fetch summary:", err);
    }
  };

  useEffect(() => {
    fetchIssues();
    fetchSummary();
  }, []);

  const handleNewDetection = (result: FrameAnalysisResult) => {
    if (result.detectionRecord) {
      setLatestDetection(result.detectionRecord);
    }
    fetchIssues();
    fetchSummary();
  };

  const handleSelectIssueById = (issueId: string) => {
    const found = issues.find((i) => i.id === issueId);
    if (found) {
      setSelectedIssue(found);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Operations KPI Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase">Open Grievances</span>
            <div className="text-xl font-extrabold text-white">{summary.openIssues}</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase">AI Detections</span>
            <div className="text-xl font-extrabold text-white">{summary.totalDetections}</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase">Critical Hazards</span>
            <div className="text-xl font-extrabold text-white">{summary.criticalIssues}</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <HardHat className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase">Road Conflicts</span>
            <div className="text-xl font-extrabold text-white">{summary.activeConflicts}</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center gap-3 col-span-2 sm:col-span-1">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase">Resolution SLA</span>
            <div className="text-xl font-extrabold text-emerald-400">{summary.resolutionRatePercent}%</div>
          </div>
        </div>
      </div>

      {/* Main Row: Live Video Centerpiece & Real-Time Detection Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-7 xl:col-span-8">
          <LiveVideoPlayer onNewDetection={handleNewDetection} />
        </div>

        <div className="lg:col-span-5 xl:col-span-4 h-full">
          <DetectionStream
            latestDetection={latestDetection}
            onSelectIssue={handleSelectIssueById}
          />
        </div>
      </div>

      {/* Secondary Row: Quick Triage & Spatial Intelligence Map */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-5">
          <QuickTriagePanel
            activeIssue={selectedIssue}
            onTriageComplete={() => {
              fetchIssues();
              fetchSummary();
            }}
          />
        </div>

        <div className="lg:col-span-7">
          <OperationsMap
            issues={issues}
            selectedIssueId={selectedIssue?.id}
            onSelectIssue={(issue) => setSelectedIssue(issue)}
          />
        </div>
      </div>
    </div>
  );
}
