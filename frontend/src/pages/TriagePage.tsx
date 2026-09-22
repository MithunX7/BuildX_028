import React, { useState, useEffect } from 'react';
import {
  ListTodo,
  AlertTriangle,
  Building2,
  Layers,
  Sparkles,
  Wrench,
  Search,
  Filter,
} from 'lucide-react';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { issueService } from '../services/issueService';

export const TriagePage: React.FC = () => {
  const [issues, setIssues] = useState<any[]>([]);
  const [filteredIssues, setFilteredIssues] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [activeIssue, setActiveIssue] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [contractorName, setContractorName] = useState('Nagpur Smart Roads Maintenance Agency');
  const [dueHours, setDueHours] = useState(24);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const fetchIssues = async () => {
    try {
      const data = await issueService.getIssues();
      setIssues(data);
      setFilteredIssues(data);
    } catch (err) {
      console.error('Failed to load triage queue:', err);
    }
  };

  useEffect(() => {
    fetchIssues();
  }, []);

  useEffect(() => {
    let list = issues;
    if (selectedCategory !== 'ALL') {
      list = list.filter((i) => i.category === selectedCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (i) =>
          i.referenceCode?.toLowerCase().includes(q) ||
          i.title?.toLowerCase().includes(q) ||
          i.location?.addressText?.toLowerCase().includes(q)
      );
    }
    setFilteredIssues(list);
  }, [searchQuery, selectedCategory, issues]);

  const handleDispatch = async () => {
    if (!activeIssue) return;
    setIsSubmitting(true);
    try {
      const id = activeIssue._id || activeIssue.id;
      const res = await issueService.triageIssue(id, {
        assignContractor: true,
        contractorName,
        dueInHours: dueHours,
        priorityLevel: activeIssue.priorityLevel,
        priorityScore: activeIssue.priorityScore,
      });

      setFeedback(res.message);
      setTimeout(() => {
        setIsModalOpen(false);
        setFeedback(null);
        fetchIssues();
      }, 1200);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPriorityBadge = (level: string) => {
    switch (level) {
      case 'CRITICAL':
        return <Badge variant="danger" size="sm">CRITICAL P1</Badge>;
      case 'HIGH':
        return <Badge variant="warning" size="sm">HIGH P2</Badge>;
      case 'MEDIUM':
        return <Badge variant="info" size="sm">MEDIUM P3</Badge>;
      default:
        return <Badge variant="default" size="sm">LOW P4</Badge>;
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2.5">
            <ListTodo className="w-6 h-6 text-blue-400" />
            Triage & Duplicate Queue
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Review AI classifications, inspect merged duplicate reports, and dispatch municipal work orders.
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-4 bg-[#111c44] p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-700/80">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Defect ID (NMC-2026-...), street, or landmark..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">All Categories</option>
            <option value="POTHOLE">Potholes</option>
            <option value="GARBAGE_ACCUMULATION">Garbage Dump</option>
            <option value="STREETLIGHT_FAULT">Streetlight</option>
            <option value="ROAD_OBSTRUCTION">Obstruction</option>
          </select>
        </div>
      </div>

      {/* Responsive Cards / List View */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {filteredIssues.map((issue) => (
          <div
            key={issue._id || issue.id}
            className="p-4 sm:p-5 rounded-2xl bg-[#111c44] border border-slate-700/80 hover:border-slate-600 transition-all flex flex-col justify-between gap-3 shadow-lg"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-xs font-bold text-sky-400">{issue.referenceCode}</span>
                {getPriorityBadge(issue.priorityLevel)}
              </div>

              <h3 className="text-sm sm:text-base font-bold text-white line-clamp-1">{issue.title}</h3>
              <p className="text-xs text-slate-400 line-clamp-2">{issue.description}</p>

              <div className="text-[11px] text-slate-400 flex items-center gap-1.5 pt-1">
                <Building2 className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                <span className="truncate">
                  {issue.departmentId?.name || (issue.category || '').replace('_', ' ')}
                </span>
              </div>

              {/* Explainable factors */}
              <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
                <div className="flex items-center justify-between text-[10px] font-bold text-slate-300">
                  <span className="flex items-center gap-1 text-sky-400">
                    <Sparkles className="w-2.5 h-2.5" /> Explainable Risk
                  </span>
                  <span className="font-mono text-amber-400">{issue.priorityScore}/100</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {(issue.priorityReasons || []).slice(0, 2).map((r: string, idx: number) => (
                    <span
                      key={idx}
                      className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] text-slate-400 truncate max-w-full"
                    >
                      {r}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
              <span className="text-[11px] font-medium text-purple-400 flex items-center gap-1">
                <Layers className="w-3 h-3" />
                {issue.duplicateCount || 0} confirmations
              </span>

              <Button
                size="sm"
                variant="primary"
                onClick={() => {
                  setActiveIssue(issue);
                  setIsModalOpen(true);
                }}
              >
                <Wrench className="w-3 h-3 mr-1" />
                Dispatch
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Dispatch Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={activeIssue ? `Dispatch Work Order: ${activeIssue.referenceCode}` : 'Dispatch'}
      >
        {feedback ? (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-center text-xs">
            {feedback}
          </div>
        ) : (
          <div className="space-y-4 text-xs">
            <p className="text-slate-400">
              Assign field repair contractor for <strong className="text-white">{activeIssue?.title}</strong>.
            </p>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Contractor Name</label>
              <input
                type="text"
                value={contractorName}
                onChange={(e) => setContractorName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Target Resolution (Hours)</label>
              <select
                value={dueHours}
                onChange={(e) => setDueHours(parseInt(e.target.value, 10))}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-blue-500"
              >
                <option value={12}>12 Hours (Emergency P1)</option>
                <option value={24}>24 Hours (High Priority)</option>
                <option value={48}>48 Hours (Standard)</option>
              </select>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <Button size="sm" variant="secondary" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button size="sm" variant="success" isLoading={isSubmitting} onClick={handleDispatch}>
                Confirm Dispatch
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
