import React, { useState, useEffect } from 'react';
import {
  Compass,
  Search,
  MapPin,
  CheckCircle2,
  Clock,
  Building2,
  ShieldCheck,
  Layers,
} from 'lucide-react';
import { Badge } from '../components/ui/Badge';
import { issueService } from '../services/issueService';

export const PublicIssuesPage: React.FC = () => {
  const [issues, setIssues] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    issueService.getIssues().then((data) => setIssues(data));
  }, []);

  const filtered = issues.filter((issue) => {
    if (statusFilter !== 'ALL' && issue.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        issue.referenceCode?.toLowerCase().includes(q) ||
        issue.title?.toLowerCase().includes(q) ||
        issue.location?.addressText?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="text-center space-y-2 max-w-2xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center justify-center gap-2">
          <Compass className="w-7 h-7 text-sky-400" />
          Nagpur Public Defect Explorer & Map
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Search open grievances, view verified road repairs, and track NMC municipal accountability in your ward.
        </p>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-[#111c44] p-3 sm:p-4 rounded-2xl border border-slate-700/80">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Defect ID (e.g. NMC-2026-...) or landmark..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs sm:text-sm focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs sm:text-sm focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="NEW">New Complaints</option>
            <option value="IN_PROGRESS">Repair In Progress</option>
            <option value="RESOLVED">Verified & Resolved</option>
          </select>
        </div>
      </div>

      {/* Public Defect Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {filtered.map((issue) => (
          <div
            key={issue._id || issue.id}
            className="p-4 sm:p-5 rounded-2xl bg-[#111c44] border border-slate-700/80 space-y-3 flex flex-col justify-between shadow-lg"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-xs font-bold text-sky-400">{issue.referenceCode}</span>
                <Badge
                  variant={
                    issue.status === 'RESOLVED'
                      ? 'success'
                      : issue.priorityLevel === 'CRITICAL'
                      ? 'danger'
                      : 'warning'
                  }
                  size="sm"
                >
                  {issue.status}
                </Badge>
              </div>

              <h3 className="text-sm sm:text-base font-bold text-white line-clamp-1">{issue.title}</h3>
              <p className="text-xs text-slate-400 line-clamp-2">{issue.description}</p>

              <div className="text-xs text-slate-400 flex items-center gap-1 pt-1">
                <MapPin className="w-3.5 h-3.5 text-sky-400 flex-shrink-0" />
                <span className="truncate">{issue.location?.addressText}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1 font-mono">
                <Clock className="w-3 h-3" />
                {new Date(issue.firstReportedAt || issue.createdAt || Date.now()).toLocaleDateString()}
              </span>

              {issue.status === 'RESOLVED' ? (
                <span className="flex items-center gap-1 text-emerald-400 font-bold">
                  <ShieldCheck className="w-3.5 h-3.5" /> Verified Repair
                </span>
              ) : (
                <span className="text-purple-400 flex items-center gap-1">
                  <Layers className="w-3 h-3" /> {issue.duplicateCount || 0} Confirmations
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
