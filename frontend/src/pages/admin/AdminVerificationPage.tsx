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
  Maximize2,
  ExternalLink,
  Award,
  Check,
  Calendar,
  UserCheck,
  Filter,
} from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { adminService } from '../../services/adminService';

export const AdminVerificationPage: React.FC = () => {
  const [workOrders, setWorkOrders] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'PENDING' | 'APPROVED'>('PENDING');
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Verification action modal state
  const [verificationNotes, setVerificationNotes] = useState('');
  const [hasAcknowledged, setHasAcknowledged] = useState(false);
  const [actionType, setActionType] = useState<'APPROVE' | 'REOPEN'>('APPROVE');
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // High-res comparison modal state
  const [zoomModalOrder, setZoomModalOrder] = useState<any | null>(null);

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

  const pendingOrders = workOrders.filter(
    (wo) => wo.status === 'SUBMITTED_FOR_VERIFICATION' || wo.status === 'IN_PROGRESS' || wo.status === 'ASSIGNED' || wo.status === 'CREATED'
  );

  const approvedOrders = workOrders.filter(
    (wo) => wo.status === 'VERIFIED' || wo.status === 'RESOLVED'
  );

  const filteredApprovedOrders = approvedOrders.filter((wo) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      wo.workOrderNumber?.toLowerCase().includes(q) ||
      wo.issueId?.referenceCode?.toLowerCase().includes(q) ||
      wo.issueId?.title?.toLowerCase().includes(q) ||
      wo.contractorName?.toLowerCase().includes(q) ||
      wo.departmentId?.name?.toLowerCase().includes(q)
    );
  });

  const handleVerify = async () => {
    if (!selectedOrder) return;
    if (actionType === 'APPROVE' && !hasAcknowledged) {
      alert('Please check the acknowledgment box confirming that Before and After photo evidence has been inspected.');
      return;
    }

    setIsSubmitting(true);
    try {
      const notes = verificationNotes ||
        (actionType === 'APPROVE'
          ? 'Quality inspected and approved. Before and After photo evidence verified against NMC standards.'
          : 'Quality standards not met. Reopened for corrective field work.');

      const res = await adminService.verifyWorkOrder(
        selectedOrder._id,
        actionType,
        notes
      );

      setFeedback(res.message || 'Verification updated successfully.');
      setTimeout(() => {
        setIsVerifyModalOpen(false);
        setFeedback(null);
        setVerificationNotes('');
        setHasAcknowledged(false);
        fetchOrders();
      }, 1200);
    } catch (err: any) {
      console.error('Verification failed:', err);
      alert(err.message || 'Verification action failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const extractPhotos = (order: any) => {
    const initialPhoto =
      order?.issueId?.evidencePhotos?.[0] ||
      order?.issueId?.initialDetectionFrame ||
      (Array.isArray(order?.issueId?.evidencePhotos) && order?.issueId?.evidencePhotos.length > 0
        ? order?.issueId?.evidencePhotos[0]
        : null);

    const repairPhoto =
      order?.evidenceIds?.[0]?.fileUrl ||
      order?.evidenceIds?.[0]?.mediaUrl ||
      (typeof order?.evidenceIds?.[0] === 'string' && order?.evidenceIds?.[0]?.startsWith('/')
        ? order?.evidenceIds?.[0]
        : null) ||
      order?.completionEvidenceUrl;

    return { initialPhoto, repairPhoto };
  };

  const { initialPhoto: selectedInitialPhoto, repairPhoto: selectedRepairPhoto } = extractPhotos(selectedOrder);

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-xs font-bold text-emerald-400 mb-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            NMC Engineering Quality Assurance & Audit
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
            Repair Verification & Acknowledgment Workbench
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Compare initial defect photos against contractor completion evidence to eliminate false closures.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 bg-slate-900/90 p-1.5 rounded-2xl border border-white/[0.08] self-start md:self-auto shadow-inner">
          <button
            onClick={() => {
              setActiveTab('PENDING');
              if (pendingOrders.length > 0) setSelectedOrder(pendingOrders[0]);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'PENDING'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            Pending Review ({pendingOrders.length})
          </button>

          <button
            onClick={() => {
              setActiveTab('APPROVED');
              if (approvedOrders.length > 0) setSelectedOrder(approvedOrders[0]);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'APPROVED'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/25'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            Approved & Acknowledged ({approvedOrders.length})
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="p-16 text-center text-xs text-slate-400 bg-[#0f172a]/70 rounded-3xl border border-white/[0.08]">
          Loading verification workbench...
        </div>
      ) : activeTab === 'PENDING' ? (
        /* ================= TAB 1: PENDING VERIFICATION WORKBENCH ================= */
        pendingOrders.length === 0 ? (
          <div className="p-12 sm:p-16 rounded-3xl bg-[#0f172a]/70 border border-white/[0.08] text-center space-y-4 shadow-xl">
            <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white">All Pending Reviews Cleared!</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                There are no work orders awaiting engineering verification. Switch to the <strong>Approved & Acknowledged</strong> tab to view verified repair certificates.
              </p>
            </div>
            <Button size="sm" variant="secondary" onClick={() => setActiveTab('APPROVED')}>
              View Approved Repairs Archive ({approvedOrders.length})
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Work Orders List */}
            <div className="lg:col-span-5 space-y-3">
              <div className="text-xs font-extrabold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                <span>Inspection Queue ({pendingOrders.length})</span>
                <span className="text-[10px] text-slate-500 font-mono">Live Sync</span>
              </div>

              <div className="space-y-2.5 max-h-[640px] overflow-y-auto pr-1">
                {pendingOrders.map((wo) => {
                  const isSelected = selectedOrder?._id === wo._id;
                  const { initialPhoto, repairPhoto } = extractPhotos(wo);

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
                            wo.status === 'SUBMITTED_FOR_VERIFICATION'
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
                        {repairPhoto ? (
                          <span className="text-emerald-400 font-mono text-[10px] font-bold">Proof Attached ✓</span>
                        ) : (
                          <span className="text-amber-400 font-mono text-[10px]">Awaiting Proof</span>
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
                <div className="p-6 sm:p-8 rounded-3xl bg-[#0f172a]/80 backdrop-blur-xl border border-white/[0.08] shadow-2xl space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-white/[0.08]">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-sky-400">
                          {selectedOrder.workOrderNumber}
                        </span>
                        <span className="text-slate-500">•</span>
                        <span className="font-mono text-xs text-slate-400">
                          {selectedOrder.issueId?.referenceCode}
                        </span>
                      </div>
                      <h3 className="text-lg font-black text-white mt-0.5">
                        {selectedOrder.issueId?.title || 'Defect Quality Review'}
                      </h3>
                    </div>
                    <Badge variant="outline" size="sm">
                      Contractor: {selectedOrder.contractorName || 'Assigned Agency'}
                    </Badge>
                  </div>

                  {/* Side-by-Side Before vs After Photographic Comparison */}
                  <div className="space-y-3">
                    <div className="text-xs font-extrabold text-slate-200 uppercase tracking-wider flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Camera className="w-4 h-4 text-emerald-400" /> Photographic Proof Comparison
                      </span>
                      <button
                        onClick={() => setZoomModalOrder(selectedOrder)}
                        className="text-[11px] text-blue-400 hover:text-blue-300 flex items-center gap-1 font-bold"
                      >
                        <Maximize2 className="w-3.5 h-3.5" /> Fullscreen View
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* BEFORE */}
                      <div className="space-y-1.5">
                        <div className="text-[11px] font-bold text-amber-400 flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5" /> BEFORE (Reported Defect)
                        </div>
                        {selectedInitialPhoto ? (
                          <div
                            onClick={() => setZoomModalOrder(selectedOrder)}
                            className="aspect-video rounded-2xl bg-slate-950 border border-white/[0.1] overflow-hidden shadow-inner cursor-pointer group relative"
                          >
                            <img src={selectedInitialPhoto} alt="Before" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1">
                              <Maximize2 className="w-4 h-4" /> Expand
                            </div>
                          </div>
                        ) : (
                          <div className="aspect-video rounded-2xl bg-slate-950 border border-dashed border-white/[0.08] flex items-center justify-center p-4 text-center">
                            <span className="text-xs text-slate-500">No initial photo available</span>
                          </div>
                        )}
                      </div>

                      {/* AFTER */}
                      <div className="space-y-1.5">
                        <div className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> AFTER (Contractor Submission)
                        </div>
                        {selectedRepairPhoto ? (
                          <div
                            onClick={() => setZoomModalOrder(selectedOrder)}
                            className="aspect-video rounded-2xl bg-slate-950 border border-emerald-500/40 overflow-hidden shadow-inner ring-1 ring-emerald-500/30 cursor-pointer group relative"
                          >
                            <img src={selectedRepairPhoto} alt="After" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1">
                              <Maximize2 className="w-4 h-4" /> Expand
                            </div>
                          </div>
                        ) : (
                          <div className="aspect-video rounded-2xl bg-slate-950 border border-dashed border-white/[0.08] flex items-center justify-center p-4 text-center">
                            <span className="text-xs text-slate-500">No repair evidence submitted yet</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Contractor Completion Notes */}
                  {selectedOrder.completionNotes && (
                    <div className="p-4 rounded-2xl bg-slate-950/70 border border-white/[0.06] space-y-1 text-xs">
                      <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">
                        Contractor Field Notes:
                      </span>
                      <p className="text-slate-200 leading-relaxed">{selectedOrder.completionNotes}</p>
                    </div>
                  )}

                  {/* Verification Decision Action Area */}
                  <div className="p-5 rounded-2xl bg-slate-950/80 border border-white/[0.08] space-y-4">
                    <div>
                      <div className="text-xs font-extrabold text-white">
                        Municipal Quality Sign-Off & Acknowledgment:
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Inspect Before & After photo evidence to ensure repairs meet NMC standards before closing the ticket.
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button
                        size="md"
                        variant="success"
                        className="flex-1 font-bold text-xs py-3"
                        onClick={() => {
                          setActionType('APPROVE');
                          setHasAcknowledged(false);
                          setIsVerifyModalOpen(true);
                        }}
                      >
                        <ShieldCheck className="w-4 h-4 mr-2" />
                        Acknowledge & Approve Repair
                      </Button>

                      <Button
                        size="md"
                        variant="danger"
                        className="flex-1 font-bold text-xs py-3"
                        onClick={() => {
                          setActionType('REOPEN');
                          setIsVerifyModalOpen(true);
                        }}
                      >
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Reject & Reopen for Rework
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-16 text-center text-xs text-slate-400 bg-[#0f172a]/70 rounded-3xl border border-white/[0.08]">
                  Select a work order from the inspection queue.
                </div>
              )}
            </div>
          </div>
        )
      ) : (
        /* ================= TAB 2: APPROVED & ACKNOWLEDGED REPAIRS SECTION ================= */
        <div className="space-y-6">
          {/* Section Sub-header & Filter Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-[#0f172a]/80 backdrop-blur border border-white/[0.08] shadow-lg">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-emerald-400" />
                <h2 className="text-lg sm:text-xl font-black text-white">
                  Approved & Acknowledged Repairs Archive
                </h2>
                <Badge variant="success" size="sm">
                  {approvedOrders.length} Closed & Verified
                </Badge>
              </div>
              <p className="text-xs text-slate-400">
                Official repository of municipal repairs acknowledged and approved by NMC engineers with verified photographic evidence.
              </p>
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search defect, ticket, contractor..."
                className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-slate-900 border border-white/[0.1] text-white text-xs focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {filteredApprovedOrders.length === 0 ? (
            <div className="p-16 rounded-3xl bg-[#0f172a]/70 border border-white/[0.08] text-center space-y-3">
              <ShieldCheck className="w-12 h-12 text-slate-600 mx-auto" />
              <h3 className="text-base font-bold text-white">No Approved Repairs Found</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                {searchQuery
                  ? 'No approved repairs match your search query.'
                  : 'Repairs approved in the pending queue will automatically be certified and archived here.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredApprovedOrders.map((order) => {
                const { initialPhoto, repairPhoto } = extractPhotos(order);
                const verifierName = order.verifiedById?.name || 'Chief Quality Engineer';
                const verifiedDate = order.verifiedAt
                  ? new Date(order.verifiedAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })
                  : 'Verified & Audited';

                return (
                  <div
                    key={order._id}
                    className="p-6 rounded-3xl bg-[#0f172a]/80 backdrop-blur-xl border border-emerald-500/30 shadow-2xl space-y-5 transition-all hover:border-emerald-500/50 flex flex-col justify-between"
                  >
                    <div className="space-y-4">
                      {/* Card Header & Reference Badges */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-white/[0.08]">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-black text-sky-400">
                              {order.workOrderNumber}
                            </span>
                            <span className="text-slate-500">•</span>
                            <span className="font-mono text-xs text-slate-400">
                              {order.issueId?.referenceCode}
                            </span>
                          </div>
                          <h3 className="text-base font-black text-white line-clamp-1">
                            {order.issueId?.title || 'Defect Repaired & Closed'}
                          </h3>
                        </div>

                        <div className="flex items-center gap-2 self-start sm:self-auto">
                          <Badge variant="success" size="sm">
                            VERIFIED & RESOLVED
                          </Badge>
                          <button
                            onClick={() => setZoomModalOrder(order)}
                            className="p-1.5 rounded-lg bg-slate-900 border border-white/[0.1] text-slate-300 hover:text-white transition-colors"
                            title="Inspect high resolution comparison"
                          >
                            <Maximize2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Location & Contractor Info */}
                      <div className="flex items-center justify-between text-xs text-slate-400">
                        <div className="flex items-center gap-1.5 truncate max-w-[240px]">
                          <MapPin className="w-3.5 h-3.5 text-sky-400 flex-shrink-0" />
                          <span className="truncate">{order.issueId?.location?.addressText || 'Nagpur'}</span>
                        </div>
                        <span className="font-semibold text-slate-300">{order.contractorName || 'NMC Field Agency'}</span>
                      </div>

                      {/* Side-by-Side Before vs After Photographic Evidence */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                        {/* Before */}
                        <div className="space-y-1.5">
                          <div className="text-[10px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" /> BEFORE (Reported)
                          </div>
                          {initialPhoto ? (
                            <div
                              onClick={() => setZoomModalOrder(order)}
                              className="aspect-video rounded-2xl bg-slate-950 border border-white/[0.1] overflow-hidden cursor-pointer group relative shadow-inner"
                            >
                              <img src={initialPhoto} alt="Before" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[11px] font-bold">
                                View Fullsize
                              </div>
                            </div>
                          ) : (
                            <div className="aspect-video rounded-2xl bg-slate-950 border border-dashed border-white/[0.08] flex items-center justify-center text-slate-500 text-xs">
                              Initial photo
                            </div>
                          )}
                        </div>

                        {/* After */}
                        <div className="space-y-1.5">
                          <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> AFTER (Repair Proof)
                          </div>
                          {repairPhoto ? (
                            <div
                              onClick={() => setZoomModalOrder(order)}
                              className="aspect-video rounded-2xl bg-slate-950 border border-emerald-500/40 ring-1 ring-emerald-500/30 overflow-hidden cursor-pointer group relative shadow-inner"
                            >
                              <img src={repairPhoto} alt="After" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[11px] font-bold">
                                View Fullsize
                              </div>
                            </div>
                          ) : (
                            <div className="aspect-video rounded-2xl bg-slate-950 border border-dashed border-white/[0.08] flex items-center justify-center text-slate-500 text-xs">
                              Repair evidence
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Official Quality Acknowledgment Certificate Box */}
                      <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-extrabold text-emerald-400 flex items-center gap-1.5">
                            <Check className="w-4 h-4 text-emerald-400 stroke-[3]" />
                            Official NMC Quality Acknowledged
                          </span>
                          <span className="text-[10px] font-mono text-emerald-300">Certified ✓</span>
                        </div>

                        <div className="text-[11px] text-slate-300 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400">Verified By:</span>
                            <span className="font-bold text-white">{verifierName}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400">Signed Off At:</span>
                            <span className="font-mono text-slate-300">{verifiedDate}</span>
                          </div>
                          {order.verificationNotes && (
                            <div className="pt-1 text-[11px] text-emerald-200/90 italic border-t border-emerald-500/20 mt-1">
                              "{order.verificationNotes}"
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs">
                      <span className="text-[11px] text-slate-400">
                        Department: <strong className="text-slate-200">{order.departmentId?.name || 'Roads & Traffic'}</strong>
                      </span>
                      <button
                        onClick={() => setZoomModalOrder(order)}
                        className="inline-flex items-center gap-1 text-xs font-bold text-blue-400 hover:text-blue-300"
                      >
                        High-Res Inspection <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Verification Sign-Off Modal */}
      <Modal
        isOpen={isVerifyModalOpen}
        onClose={() => setIsVerifyModalOpen(false)}
        title={actionType === 'APPROVE' ? 'Official NMC Repair Acknowledgment & Sign-Off' : 'Reject & Reopen Work Order'}
      >
        <div className="space-y-5">
          {feedback ? (
            <div className="p-5 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs font-bold text-center space-y-1">
              <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-400" />
              <div>{feedback}</div>
            </div>
          ) : (
            <>
              {/* Mini Preview of Before vs After in Modal */}
              <div className="space-y-2">
                <div className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                  Inspected Photographic Evidence:
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="aspect-video rounded-xl bg-slate-950 border border-white/[0.1] overflow-hidden relative">
                    {selectedInitialPhoto && <img src={selectedInitialPhoto} alt="Before" className="w-full h-full object-cover" />}
                    <div className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-black/70 text-[9px] font-bold text-amber-400">
                      BEFORE
                    </div>
                  </div>
                  <div className="aspect-video rounded-xl bg-slate-950 border border-emerald-500/40 overflow-hidden relative">
                    {selectedRepairPhoto && <img src={selectedRepairPhoto} alt="After" className="w-full h-full object-cover" />}
                    <div className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-black/70 text-[9px] font-bold text-emerald-400">
                      AFTER
                    </div>
                  </div>
                </div>
              </div>

              {actionType === 'APPROVE' ? (
                /* Acknowledgment Checkbox */
                <label className="flex items-start gap-3 p-3.5 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={hasAcknowledged}
                    onChange={(e) => setHasAcknowledged(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 bg-slate-900 border-white/[0.2]"
                  />
                  <span className="text-xs text-emerald-200 leading-snug">
                    <strong>I officially acknowledge</strong> that I have inspected the BEFORE defect photo and AFTER field completion photo, and certify that this repair complies with NMC engineering standards.
                  </span>
                </label>
              ) : (
                <p className="text-xs text-rose-300 bg-rose-500/10 p-3 rounded-xl border border-rose-500/20">
                  Rejecting this repair will mark the work order as REOPENED and require the contractor to perform corrective rework.
                </p>
              )}

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                  Engineering Inspection Comments:
                </label>
                <textarea
                  rows={2}
                  value={verificationNotes}
                  onChange={(e) => setVerificationNotes(e.target.value)}
                  placeholder={
                    actionType === 'APPROVE'
                      ? 'e.g. Inspected site. Road asphalt flush, properly compacted with zero debris.'
                      : 'e.g. Surface uneven and edges unsealed. Rework required within 12 hours.'
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/[0.1] text-white text-xs focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <Button size="sm" variant="secondary" onClick={() => setIsVerifyModalOpen(false)}>
                  Cancel
                </Button>
                <Button
                  size="sm"
                  variant={actionType === 'APPROVE' ? 'success' : 'danger'}
                  onClick={handleVerify}
                  disabled={isSubmitting || (actionType === 'APPROVE' && !hasAcknowledged)}
                >
                  {isSubmitting
                    ? 'Recording Acknowledgment...'
                    : actionType === 'APPROVE'
                    ? 'Acknowledge & Mark Resolved'
                    : 'Confirm Rejection'}
                </Button>
              </div>
            </>
          )}
        </div>
      </Modal>

      {/* High-Resolution Fullscreen Comparison Modal */}
      {zoomModalOrder && (
        <Modal
          isOpen={!!zoomModalOrder}
          onClose={() => setZoomModalOrder(null)}
          title={`Detailed Photo Inspection — ${zoomModalOrder.workOrderNumber}`}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Before High-Res */}
              <div className="space-y-1.5">
                <div className="text-xs font-bold text-amber-400 flex items-center justify-between">
                  <span>BEFORE (Initial Reported Defect)</span>
                  <span className="text-[10px] text-slate-400 font-mono">Geotagged</span>
                </div>
                <div className="aspect-video rounded-2xl bg-slate-950 border border-white/[0.1] overflow-hidden">
                  <img
                    src={extractPhotos(zoomModalOrder).initialPhoto || ''}
                    alt="Before High-Res"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* After High-Res */}
              <div className="space-y-1.5">
                <div className="text-xs font-bold text-emerald-400 flex items-center justify-between">
                  <span>AFTER (Contractor Repair Evidence)</span>
                  <span className="text-[10px] text-slate-400 font-mono">Completed</span>
                </div>
                <div className="aspect-video rounded-2xl bg-slate-950 border border-emerald-500/40 ring-1 ring-emerald-500/30 overflow-hidden">
                  <img
                    src={extractPhotos(zoomModalOrder).repairPhoto || ''}
                    alt="After High-Res"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/70 border border-white/[0.08] text-xs space-y-1">
              <div className="font-bold text-white">{zoomModalOrder.issueId?.title}</div>
              <div className="text-slate-400">{zoomModalOrder.issueId?.location?.addressText}</div>
              <div className="text-slate-500 text-[11px] pt-1">
                Contractor: <strong className="text-slate-300">{zoomModalOrder.contractorName}</strong> • Status:{' '}
                <strong className="text-emerald-400">{zoomModalOrder.status}</strong>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button size="sm" variant="secondary" onClick={() => setZoomModalOrder(null)}>
                Close Inspection
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
