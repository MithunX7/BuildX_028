import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Compass,
  Search,
  MapPin,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Layers,
  ArrowRight,
  Eye,
  RefreshCw,
} from 'lucide-react';
import { Badge } from '../components/ui/Badge';
import { issueService, Issue } from '../services/issueService';

export const PublicIssuesPage: React.FC = () => {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isLoading, setIsLoading] = useState(true);

  const fetchIssues = async () => {
    setIsLoading(true);
    try {
      const data = await issueService.getIssues();
      setIssues(data || []);
    } catch (err) {
      console.error('Failed to load issues:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchIssues();
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Compass className="w-7 h-7 text-sky-400" />
            Nagpur Public Defect Explorer & Map
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Search open grievances, view verified road repairs, and track NMC municipal accountability in your ward.
          </p>
        </div>

        <button
          onClick={fetchIssues}
          className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-all self-start sm:self-auto"
          title="Refresh defects"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-[#111c44] p-4 rounded-2xl border border-slate-700/80">
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
            <option value="ASSIGNED">Assigned / In Progress</option>
            <option value="RESOLVED">Verified & Resolved</option>
          </select>
        </div>
      </div>

      {/* Public Defect Cards */}
      {isLoading ? (
        <div className="p-12 text-center text-xs text-slate-400 bg-[#111c44] rounded-3xl border border-slate-800">
          Loading civic defects...
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center text-xs text-slate-400 bg-[#111c44] rounded-3xl border border-slate-800">
          No reports found matching your search.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((issue) => (
            <div
              key={issue._id}
              className="p-5 rounded-2xl bg-[#111c44] border border-slate-700/80 hover:border-slate-600 transition-all space-y-3 flex flex-col justify-between shadow-lg"
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

                <div className="text-xs text-slate-400 flex items-center gap-1.5 pt-1">
                  <MapPin className="w-3.5 h-3.5 text-sky-400 flex-shrink-0" />
                  <span className="truncate">{issue.location?.addressText || 'Nagpur'}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                <span className="flex items-center gap-1 font-mono text-[11px] text-slate-400">
                  <Clock className="w-3 h-3" />
                  {new Date(issue.firstReportedAt || Date.now()).toLocaleDateString()}
                </span>

                <Link
                  to={`/issues/${issue._id}`}
                  className="inline-flex items-center gap-1 text-xs font-bold text-sky-400 hover:text-sky-300"
                >
                  <Eye className="w-3.5 h-3.5" />
                  View Status
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
