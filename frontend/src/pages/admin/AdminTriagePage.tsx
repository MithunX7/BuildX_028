import React, { useState, useEffect } from 'react';
import {
  ListTodo,
  AlertTriangle,
  Building2,
  Layers,
  Wrench,
  Search,
  CheckCircle2,
  Clock,
  Sparkles,
} from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { adminService } from '../../services/adminService';

export const AdminTriagePage: React.FC = () => {
  const [issues, setIssues] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [activeIssue, setActiveIssue] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [contractorName, setContractorName] = useState('NMC Rapid Road Repair Squad');
  const [dueHours, setDueHours] = useState(24);
  const [priorityLevel, setPriorityLevel] = useState('HIGH');
  const [priorityScore, setPriorityScore] = useState(75);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchIssues = async () => {
    setIsLoading(true);
    try {
      const res = await adminService.getIssues({ limit: 50 });
      setIssues(res.issues || []);
    } catch (err) {
      console.error('Failed to load triage queue:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchIssues();
  }, []);

  const openTriageModal = (issue: any) => {
    setActiveIssue(issue);
    setPriorityLevel(issue.priorityLevel);
    setPriorityScore(issue.priorityScore);
    setIsModalOpen(true);
  };

  const handleDispatch = async () => {
    if (!activeIssue) return;
    setIsSubmitting(true);
    try {
      const res = await adminService.triageIssue(activeIssue._id, {
        assignContractor: true,
        contractorName,
        dueInHours: dueHours,
        priorityLevel,
        priorityScore,
      });

      setFeedback(res.message);
      setTimeout(() => {
        setIsModalOpen(false);
        setFeedback(null);
        fetchIssues();
      }, 1200);
    } catch (err: any) {
      console.error('Triage failed:', err);
      alert(err.message || 'Triage operation failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filtered = issues.filter((i) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      i.referenceCode?.toLowerCase().includes(q) ||
      i.title?.toLowerCase().includes(q) ||
      i.location?.addressText?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
            <ListTodo className="w-7 h-7 text-blue-400" />
            Operational Triage & Dispatch Queue
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Review incoming defects, adjust priority scoring, and dispatch work orders with SLA deadlines.
          </p>
        </div>
      </div>

      {/* Search Filter */}
      <div className="p-4 rounded-2xl bg-[#111c44] border border-slate-700/80">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search triage queue by reference ID, title, or road..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs sm:text-sm focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Triage Grid */}
      {isLoading ? (
        <div className="p-12 text-center text-xs text-slate-400 bg-[#111c44] rounded-3xl border border-slate-800">
          Loading triage tickets...
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center text-xs text-slate-400 bg-[#111c44] rounded-3xl border border-slate-800">
          No tickets currently pending triage.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((issue) => (
            <div
              key={issue._id}
              className="p-5 rounded-2xl bg-[#111c44] border border-slate-700/80 hover:border-slate-600 transition-all flex flex-col justify-between gap-4 shadow-lg"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-xs font-bold text-sky-400">{issue.referenceCode}</span>
                  <Badge
                    variant={
                      issue.priorityLevel === 'CRITICAL'
                        ? 'danger'
                        : issue.priorityLevel === 'HIGH'
                        ? 'warning'
                        : 'default'
                    }
                    size="sm"
                  >
                    {issue.priorityLevel} (Score {issue.priorityScore})
                  </Badge>
                </div>

                <h3 className="text-sm font-bold text-white line-clamp-1">{issue.title}</h3>
                <p className="text-xs text-slate-400 line-clamp-2">{issue.description}</p>

                <div className="text-xs text-slate-400 flex items-center gap-1 pt-1">
                  <Building2 className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                  <span className="truncate">{issue.departmentId?.name || 'Roads Department'}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                <Badge variant={issue.status === 'ASSIGNED' ? 'info' : 'outline'} size="sm">
                  {issue.status}
                </Badge>
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => openTriageModal(issue)}
                >
                  <Wrench className="w-3.5 h-3.5 mr-1" />
                  Dispatch
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Triage Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`Triage & Dispatch: ${activeIssue?.referenceCode}`}
      >
        {feedback ? (
          <div className="p-6 text-center space-y-2 text-emerald-400">
            <CheckCircle2 className="w-10 h-10 mx-auto animate-bounce" />
            <div className="font-bold text-sm">{feedback}</div>
          </div>
        ) : (
          <div className="space-y-4 text-xs">
            <div className="space-y-1">
              <label className="block font-semibold text-slate-300">Defect Title</label>
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200">
                {activeIssue?.title}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block font-semibold text-slate-300">Priority Level</label>
                <select
                  value={priorityLevel}
                  onChange={(e) => setPriorityLevel(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="CRITICAL">CRITICAL P1</option>
                  <option value="HIGH">HIGH P2</option>
                  <option value="MEDIUM">MEDIUM P3</option>
                  <option value="LOW">LOW P4</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block font-semibold text-slate-300">Target SLA (Hours)</label>
                <select
                  value={dueHours}
                  onChange={(e) => setDueHours(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-blue-500"
                >
                  <option value={12}>12 Hours (Emergency)</option>
                  <option value={24}>24 Hours (Standard High)</option>
                  <option value={48}>48 Hours (Medium)</option>
                  <option value={72}>72 Hours (Routine)</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="block font-semibold text-slate-300">Assign Contractor / Agency</label>
              <input
                type="text"
                value={contractorName}
                onChange={(e) => setContractorName(e.target.value)}
                placeholder="Contractor company name..."
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="pt-3 flex gap-2">
              <Button
                variant="primary"
                size="md"
                className="flex-1 font-bold"
                onClick={handleDispatch}
                isLoading={isSubmitting}
              >
                Confirm Dispatch & Issue Work Order
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
