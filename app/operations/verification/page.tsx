"use client";

import React, { useState, useEffect } from "react";
import {
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Check,
  Building2,
  FileImage,
  Clock,
  Send,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";

interface VerificationItem {
  _id: string;
  workOrderNumber: string;
  issueId: {
    _id: string;
    referenceCode: string;
    title: string;
    category: string;
    priorityLevel: string;
    initialDetectionFrame?: string;
    location?: { addressText: string };
  };
  departmentId: { name: string; code: string };
  contractorName?: string;
  status: string;
  completedAt?: string;
  completionNotes?: string;
  evidenceIds: { _id: string; fileUrl: string; capturedAt: string }[];
}

export default function VerificationQueuePage() {
  const [items, setItems] = useState<VerificationItem[]>([]);
  const [selectedWO, setSelectedWO] = useState<VerificationItem | null>(null);
  const [isDecisionModalOpen, setIsDecisionModalOpen] = useState(false);
  const [decisionAction, setDecisionAction] = useState<"APPROVE" | "REOPEN">("APPROVE");
  const [verificationNotes, setVerificationNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchQueue = async () => {
    try {
      const res = await fetch("/api/work-orders?status=SUBMITTED_FOR_VERIFICATION");
      const data = await res.json();
      if (data.success) {
        setItems(data.data.workOrders);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  const handleOpenDecision = (wo: VerificationItem, action: "APPROVE" | "REOPEN") => {
    setSelectedWO(wo);
    setDecisionAction(action);
    setVerificationNotes(
      action === "APPROVE"
        ? "Repair quality verified against detection frame. Compaction and leveling satisfactory."
        : "Inadequate surface compaction observed; visible edge fissures remain. Re-work required."
    );
    setIsDecisionModalOpen(true);
  };

  const handleSubmitDecision = async () => {
    if (!selectedWO) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/work-orders/${selectedWO._id}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: decisionAction,
          notes: verificationNotes,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSuccessMsg(data.data.message);
        setTimeout(() => {
          setIsDecisionModalOpen(false);
          setSuccessMsg(null);
          fetchQueue();
        }, 1500);
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
            <CheckCircle2 className="w-6 h-6 text-emerald-400" />
            Engineering Verification & Quality Review Queue
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Compare initial AI detection snapshots against field repair completion photos before officially closing work orders.
          </p>
        </div>
        <Badge variant="purple" size="md">
          {items.length} Work Orders Awaiting Verification
        </Badge>
      </div>

      {/* Verification Cards */}
      {items.length === 0 ? (
        <div className="p-12 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white">All Completed Repairs Verified</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            No work orders are currently pending verification. New repair submissions from field inspectors will appear here automatically.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {items.map((wo) => (
            <div
              key={wo._id}
              className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-5"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-sky-400">{wo.workOrderNumber}</span>
                    <Badge variant="purple" size="sm">
                      PENDING VERIFICATION
                    </Badge>
                  </div>
                  <h3 className="text-sm font-bold text-white mt-1">{wo.issueId?.title}</h3>
                </div>
                <Badge variant="warning" size="sm">
                  {wo.issueId?.priorityLevel}
                </Badge>
              </div>

              {/* Side-by-Side Photo Comparison */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <div className="text-[11px] font-semibold text-slate-400 flex items-center justify-between">
                    <span>1. Initial AI Detection</span>
                    <span className="text-rose-400 text-[10px]">DEFECT</span>
                  </div>
                  <div className="aspect-video rounded-xl bg-slate-950 border border-slate-800 flex flex-col items-center justify-center text-center p-3 text-slate-500">
                    <FileImage className="w-6 h-6 mb-1 text-slate-600" />
                    <span className="text-[10px]">Detection Snapshot Frame</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="text-[11px] font-semibold text-slate-400 flex items-center justify-between">
                    <span>2. Contractor Repair Photo</span>
                    <span className="text-emerald-400 text-[10px]">COMPLETED</span>
                  </div>
                  <div className="aspect-video rounded-xl bg-slate-950 border border-emerald-500/30 flex flex-col items-center justify-center text-center p-3 text-emerald-400">
                    <Check className="w-6 h-6 mb-1 text-emerald-400" />
                    <span className="text-[10px] font-semibold">Repair Evidence Submitted</span>
                  </div>
                </div>
              </div>

              {/* Contractor Notes */}
              <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs space-y-1">
                <span className="font-semibold text-slate-400 block text-[10px] uppercase">
                  Contractor Field Notes ({wo.contractorName}):
                </span>
                <p className="text-slate-300 leading-relaxed">
                  {wo.completionNotes || "Repair completed and compacted."}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <Button
                  size="sm"
                  variant="outline"
                  className="text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 border-rose-500/30"
                  onClick={() => handleOpenDecision(wo, "REOPEN")}
                >
                  <RotateCcw className="w-3.5 h-3.5 mr-1" />
                  Reopen Work Order
                </Button>

                <Button
                  size="sm"
                  variant="success"
                  onClick={() => handleOpenDecision(wo, "APPROVE")}
                >
                  <Check className="w-3.5 h-3.5 mr-1" />
                  Approve & Resolve Issue
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Decision Confirmation Modal */}
      <Modal
        isOpen={isDecisionModalOpen}
        onClose={() => setIsDecisionModalOpen(false)}
        title={
          decisionAction === "APPROVE"
            ? `Approve Resolution: ${selectedWO?.workOrderNumber}`
            : `Reopen Work Order: ${selectedWO?.workOrderNumber}`
        }
      >
        {successMsg ? (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs text-center flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            {successMsg}
          </div>
        ) : (
          <div className="space-y-4 text-xs">
            <p className="text-slate-400">
              {decisionAction === "APPROVE"
                ? "Confirm that the submitted photographic evidence is genuine and satisfies municipal engineering quality standards."
                : "Specify the reason for reopening. The contractor will be notified to perform required rework."}
            </p>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Verification Engineer Audit Notes (Required)
              </label>
              <textarea
                rows={3}
                value={verificationNotes}
                onChange={(e) => setVerificationNotes(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-blue-500 resize-none"
              />
            </div>

            <div className="pt-3 flex justify-end gap-2">
              <Button size="sm" variant="secondary" onClick={() => setIsDecisionModalOpen(false)}>
                Cancel
              </Button>
              <Button
                size="sm"
                variant={decisionAction === "APPROVE" ? "success" : "danger"}
                isLoading={isSubmitting}
                onClick={handleSubmitDecision}
              >
                <Send className="w-3.5 h-3.5 mr-1" />
                Confirm {decisionAction === "APPROVE" ? "Approval" : "Reopening"}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
