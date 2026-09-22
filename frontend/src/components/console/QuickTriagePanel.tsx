import React, { useState } from 'react';
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
} from 'lucide-react';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { issueService } from '../../services/issueService';

interface QuickTriagePanelProps {
  activeIssue: any | null;
  onTriageComplete?: () => void;
}

export const QuickTriagePanel: React.FC<QuickTriagePanelProps> = ({
  activeIssue,
  onTriageComplete,
}) => {
  const [isTriageModalOpen, setIsTriageModalOpen] = useState(false);
  const [contractorName, setContractorName] = useState('Nagpur Smart Roads Maintenance Agency');
  const [dueHours, setDueHours] = useState(24);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!activeIssue) {
    return (
      <div className="rounded-2xl sm:rounded-3xl bg-[#111c44] border border-slate-700/80 shadow-2xl p-5 flex flex-col items-center justify-center text-center h-full min-h-[220px]">
        <div className="w-10 h-10 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-slate-500 mb-2">
          <AlertCircle className="w-5 h-5" />
        </div>
        <h4 className="text-xs sm:text-sm font-bold text-slate-300">No Issue Selected</h4>
        <p className="text-[11px] sm:text-xs text-slate-400 max-w-xs mt-1">
          Click an issue from the detection stream or map to inspect AI prioritization and dispatch a work order.
        </p>
      </div>
    );
  }

  const handleDispatch = async () => {
    setIsSubmitting(true);
    try {
      const issueId = activeIssue._id || activeIssue.id;
      const res = await issueService.triageIssue(issueId, {
        assignContractor: true,
        contractorName,
        dueInHours: dueHours,
        priorityLevel: activeIssue.priorityLevel,
        priorityScore: activeIssue.priorityScore,
      });

      setSuccessMessage(res.message || 'Work order dispatched successfully');
      setTimeout(() => {
        setIsTriageModalOpen(false);
        setSuccessMessage(null);
        if (onTriageComplete) onTriageComplete();
      }, 1400);
    } catch (err) {
      console.error('Triage dispatch error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPriorityVariant = (level: string) => {
    switch (level) {
      case 'CRITICAL':
        return 'danger';
      case 'HIGH':
        return 'warning';
      case 'MEDIUM':
        return 'info';
      default:
        return 'default';
    }
  };

  return (
    <div className="rounded-2xl sm:rounded-3xl bg-[#111c44] border border-slate-700/80 shadow-2xl p-4 sm:p-5 flex flex-col gap-3 sm:gap-4 h-full">
      {/* Header */}
      <div className="flex items-start justify-between pb-3 border-b border-slate-800 gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
            <span className="font-mono text-xs font-bold text-sky-400">{activeIssue.referenceCode}</span>
            <Badge variant={getPriorityVariant(activeIssue.priorityLevel)} size="sm">
              {activeIssue.priorityLevel} (Score: {activeIssue.priorityScore}/100)
            </Badge>
          </div>
          <h3 className="text-xs sm:text-sm font-extrabold text-white mt-1 leading-tight line-clamp-2">
            {activeIssue.title}
          </h3>
        </div>

        <Badge variant="outline" size="sm" className="flex-shrink-0">
          {activeIssue.status}
        </Badge>
      </div>

      {/* Location & Details */}
      <div className="space-y-1.5 text-xs">
        <div className="flex items-center gap-1 text-slate-400">
          <MapPin className="w-3.5 h-3.5 text-sky-400 flex-shrink-0" />
          <span className="truncate">{activeIssue.location?.addressText || 'Nagpur Urban Ward'}</span>
        </div>
        <p className="text-slate-300 leading-relaxed text-[11px] sm:text-xs line-clamp-2">
          {activeIssue.description}
        </p>
      </div>

      {/* Explainable Prioritization Reasons Box */}
      <div className="rounded-xl sm:rounded-2xl bg-slate-950/80 border border-slate-800 p-3 space-y-1.5">
        <div className="flex items-center justify-between text-[11px] font-bold text-slate-300">
          <span className="flex items-center gap-1 text-sky-400">
            <TrendingUp className="w-3 h-3" /> Explainable Risk Formula
          </span>
          <span className="font-mono text-amber-400 font-bold">{activeIssue.priorityScore} Pts</span>
        </div>

        <div className="flex flex-wrap gap-1">
          {activeIssue.priorityReasons && activeIssue.priorityReasons.length > 0 ? (
            activeIssue.priorityReasons.map((reason: string, idx: number) => (
              <span
                key={idx}
                className="px-2 py-0.5 rounded-lg bg-slate-900 border border-slate-800 text-[10px] sm:text-[11px] text-slate-300 flex items-center gap-1"
              >
                <Sparkles className="w-2.5 h-2.5 text-amber-400 flex-shrink-0" />
                <span>{reason}</span>
              </span>
            ))
          ) : (
            <span className="text-[10px] text-slate-500">Standard category baseline score</span>
          )}
        </div>
      </div>

      {/* Department Routing & Duplicate Badge */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="p-2.5 sm:p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-0.5">
          <span className="text-[9px] sm:text-[10px] text-slate-400 uppercase font-semibold flex items-center gap-1">
            <Building2 className="w-3 h-3 flex-shrink-0" /> Department
          </span>
          <span className="font-bold text-slate-200 block truncate text-xs">
            {activeIssue.departmentId?.name || (activeIssue.category || '').replace('_', ' ')}
          </span>
        </div>

        <div className="p-2.5 sm:p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-0.5">
          <span className="text-[9px] sm:text-[10px] text-slate-400 uppercase font-semibold flex items-center gap-1">
            <Layers className="w-3 h-3 flex-shrink-0" /> Duplicates
          </span>
          <span className="font-bold text-purple-400 block text-xs">
            {activeIssue.duplicateCount || 0} merged reports
          </span>
        </div>
      </div>

      {/* Action Footer */}
      <div className="pt-2 border-t border-slate-800/80 mt-auto">
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
              Assign contractor and define SLA repair timeline for{' '}
              <strong className="text-white">{activeIssue.title}</strong>.
            </p>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Assigned Repair Contractor</label>
              <input
                type="text"
                value={contractorName}
                onChange={(e) => setContractorName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-blue-500 text-xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">SLA Target Resolution (Hours)</label>
              <select
                value={dueHours}
                onChange={(e) => setDueHours(parseInt(e.target.value, 10))}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-blue-500 text-xs"
              >
                <option value={12}>12 Hours (Emergency P1 - Fast Track)</option>
                <option value={24}>24 Hours (P1 / P2 Carriageway SLA)</option>
                <option value={48}>48 Hours (P2 Municipal Standard)</option>
                <option value={72}>72 Hours (Routine P3)</option>
              </select>
            </div>

            <div className="pt-2 flex justify-end gap-2">
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
};
