import React, { useState, useEffect, useRef } from 'react';
import {
  Wrench,
  Clock,
  CheckCircle2,
  Upload,
  AlertCircle,
  Building2,
  Camera,
  X,
  RefreshCw,
} from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { adminService } from '../../services/adminService';
import { workOrderService } from '../../services/workOrderService';

export const AdminWorkOrdersPage: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [workOrders, setWorkOrders] = useState<any[]>([]);
  const [activeOrder, setActiveOrder] = useState<any | null>(null);
  const [isEvidenceModalOpen, setIsEvidenceModalOpen] = useState(false);
  const [notes, setNotes] = useState('');
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const data = await adminService.getWorkOrders();
      setWorkOrders(data);
    } catch (err) {
      console.error('Failed to load work orders:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setImageBase64(base64);
      setImagePreview(base64);
    };
    reader.readAsDataURL(file);
  };

  const removePhoto = () => {
    setImageBase64(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleOpenEvidenceModal = (wo: any) => {
    setActiveOrder(wo);
    setNotes('');
    removePhoto();
    setIsEvidenceModalOpen(true);
  };

  const handleUploadEvidence = async () => {
    if (!activeOrder) return;
    if (!imageBase64) {
      alert('Please upload a completion photo of the repaired defect.');
      return;
    }

    setIsUploading(true);
    try {
      const res = await workOrderService.uploadEvidence(activeOrder._id, {
        imageBase64,
        completionNotes: notes || 'Repairs completed and site compacted as per NMC specifications.',
        evidenceType: 'AFTER_REPAIR',
      });

      setFeedback(res.message || 'Evidence uploaded successfully.');
      setTimeout(() => {
        setIsEvidenceModalOpen(false);
        setFeedback(null);
        removePhoto();
        fetchOrders();
      }, 1200);
    } catch (err: any) {
      console.error('Upload failed:', err);
      alert(err.message || 'Failed to upload completion evidence.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Wrench className="w-7 h-7 text-amber-400" />
            Field Work Orders & Contractor Dispatch
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Monitor contractor repair assignments, track SLA deadlines, and submit verified completion evidence photos.
          </p>
        </div>

        <button
          onClick={fetchOrders}
          className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-all self-start sm:self-auto"
          title="Refresh work orders"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Orders Grid */}
      {isLoading ? (
        <div className="p-12 text-center text-xs text-slate-400 bg-[#111c44] rounded-3xl border border-slate-800">
          Loading work orders...
        </div>
      ) : workOrders.length === 0 ? (
        <div className="p-12 text-center text-xs text-slate-400 bg-[#111c44] rounded-3xl border border-slate-800">
          No active work orders dispatched yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {workOrders.map((wo) => (
            <div
              key={wo._id}
              className="p-5 rounded-2xl bg-[#111c44] border border-slate-700/80 hover:border-slate-600 transition-all flex flex-col justify-between gap-4 shadow-lg"
            >
              <div className="space-y-2">
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

                <h3 className="text-sm sm:text-base font-bold text-white line-clamp-1">
                  {wo.issueId?.title || 'Civic Infrastructure Repair'}
                </h3>

                <div className="text-xs text-slate-400 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                  <span className="truncate">Agency: {wo.contractorName || 'Assigned Crew'}</span>
                </div>

                <div className="text-xs text-slate-400 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                  <span>SLA Due: {new Date(wo.dueAt).toLocaleString()}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                {wo.status === 'VERIFIED' ? (
                  <span className="text-emerald-400 font-bold text-xs flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Quality Approved
                  </span>
                ) : (
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => handleOpenEvidenceModal(wo)}
                  >
                    <Upload className="w-3.5 h-3.5 mr-1" />
                    Submit Repair Evidence
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Evidence Submission Modal with REAL File Input */}
      <Modal
        isOpen={isEvidenceModalOpen}
        onClose={() => setIsEvidenceModalOpen(false)}
        title={`Upload Completion Proof: ${activeOrder?.workOrderNumber}`}
      >
        {feedback ? (
          <div className="p-6 text-center space-y-2 text-emerald-400">
            <CheckCircle2 className="w-10 h-10 mx-auto animate-bounce" />
            <div className="font-bold text-sm">{feedback}</div>
          </div>
        ) : (
          <div className="space-y-4 text-xs">
            <p className="text-slate-300">
              Contractor must upload clear photographic proof showing the completed asphalt repair, cleared waste, or restored infrastructure.
            </p>

            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />

            {imagePreview ? (
              <div className="relative rounded-2xl overflow-hidden border border-emerald-500/50 bg-slate-950 p-2">
                <img src={imagePreview} alt="Repair Evidence" className="w-full max-h-48 object-cover rounded-xl" />
                <button
                  type="button"
                  onClick={removePhoto}
                  className="absolute top-4 right-4 p-1.5 rounded-full bg-rose-600 hover:bg-rose-500 text-white shadow-md"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="p-5 rounded-2xl bg-slate-950 border border-dashed border-slate-700 hover:border-emerald-500 text-center space-y-2 cursor-pointer transition-colors"
              >
                <Camera className="w-8 h-8 text-emerald-400 mx-auto" />
                <div className="font-semibold text-white">Select / Capture Repair Photo</div>
                <div className="text-[10px] text-slate-500">JPG, PNG, WebP supported</div>
              </div>
            )}

            <div className="space-y-1">
              <label className="block font-semibold text-slate-300">Field Completion Notes</label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Explain materials used, sub-base compaction, or quality details..."
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="pt-2 flex gap-2">
              <Button
                variant="primary"
                size="md"
                className="flex-1 font-bold"
                onClick={handleUploadEvidence}
                isLoading={isUploading}
              >
                Submit for Engineering Inspection
              </Button>
              <Button
                variant="secondary"
                size="md"
                onClick={() => setIsEvidenceModalOpen(false)}
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
