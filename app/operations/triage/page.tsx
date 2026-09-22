"use client";

import React, { useState, useEffect } from "react";
import {
  ListTodo,
  TrendingUp,
  Building2,
  Wrench,
  Sparkles,
  MapPin,
  CheckCircle2,
  Layers,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { CanonicalIssue } from "@/types/issue";

export default function TriageQueuePage() {
  const [issues, setIssues] = useState<CanonicalIssue[]>([]);
  const [selectedIssue, setSelectedIssue] = useState<CanonicalIssue | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [priorityLevel, setPriorityLevel] = useState<string>("HIGH");
  const [priorityScore, setPriorityScore] = useState<number>(75);
  const [contractorName, setContractorName] = useState("Nagpur Road Maintenance Services");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchIssues = async () => {
    try {
      const res = await fetch("/api/issues?status=NEW,TRIAGED,ASSIGNED");
      const data = await res.json();
      if (data.success) {
        setIssues(data.data.issues);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchIssues();
  }, []);

  const handleOpenTriage = (issue: CanonicalIssue) => {
    setSelectedIssue(issue);
    setPriorityLevel(issue.priorityLevel);
    setPriorityScore(issue.priorityScore);
    setIsModalOpen(true);
  };

  const handleConfirmTriage = async () => {
    if (!selectedIssue) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/issues/${selectedIssue.id}/triage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          priorityLevel,
          priorityScore,
          assignContractor: true,
          contractorName,
          dueInHours: 24,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setIsModalOpen(false);
        fetchIssues();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2.5">
            <ListTodo className="w-6 h-6 text-blue-400" />
            Operations Triage & Department Routing
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Review incoming live detections and citizen complaints, verify explainable risk factors, and dispatch work orders.
          </p>
        </div>
        <Badge variant="info" size="md">
          {issues.length} Active Issues in Queue
        </Badge>
      </div>

      {/* Issues Table / Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {issues.map((issue) => (
          <div
            key={issue.id}
            className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between gap-4 shadow-xl"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-sky-400">{issue.referenceCode}</span>
                <Badge
                  variant={
                    issue.priorityLevel === "CRITICAL"
                      ? "danger"
                      : issue.priorityLevel === "HIGH"
                      ? "warning"
                      : "info"
                  }
                  size="sm"
                >
                  {issue.priorityLevel} ({issue.priorityScore} Pts)
                </Badge>
              </div>

              <div>
                <h3 className="text-sm font-bold text-white leading-snug">{issue.title}</h3>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2">{issue.description}</p>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <MapPin className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                <span className="truncate">{issue.location.addressText || "Nagpur"}</span>
              </div>

              {/* Explainable Reasons */}
              <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3 text-sky-400" /> Risk Factors:
                </span>
                <div className="flex flex-wrap gap-1">
                  {issue.priorityReasons?.map((r, i) => (
                    <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800">
                      {r}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
              <div className="flex items-center gap-1 text-[11px] text-purple-400 font-medium">
                <Layers className="w-3.5 h-3.5" />
                <span>{issue.duplicateCount} duplicates</span>
              </div>

              <Button size="sm" variant="primary" onClick={() => handleOpenTriage(issue)}>
                <Wrench className="w-3.5 h-3.5 mr-1" />
                Triage / Assign
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Triage & Priority Override Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`Triage Issue: ${selectedIssue?.referenceCode}`}
      >
        <div className="space-y-4 text-xs">
          <p className="text-slate-400">
            Confirm or override priority scoring and dispatch work order for <strong className="text-white">{selectedIssue?.title}</strong>.
          </p>

          <div>
            <label className="block font-semibold text-slate-300 mb-1">Priority Level</label>
            <select
              value={priorityLevel}
              onChange={(e) => setPriorityLevel(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-blue-500"
            >
              <option value="CRITICAL">CRITICAL (Emergency / High Speed Hazard)</option>
              <option value="HIGH">HIGH (Near Schools / Transit)</option>
              <option value="MEDIUM">MEDIUM (Standard Municipal Defect)</option>
              <option value="LOW">LOW (Cosmetic Asset Damage)</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1">Priority Score (0 - 100)</label>
            <input
              type="number"
              min={0}
              max={100}
              value={priorityScore}
              onChange={(e) => setPriorityScore(parseInt(e.target.value, 10))}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1">Assigned Contractor</label>
            <input
              type="text"
              value={contractorName}
              onChange={(e) => setContractorName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="pt-3 flex justify-end gap-2">
            <Button size="sm" variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" variant="success" isLoading={isSubmitting} onClick={handleConfirmTriage}>
              <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
              Confirm & Dispatch Work Order
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
