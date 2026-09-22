"use client";

import React, { useState, useEffect } from "react";
import {
  Wrench,
  Clock,
  CheckCircle2,
  Upload,
  AlertCircle,
  FileImage,
  Send,
  Building2,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";

interface WorkOrderItem {
  _id: string;
  workOrderNumber: string;
  issueId: {
    _id: string;
    referenceCode: string;
    title: string;
    category: string;
    priorityLevel: string;
    location?: { addressText: string };
  };
  departmentId: { name: string; code: string };
  assignedToId?: { name: string; phone: string };
  contractorName?: string;
  status: string;
  dueAt: string;
  completionNotes?: string;
  evidenceIds: { fileUrl: string; capturedAt: string }[];
}

export default function WorkOrdersPage() {
  const [workOrders, setWorkOrders] = useState<WorkOrderItem[]>([]);
  const [selectedWO, setSelectedWO] = useState<WorkOrderItem | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [completionNotes, setCompletionNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchWorkOrders = async () => {
    try {
      const res = await fetch("/api/work-orders");
      const data = await res.json();
      if (data.success) {
        setWorkOrders(data.data.workOrders);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchWorkOrders();
  }, []);

  const handleOpenUpload = (wo: WorkOrderItem) => {
    setSelectedWO(wo);
    setCompletionNotes(wo.completionNotes || "Cold-mix asphalt compaction complete. Level verified.");
    setIsUploadModalOpen(true);
  };

  const handleSubmitEvidence = async () => {
    if (!selectedWO) return;
    setIsSubmitting(true);
    try {
      // Create a mock canvas jpeg for demo evidence upload
      const canvas = document.createElement("canvas");
      canvas.width = 640;
      canvas.height = 360;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.fillStyle = "#1e293b";
        ctx.fillRect(0, 0, 640, 360);
        ctx.fillStyle = "#10b981";
        ctx.font = "bold 24px sans-serif";
        ctx.fillText("NMC REPAIR EVIDENCE VERIFIED", 50, 180);
        ctx.fillStyle = "#94a3b8";
        ctx.font = "16px monospace";
        ctx.fillText(`Work Order: ${selectedWO.workOrderNumber}`, 50, 220);
        ctx.fillText(`Timestamp: ${new Date().toISOString()}`, 50, 250);
      }
      const imageBase64 = canvas.toDataURL("image/jpeg", 0.85);

      const res = await fetch(`/api/work-orders/${selectedWO._id}/evidence`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64,
          completionNotes,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSuccessMsg("Evidence submitted! Work order sent to Engineering Verification Queue.");
        setTimeout(() => {
          setIsUploadModalOpen(false);
          setSuccessMsg(null);
          fetchWorkOrders();
        }, 1500);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "VERIFIED":
        return "success";
      case "SUBMITTED_FOR_VERIFICATION":
        return "purple";
      case "IN_PROGRESS":
        return "info";
      case "REOPENED":
        return "danger";
      default:
        return "default";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2.5">
            <Wrench className="w-6 h-6 text-blue-400" />
            Field Work Orders & Maintenance Dispatch
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Track contractor repair assignments, manage progress, and upload verifiable completion evidence.
          </p>
        </div>
        <Badge variant="info" size="md">
          {workOrders.length} Active Work Orders
        </Badge>
      </div>

      {/* Work Orders List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {workOrders.map((wo) => (
          <div
            key={wo._id}
            className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between gap-4 shadow-xl"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-sky-400">{wo.workOrderNumber}</span>
                <Badge variant={getStatusVariant(wo.status)} size="sm">
                  {wo.status.replace("_", " ")}
                </Badge>
              </div>

              <div>
                <span className="text-[11px] font-mono text-slate-400 block">
                  Ref: {wo.issueId?.referenceCode}
                </span>
                <h3 className="text-sm font-bold text-white leading-snug mt-0.5">{wo.issueId?.title}</h3>
              </div>

              <div className="text-xs text-slate-400 space-y-1">
                <div className="flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-slate-500" />
                  <span>{wo.contractorName || "Nagpur City Infra Team"}</span>
                </div>
                <div className="flex items-center gap-1 text-amber-400">
                  <Clock className="w-3.5 h-3.5" />
                  <span>SLA Due: {new Date(wo.dueAt).toLocaleDateString()} ({new Date(wo.dueAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})</span>
                </div>
              </div>

              {wo.completionNotes && (
                <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-[11px] text-slate-300">
                  <strong className="text-slate-400 block mb-0.5">Field Notes:</strong>
                  {wo.completionNotes}
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
              <span className="text-[11px] text-slate-500 font-mono">
                {wo.evidenceIds?.length || 0} photo(s)
              </span>

              {wo.status !== "VERIFIED" && (
                <Button size="sm" variant="primary" onClick={() => handleOpenUpload(wo)}>
                  <Upload className="w-3.5 h-3.5 mr-1" />
                  Upload Repair Photo
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Upload Evidence Modal */}
      <Modal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        title={`Submit Repair Evidence: ${selectedWO?.workOrderNumber}`}
      >
        {successMsg ? (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs text-center flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            {successMsg}
          </div>
        ) : (
          <div className="space-y-4 text-xs">
            <p className="text-slate-400">
              Submit timestamped photographic repair evidence for <strong className="text-white">{selectedWO?.issueId?.title}</strong>.
            </p>

            <div className="p-4 rounded-2xl bg-slate-950 border border-dashed border-slate-700 flex flex-col items-center justify-center text-center gap-2">
              <FileImage className="w-8 h-8 text-sky-400" />
              <div className="text-xs font-semibold text-slate-200">Field Camera Photo Captured</div>
              <span className="text-[10px] text-slate-500">Auto-tagged with GPS Coordinates & Timestamp</span>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Contractor Completion Notes</label>
              <textarea
                rows={3}
                value={completionNotes}
                onChange={(e) => setCompletionNotes(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-blue-500 resize-none"
              />
            </div>

            <div className="pt-3 flex justify-end gap-2">
              <Button size="sm" variant="secondary" onClick={() => setIsUploadModalOpen(false)}>
                Cancel
              </Button>
              <Button size="sm" variant="success" isLoading={isSubmitting} onClick={handleSubmitEvidence}>
                <Send className="w-3.5 h-3.5 mr-1" />
                Submit for Engineering Verification
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
