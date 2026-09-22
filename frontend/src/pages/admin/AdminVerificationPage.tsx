import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RotateCcw,
  MapPin,
  Clock,
  ShieldCheck,
  Building2,
  FileText,
  Camera,
  Sparkles,
  Search,
} from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { adminService } from '../../services/adminService';

export const AdminVerificationPage: React.FC = () => {
  const [workOrders, setWorkOrders] = useState<any[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [verificationNotes, setVerificationNotes] = useState('');
  const [actionType, setActionType] = useState<'APPROVE' | 'REOPEN'>('APPROVE');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const data = await adminService.getWorkOrders();
      setWorkOrders(data);
      if (data.length > 0 && !selectedOrder) {
        setSelectedOrder(data[0]);
      }
    } catch (err) {
      console.error('Failed to load verification tickets:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleVerify = async () => {
    if (!selectedOrder) return;
    setIsSubmitting(true);
    try {
      const res = await adminService.verifyWorkOrder(
        selectedOrder._id,
        actionType,
        verificationNotes ||
          (actionType === 'APPROVE'
            ? 'Quality inspection passed. Defect closure verified.'
            : 'Quality standards not met. Reopened for corrective work.')
      );

      setFeedback(res.message);
      setTimeout(() => {
        setIsModalOpen(false);
        setFeedback(null);
        setVerificationNotes('');
        fetchOrders();
      }, 1200);
    } catch (err: any) {
      console.error('Verification failed:', err);
      alert(err.message || 'Verification action failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const initialPhoto =
    selectedOrder?.issueId?.evidencePhotos?.[0] ||
    selectedOrder?.issueId?.initialDetectionFrame ||
    (Array.isArray(selectedOrder?.issueId?.evidencePhotos) && selectedOrder?.issueId?.evidencePhotos.length > 0
      ? selectedOrder?.issueId?.evidencePhotos[0]
      : null);

  const repairPhoto =
    selectedOrder?.evidenceIds?.[0]?.fileUrl ||
    selectedOrder?.evidenceIds?.[0]?.mediaUrl ||
    (typeof selectedOrder?.evidenceIds?.[0] === 'string' && selectedOrder?.evidenceIds?.[0]?.startsWith('/')
      ? selectedOrder?.evidenceIds?.[0]
      : null) ||
    selectedOrder?.completionEvidenceUrl;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-xs font-bold text-emerald-400 mb-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            Engineering Quality Assurance
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
            Repair Verification & Sign-Off Workbench
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Compare initial defect photos against contractor completion evidence to eliminate false closures.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="p-12 text-center text-xs text-slate-400 bg-[#0f172a]/70 rounded-3xl border border-white/[0.08]">
          Loading verification workbench...
        </div>
      ) : workOrders.length === 0 ? (
        <div className="p-12 text-center text-xs text-slate-400 bg-[#0f172a]/70 rounded-3xl border border-white/[0.08]">
          No work orders available for verification.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Work Orders List */}
          <div className="lg:col-span-5 space-y-3">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>Verification Queue ({workOrders.length})</span>
              <span className="text-[10px] text-slate-500 font-mono">Live Sync</span>
            </div>

            <div className="space-y-2.5 max-h-[640px] overflow-y-auto pr-1">
              {workOrders.map((wo) => {
                const isSelected = selectedOrder?._id === wo._id;
                const hasAfterProof = wo.evidenceIds && wo.evidenceIds.length > 0;

                return (
                  <div
                    key={wo._id}
                    onClick={() => setSelectedOrder(wo)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-blue-600/20 border-blue-500 shadow-lg ring-1 ring-blue-400/30'
                        : 'bg-[#0f172a]/70 border-white/[0.06] hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-xs font-bold text-sky-400">{wo.workOrderNumber}</span>
                      <Badge
                        variant={
                          wo.status === 'VERIFIED'
                            ? 'success'
                            : wo.status === 'SUBMITTED_FOR_VERIFICATION'
                            ? 'warning'
                            : 'info'
                        }
                        size="sm"
                      >
                        {wo.status.replace(/_/g, ' ')}
                      </Badge>
                    </div>

                    <div className="text-xs font-bold text-white mt-1 line-clamp-1">
                      {wo.issueId?.title || 'Defect Review'}
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                      <span>{wo.contractorName || 'NMC Field Agency'}</span>
                      {hasAfterProof && (
                        <span className="text-emerald-400 font-mono text-[10px] font-bold">Photo Attached ✓</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Comparison Workbench */}
          <div className="lg:col-span-7">
            {selectedOrder ? (
              <div className="p-6 rounded-3xl bg-[#0f172a]/80 backdrop-blur-xl border border-white/[0.08] shadow-2xl space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-white/[0.08]">
                  <div>
                    <span className="font-mono text-xs font-bold text-sky-400">
                      {selectedOrder.workOrderNumber}
                    </span>
                    <h3 className="text-lg font-black text-white mt-0.5">
                      {selectedOrder.issueId?.title || 'Defect Quality Review'}
                    </h3>
                  </div>
                  <Badge variant="outline" size="sm">
                    Contractor: {selectedOrder.contractorName || 'Assigned Agency'}
                  </Badge>
                </div>

                {/* Before vs After Photo Proof */}
                <div className="space-y-3">
                  <div className="text-xs font-extrabold text-slate-200 uppercase tracking-wider flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Camera className="w-4 h-4 text-emerald-400" /> Photographic Proof Comparison
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">Side-by-Side Audit</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Before */}
                    <div className="space-y-1.5">
                      <div className="text-[11px] font-bold text-amber-400 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> BEFORE (Reported Defect)
                      </div>
                      {initialPhoto ? (
                        <div className="aspect-video rounded-2xl bg-slate-950 border border-white/[0.1] overflow-hidden shadow-inner">
                          <img src={initialPhoto} alt="Before" className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="aspect-video rounded-2xl bg-slate-950 border border-dashed border-white/[0.08] flex items-center justify-center p-4 text-center">
                          <span className="text-xs text-slate-500">No initial photo available</span>
                        </div>
                      )}
                    </div>

                    {/* After */}
                    <div className="space-y-1.5">
                      <div className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> AFTER (Contractor Submission)
                      </div>
                      {repairPhoto ? (
                        <div className="aspect-video rounded-2xl bg-slate-950 border border-emerald-500/40 overflow-hidden shadow-inner ring-1 ring-emerald-500/30">
                          <img src={repairPhoto} alt="After" className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="aspect-video rounded-2xl bg-slate-950 border border-dashed border-white/[0.08] flex items-center justify-center p-4 text-center">
                          <span className="text-xs text-slate-500">No repair evidence submitted yet</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Notes */}
                {selectedOrder.completionNotes && (
                  <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-white/[0.06] space-y-1 text-xs">
                    <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">
                      Contractor Notes:
                    </span>
                    <p className="text-slate-300">{selectedOrder.completionNotes}</p>
                  </div>
                )}

                {/* Verification Actions */}
                <div className="p-4 rounded-2xl bg-slate-950/80 border border-white/[0.08] space-y-3">
                  <div className="text-xs font-bold text-slate-300">
                    Municipal Quality Sign-Off Decision:
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      size="md"
                      variant="success"
                      className="flex-1 font-bold text-xs"
                      onClick={() => {
                        setActionType('APPROVE');
                        setIsModalOpen(true);
                      }}
                    >
                      <ShieldCheck className="w-4 h-4 mr-1.5" />
                      Approve & Mark Resolved
                    </Button>

                    <Button
                      size="md"
                      variant="danger"
                      className="flex-1 font-bold text-xs"
                      onClick={() => {
                        setActionType('REOPEN');
                        setIsModalOpen(true);
                      }}
                    >
                      <RotateCcw className="w-4 h-4 mr-1.5" />
                      Reject & Reopen for Rework
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-12 text-center text-xs text-slate-400 bg-[#0f172a]/70 rounded-3xl border border-white/[0.08]">
                Select a work order from the queue to inspect photos.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={actionType === 'APPROVE' ? 'Confirm Quality Sign-Off' : 'Reject & Reopen Work Order'}
      >
        <div className="space-y-4">
          {feedback ? (
            <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs font-bold text-center">
              {feedback}
            </div>
          ) : (
            <>
              <p className="text-xs text-slate-300">
                {actionType === 'APPROVE'
                  ? 'Are you satisfied with the photographic evidence? Approving will mark this grievance as officially RESOLVED and record your audit signature.'
                  : 'Rejecting this work order will reopen the defect and notify the contractor that the repair failed municipal inspection.'}
              </p>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                  Verification Comments:
                </label>
                <textarea
                  rows={3}
                  value={verificationNotes}
                  onChange={(e) => setVerificationNotes(e.target.value)}
                  placeholder={
                    actionType === 'APPROVE'
                      ? 'e.g. Inspected on-site. Asphalt compacted and flush with road surface.'
                      : 'e.g. Edges not properly sealed. Rework required within 12 hours.'
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/[0.1] text-white text-xs focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <Button size="sm" variant="secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button
                  size="sm"
                  variant={actionType === 'APPROVE' ? 'success' : 'danger'}
                  onClick={handleVerify}
                  disabled={isSubmitting}
                >
                  {isSubmitting
                    ? 'Processing...'
                    : actionType === 'APPROVE'
                    ? 'Confirm Approval'
                    : 'Confirm Reopen'}
                </Button>
              </div>
            </>
          )}
        </div>
      </Modal>
    </div>
  );
};
