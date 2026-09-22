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
    selectedOrder?.issueId?.evidencePhotos?.[0] || selectedOrder?.issueId?.initialDetectionFrame;
  const repairPhoto = selectedOrder?.evidenceIds?.[0]?.fileUrl;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
            <CheckCircle2 className="w-7 h-7 text-emerald-400" />
            Quality Engineering & Repair Verification
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Compare initial defect photos against contractor completion evidence to eliminate false closures.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="p-12 text-center text-xs text-slate-400 bg-[#111c44] rounded-3xl border border-slate-800">
          Loading verification workbench...
        </div>
      ) : workOrders.length === 0 ? (
        <div className="p-12 text-center text-xs text-slate-400 bg-[#111c44] rounded-3xl border border-slate-800">
          No work orders available for verification.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Work Orders List */}
          <div className="lg:col-span-5 space-y-3">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Verification Queue ({workOrders.length})
            </div>
            <div className="space-y-2.5 max-h-[620px] overflow-y-auto pr-1">
              {workOrders.map((wo) => {
                const isSelected = selectedOrder?._id === wo._id;
                return (
                  <div
                    key={wo._id}
                    onClick={() => setSelectedOrder(wo)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-blue-600/20 border-blue-500 shadow-lg'
                        : 'bg-[#111c44] border-slate-700/80 hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-xs font-bold text-sky-400">{wo.workOrderNumber}</span>
                      <Badge
                        variant={
                          wo.status === 'VERIFIED'
                            ? 'success'
                            : wo.status === 'SUBMITTED_FOR_VERIFICATION'
                            ? 'info'
                            : 'warning'
                        }
                        size="sm"
                      >
                        {wo.status}
                      </Badge>
                    </div>
                    <h4 className="text-sm font-bold text-white mt-1 line-clamp-1">
                      {wo.issueId?.title || 'Defect Resolution'}
                    </h4>
                    <div className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-sky-400 flex-shrink-0" />
                      <span className="truncate">{wo.issueId?.location?.addressText || 'Nagpur'}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Comparison Workbench */}
          <div className="lg:col-span-7">
            {selectedOrder ? (
              <div className="p-6 rounded-3xl bg-[#111c44] border border-slate-700/80 shadow-2xl space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
                  <div>
                    <span className="font-mono text-xs font-bold text-sky-400">
                      {selectedOrder.workOrderNumber}
                    </span>
                    <h3 className="text-lg font-extrabold text-white mt-0.5">
                      {selectedOrder.issueId?.title || 'Defect Quality Review'}
                    </h3>
                  </div>
                  <Badge variant="outline" size="sm">
                    Contractor: {selectedOrder.contractorName || 'Assigned Agency'}
                  </Badge>
                </div>

                {/* Before vs After Photo Proof */}
                <div className="space-y-2">
                  <div className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Camera className="w-4 h-4 text-emerald-400" /> Photographic Proof Comparison
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Before */}
                    <div className="space-y-1.5">
                      <div className="text-[11px] font-bold text-amber-400 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> BEFORE (Reported Defect)
                      </div>
                      {initialPhoto ? (
                        <div className="aspect-video rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden">
                          <img src={initialPhoto} alt="Before" className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="aspect-video rounded-2xl bg-slate-950 border border-dashed border-slate-800 flex items-center justify-center p-4 text-center">
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
                        <div className="aspect-video rounded-2xl bg-slate-950 border border-emerald-500/40 overflow-hidden shadow-inner">
                          <img src={repairPhoto} alt="After" className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="aspect-video rounded-2xl bg-slate-950 border border-dashed border-slate-800 flex items-center justify-center p-4 text-center">
                          <span className="text-xs text-slate-500">No repair evidence submitted yet</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Notes */}
                {selectedOrder.completionNotes && (
                  <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1 text-xs">
                    <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">
                      Contractor Notes:
                    </span>
                    <p className="text-slate-300">{selectedOrder.completionNotes}</p>
                  </div>
                )}

                {/* Verification Actions */}
                <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
                  <div className="text-xs font-semibold text-slate-300">
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
              <div className="p-12 text-center text-xs text-slate-400 bg-[#111c44] rounded-3xl border border-slate-800">
                Select a ticket from the queue to inspect photographic evidence.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={actionType === 'APPROVE' ? 'Confirm Quality Sign-Off' : 'Confirm Defect Reopening'}
      >
        {feedback ? (
          <div className="p-6 text-center space-y-2 text-emerald-400">
            <CheckCircle2 className="w-10 h-10 mx-auto animate-bounce" />
            <div className="font-bold text-sm">{feedback}</div>
          </div>
        ) : (
          <div className="space-y-4 text-xs">
            <p className="text-slate-300">
              {actionType === 'APPROVE'
                ? 'Approving this work order will close the grievance and notify the reporting citizen.'
                : 'Rejecting this work order will return it to the contractor with required corrections.'}
            </p>

            <div className="space-y-1">
              <label className="block font-semibold text-slate-300">Engineering Audit Notes</label>
              <textarea
                rows={3}
                value={verificationNotes}
                onChange={(e) => setVerificationNotes(e.target.value)}
                placeholder="Enter engineering notes or reasons for approval/rejection..."
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="pt-2 flex gap-2">
              <Button
                variant={actionType === 'APPROVE' ? 'success' : 'danger'}
                size="md"
                className="flex-1 font-bold"
                onClick={handleVerify}
                isLoading={isSubmitting}
              >
                Confirm {actionType === 'APPROVE' ? 'Approval' : 'Rejection'}
              </Button>
              <Button
                variant="secondary"
                size="md"
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
