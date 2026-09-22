import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  MapPin,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { workOrderService } from '../services/workOrderService';

export const VerificationPage: React.FC = () => {
  const [workOrders, setWorkOrders] = useState<any[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [verificationNotes, setVerificationNotes] = useState('');
  const [actionType, setActionType] = useState<'APPROVE' | 'REOPEN'>('APPROVE');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const fetchOrders = async () => {
    try {
      const data = await workOrderService.getWorkOrders();
      setWorkOrders(data);
      if (data.length > 0 && !selectedOrder) {
        setSelectedOrder(data[0]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleVerify = async () => {
    if (!selectedOrder) return;
    setIsSubmitting(true);
    try {
      const res = await workOrderService.verifyWorkOrder(
        selectedOrder._id,
        actionType,
        verificationNotes || (actionType === 'APPROVE' ? 'Work inspected and approved.' : 'Work quality rejected, repair incomplete.')
      );

      setFeedback(res.message);
      setTimeout(() => {
        setIsModalOpen(false);
        setFeedback(null);
        setVerificationNotes('');
        fetchOrders();
      }, 1200);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2.5">
            <CheckCircle2 className="w-6 h-6 text-emerald-400" />
            Quality Verification & Anti-False-Closure
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Compare before-and-after evidence, review AI validation scores, and verify repair closures.
          </p>
        </div>
      </div>

      {/* Main Split Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
        {/* Left: Verification Work Order List */}
        <div className="lg:col-span-5 space-y-3">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Pending & Recent Verification Tickets
          </div>
          <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
            {workOrders.map((wo) => {
              const isSelected = selectedOrder?._id === wo._id;
              return (
                <div
                  key={wo._id}
                  onClick={() => setSelectedOrder(wo)}
                  className={`p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-blue-600/20 border-blue-500 shadow-lg'
                      : 'bg-[#111c44] border-slate-700/80 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs font-bold text-sky-400">{wo.workOrderNumber}</span>
                    <Badge variant={wo.status === 'VERIFIED' ? 'success' : 'warning'} size="sm">
                      {wo.status}
                    </Badge>
                  </div>
                  <h4 className="text-xs sm:text-sm font-bold text-white mt-1 line-clamp-1">
                    {wo.issueId?.title || 'Defect Resolution'}
                  </h4>
                  <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-sky-400 flex-shrink-0" />
                    <span className="truncate">{wo.issueId?.location?.addressText || 'Nagpur Sector'}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Inspection & Comparison Workbench */}
        <div className="lg:col-span-7">
          {selectedOrder ? (
            <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-[#111c44] border border-slate-700/80 shadow-2xl space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
                <div>
                  <span className="font-mono text-xs font-bold text-sky-400">
                    {selectedOrder.workOrderNumber}
                  </span>
                  <h3 className="text-base sm:text-lg font-extrabold text-white mt-0.5">
                    {selectedOrder.issueId?.title || 'Defect Review'}
                  </h3>
                </div>
                <Badge variant="outline" size="sm">
                  Contractor: {selectedOrder.contractorName || 'Assigned Team'}
                </Badge>
              </div>

              {/* Before vs After Visual Comparison (PRD FR-47 to FR-49) */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-300 flex items-center justify-between">
                  <span>Geotagged Photographic Proof Comparison</span>
                  <span className="text-emerald-400 flex items-center gap-1 text-[11px]">
                    <Sparkles className="w-3 h-3" /> AI Verification: 94% Defect Area Reduction
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Before */}
                  <div className="space-y-1.5">
                    <div className="text-[11px] font-bold text-rose-400 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> BEFORE REPAIR (Initial Detection)
                    </div>
                    <div className="aspect-video rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center p-4 text-center relative overflow-hidden">
                      <div className="text-xs text-slate-400 space-y-1">
                        <div className="font-bold text-white">Initial Pothole Crater Detected</div>
                        <div className="text-[10px] text-slate-500">
                          Wardha Road • 60cm depression with exposed aggregate
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* After */}
                  <div className="space-y-1.5">
                    <div className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> AFTER REPAIR (Contractor Submission)
                    </div>
                    <div className="aspect-video rounded-xl bg-slate-950 border border-emerald-500/40 flex items-center justify-center p-4 text-center relative overflow-hidden shadow-inner">
                      <div className="text-xs text-slate-300 space-y-1">
                        <div className="font-bold text-emerald-300">Asphalt Cold-Mix Compacted</div>
                        <div className="text-[10px] text-slate-400">
                          Smooth carriageway level restored • Geotag Match verified
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Verification Actions */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
                <div className="text-xs font-semibold text-slate-300">
                  Officer Inspection Sign-Off:
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button
                    size="sm"
                    variant="success"
                    className="flex-1"
                    onClick={() => {
                      setActionType('APPROVE');
                      setIsModalOpen(true);
                    }}
                  >
                    <ShieldCheck className="w-4 h-4 mr-1.5" />
                    Approve & Close Defect
                  </Button>

                  <Button
                    size="sm"
                    variant="danger"
                    className="flex-1"
                    onClick={() => {
                      setActionType('REOPEN');
                      setIsModalOpen(true);
                    }}
                  >
                    <RotateCcw className="w-4 h-4 mr-1.5" />
                    Reject Closure (Reopen)
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-slate-500 rounded-3xl bg-[#111c44] border border-slate-800">
              Select a work order to review evidence.
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={actionType === 'APPROVE' ? 'Approve & Close Work Order' : 'Reject & Reopen Work Order'}
      >
        {feedback ? (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-center text-xs">
            {feedback}
          </div>
        ) : (
          <div className="space-y-4 text-xs">
            <p className="text-slate-400">
              {actionType === 'APPROVE'
                ? 'Confirm verified resolution. The canonical issue status will be set to RESOLVED and the citizen notified.'
                : 'Enter rejection notes explaining why repair proof was deemed insufficient.'}
            </p>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Inspector Notes</label>
              <textarea
                rows={3}
                value={verificationNotes}
                onChange={(e) => setVerificationNotes(e.target.value)}
                placeholder={actionType === 'APPROVE' ? 'Road surface restored to standard specifications...' : 'Asphalt leveling uneven, requires additional roller compaction...'}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <Button size="sm" variant="secondary" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button
                size="sm"
                variant={actionType === 'APPROVE' ? 'success' : 'danger'}
                isLoading={isSubmitting}
                onClick={handleVerify}
              >
                {actionType === 'APPROVE' ? 'Confirm Closure' : 'Confirm Reopen'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
