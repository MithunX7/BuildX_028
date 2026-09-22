import React, { useState, useEffect } from 'react';
import {
  Wrench,
  Clock,
  CheckCircle2,
  Upload,
  AlertCircle,
  Building2,
} from 'lucide-react';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { workOrderService } from '../services/workOrderService';

export const WorkOrdersPage: React.FC = () => {
  const [workOrders, setWorkOrders] = useState<any[]>([]);
  const [activeOrder, setActiveOrder] = useState<any | null>(null);
  const [isEvidenceModalOpen, setIsEvidenceModalOpen] = useState(false);
  const [notes, setNotes] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const fetchOrders = async () => {
    try {
      const data = await workOrderService.getWorkOrders();
      setWorkOrders(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleUploadEvidence = async () => {
    if (!activeOrder) return;
    setIsUploading(true);
    try {
      // Create a 1x1 base64 png demonstration evidence payload
      const mockEvidenceBase64 =
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

      const res = await workOrderService.uploadEvidence(activeOrder._id, {
        imageBase64: mockEvidenceBase64,
        completionNotes: notes || 'Pothole cold-mix asphalt repair completed and compacted.',
        evidenceType: 'AFTER_REPAIR',
      });

      setFeedback(res.message);
      setTimeout(() => {
        setIsEvidenceModalOpen(false);
        setFeedback(null);
        setNotes('');
        fetchOrders();
      }, 1200);
    } catch (err) {
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2.5">
            <Wrench className="w-6 h-6 text-amber-400" />
            Field Work Orders & Repair Dispatch
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Track active contractor dispatches, monitor SLA countdowns, and submit completion evidence.
          </p>
        </div>
      </div>

      {/* Orders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {workOrders.map((wo) => (
          <div
            key={wo._id}
            className="p-4 sm:p-5 rounded-2xl bg-[#111c44] border border-slate-700/80 hover:border-slate-600 transition-all flex flex-col justify-between gap-3 shadow-lg"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-xs font-bold text-sky-400">{wo.workOrderNumber}</span>
                <Badge variant={wo.status === 'VERIFIED' ? 'success' : 'warning'} size="sm">
                  {wo.status}
                </Badge>
              </div>

              <h3 className="text-sm sm:text-base font-bold text-white line-clamp-1">
                {wo.issueId?.title || 'Road Defect Resolution'}
              </h3>

              <div className="text-xs text-slate-400 flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                <span className="truncate">Contractor: {wo.contractorName || 'Assigned Agency'}</span>
              </div>

              <div className="text-xs text-slate-400 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                <span>Due: {new Date(wo.dueAt).toLocaleString()}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
              <span className="text-[11px] text-slate-500 font-mono">
                {wo.evidenceIds?.length || 0} proof photo(s)
              </span>

              {wo.status !== 'VERIFIED' && (
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => {
                    setActiveOrder(wo);
                    setIsEvidenceModalOpen(true);
                  }}
                >
                  <Upload className="w-3 h-3 mr-1" />
                  Submit Proof
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Proof Upload Modal */}
      <Modal
        isOpen={isEvidenceModalOpen}
        onClose={() => setIsEvidenceModalOpen(false)}
        title={activeOrder ? `Upload Repair Proof: ${activeOrder.workOrderNumber}` : 'Upload Evidence'}
      >
        {feedback ? (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-center text-xs">
            {feedback}
          </div>
        ) : (
          <div className="space-y-4 text-xs">
            <p className="text-slate-400">
              Submit geotagged repair proof for inspection and verification.
            </p>

            <div className="p-4 rounded-xl bg-slate-950/70 border border-dashed border-slate-700 text-center space-y-2">
              <Upload className="w-6 h-6 text-blue-400 mx-auto" />
              <div className="text-white font-semibold">After-Repair Camera Snapshot</div>
              <div className="text-[11px] text-slate-500">
                Sample geotagged camera proof automatically generated for demo verification
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Work Completion Notes</label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Details of materials used (e.g., asphalt cold-mix, roller compaction, luminaire replaced)..."
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <Button size="sm" variant="secondary" onClick={() => setIsEvidenceModalOpen(false)}>
                Cancel
              </Button>
              <Button size="sm" variant="success" isLoading={isUploading} onClick={handleUploadEvidence}>
                Submit for Verification
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
