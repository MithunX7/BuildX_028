"use client";

import React, { useState } from "react";
import {
  AlertCircle,
  Wrench,
  CheckCircle2,
  Building2,
  TrendingUp,
  MapPin,
  Send,
  Layers,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { CanonicalIssue } from "@/types/issue";

interface QuickTriagePanelProps {
  activeIssue: CanonicalIssue | null;
  onTriageComplete?: () => void;
}

export function QuickTriagePanel({ activeIssue, onTriageComplete }: QuickTriagePanelProps) {
  const [isTriageModalOpen, setIsTriageModalOpen] = useState(false);
  const [contractorName, setContractorName] = useState("Nagpur Smart Roads Infra Team");
  const [dueHours, setDueHours] = useState(24);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!activeIssue) {
    return (
      <div className="rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-6 flex flex-col items-center justify-center text-center h-full min-h-[300px]">
        <div className="w-12 h-12 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-slate-500 mb-3">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h4 className="text-sm font-bold text-slate-300">No Issue Selected</h4>
        <p className="text-xs text-slate-500 max-w-xs mt-1">
          Select an issue from the detection stream or live video player to view explainable prioritization and dispatch work orders.
        </p>
      </div>
    );
  }

  const handleDispatch = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/issues/${activeIssue.id}/triage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assignContractor: true,
          contractorName,
          dueInHours: dueHours,
          priorityLevel: activeIssue.priorityLevel,
          priorityScore: activeIssue.priorityScore,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMessage(data.data.message);
        setTimeout(() => {
          setIsTriageModalOpen(false);
          setSuccessMessage(null);
          if (onTriageComplete) onTriageComplete();
        }, 1500);
      }
    } catch (err) {
      console.error("Triage dispatch error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPriorityVariant = (level: string) => {
    switch (level) {
      case "CRITICAL":
        return "danger";
      case "HIGH":
        return "warning";
      case "MEDIUM":
        return "info";
      default:
        return "default";
    }
  };

  return (
    <div className="rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-5 flex flex-col gap-4 h-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-sky-400">{activeIssue.referenceCode}</span>
            <Badge variant={getPriorityVariant(activeIssue.priorityLevel)} size="sm">
              {activeIssue.priorityLevel} PRIORITY ({activeIssue.priorityScore}/100)
            </Badge>
          </div>
          <h3 className="text-sm font-extrabold text-white mt-1 leading-tight">{activeIssue.title}</h3>
        </div>

        <Badge variant="default" size="sm">
          {activeIssue.status}
        </Badge>
      </div>

      {/* Location & Details */}
      <div className="space-y-2 text-xs">
        <div className="flex items-center gap-1.5 text-slate-400">
          <MapPin className="w-3.5 h-3.5 text-sky-400 shrink-0" />
          <span>{activeIssue.location.addressText || "Nagpur"}</span>
        </div>
        <p className="text-slate-400 leading-relaxed text-xs">{activeIssue.description}</p>
      </div>

      {/* Explainable Prioritization Reasons Box */}
      <div className="rounded-2xl bg-slate-950/80 border border-slate-800 p-3.5 space-y-2">
        <div className="flex items-center justify-between text-[11px] font-bold text-slate-300">
          <span className="flex items-center gap-1.5 text-sky-400">
            <TrendingUp className="w-3.5 h-3.5" /> Explainable Risk Factors
          </span>
          <span className="font-mono text-amber-400 font-bold">{activeIssue.priorityScore} Pts</span>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {activeIssue.priorityReasons && activeIssue.priorityReasons.length > 0 ? (
            activeIssue.priorityReasons.map((reason, idx) => (
              <span
                key={idx}
                className="px-2 py-1 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-slate-300 flex items-center gap-1"
              >
                <Sparkles className="w-2.5 h-2.5 text-amber-400" />
                {reason}
              </span>
            ))
          ) : (
            <span className="text-[11px] text-slate-500">Standard category baseline score</span>
          )}
        </div>
      </div>

      {/* Department Routing & Duplicate Badge */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
          <span className="text-[10px] text-slate-500 uppercase font-semibold flex items-center gap-1">
            <Building2 className="w-3 h-3" /> Assigned Department
          </span>
          <span className="font-bold text-slate-200 block truncate">
            {activeIssue.departmentName || activeIssue.category.replace("_", " ")}
          </span>
        </div>

        <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
          <span className="text-[10px] text-slate-500 uppercase font-semibold flex items-center gap-1">
            <Layers className="w-3 h-3" /> Duplicate Reports
          </span>
          <span className="font-bold text-purple-400 block">
            {activeIssue.duplicateCount} linked detection(s)
          </span>
        </div>
      </div>

      {/* Action Footer */}
      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2 mt-auto">
        <Button
          size="sm"
          variant="primary"
          className="w-full"
          onClick={() => setIsTriageModalOpen(true)}
        >
          <Wrench className="w-3.5 h-3.5 mr-1" />
          Dispatch Work Order
        </Button>
      </div>

      {/* Triage & Dispatch Modal */}
      <Modal
        isOpen={isTriageModalOpen}
        onClose={() => setIsTriageModalOpen(false)}
        title={`Dispatch Work Order: ${activeIssue.referenceCode}`}
      >
        {successMessage ? (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs text-center flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            {successMessage}
          </div>
        ) : (
          <div className="space-y-4 text-xs">
            <p className="text-slate-400">
              Confirm contractor assignment and SLA deadline for <strong className="text-white">{activeIssue.title}</strong>.
            </p>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Contractor / Field Maintenance Team</label>
              <input
                type="text"
                value={contractorName}
                onChange={(e) => setContractorName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">SLA Completion Deadline (Hours)</label>
              <select
                value={dueHours}
                onChange={(e) => setDueHours(parseInt(e.target.value, 10))}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-blue-500"
              >
                <option value={12}>12 Hours (Emergency / Critical)</option>
                <option value={24}>24 Hours (High Priority)</option>
                <option value={48}>48 Hours (Medium Priority)</option>
                <option value={72}>72 Hours (Standard)</option>
              </select>
            </div>

            <div className="pt-3 flex justify-end gap-2">
              <Button size="sm" variant="secondary" onClick={() => setIsTriageModalOpen(false)}>
                Cancel
              </Button>
              <Button size="sm" variant="success" isLoading={isSubmitting} onClick={handleDispatch}>
                <Send className="w-3.5 h-3.5 mr-1" />
                Confirm & Dispatch
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
