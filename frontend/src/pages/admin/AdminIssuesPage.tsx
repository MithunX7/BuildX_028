import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Filter,
  ArrowRight,
  MapPin,
  Clock,
  Layers,
  Wrench,
  Eye,
  RefreshCw,
} from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import { adminService } from '../../services/adminService';

export const AdminIssuesPage: React.FC = () => {
  const [issues, setIssues] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('ALL');
  const [status, setStatus] = useState('ALL');
  const [priority, setPriority] = useState('ALL');
  const [isLoading, setIsLoading] = useState(true);

  const fetchIssues = async () => {
    setIsLoading(true);
    try {
      const res = await adminService.getIssues({
        search,
        category,
        status,
        priority,
      });
      setIssues(res.issues || []);
    } catch (err) {
      console.error('Failed to fetch admin issues:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchIssues();
  }, [category, status, priority]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchIssues();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Municipal Grievance Registry ({issues.length})
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Comprehensive registry of all reported, triaged, and resolved infrastructure defects across Nagpur.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchIssues}
            className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-all"
            title="Refresh issues"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <Link
            to="/admin/triage"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition-all"
          >
            <Wrench className="w-4 h-4" />
            Triage Queue
          </Link>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="p-4 rounded-2xl bg-[#111c44] border border-slate-700/80 space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search reference code, title, or address..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs sm:text-sm focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-blue-500"
            >
              <option value="ALL">All Categories</option>
              <option value="POTHOLE">Potholes</option>
              <option value="GARBAGE_ACCUMULATION">Sanitation / Waste</option>
              <option value="STREETLIGHT_FAULT">Streetlights</option>
              <option value="ROAD_OBSTRUCTION">Road Obstructions</option>
              <option value="DAMAGED_ASSET">Damaged Assets</option>
            </select>

            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-blue-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="NEW">New</option>
              <option value="TRIAGED">Triaged</option>
              <option value="ASSIGNED">Assigned</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
            </select>

            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-blue-500"
            >
              <option value="ALL">All Priorities</option>
              <option value="CRITICAL">CRITICAL P1</option>
              <option value="HIGH">HIGH P2</option>
              <option value="MEDIUM">MEDIUM P3</option>
              <option value="LOW">LOW P4</option>
            </select>
          </div>
        </form>
      </div>

      {/* Issues Table / Cards */}
      {isLoading ? (
        <div className="p-12 text-center text-xs text-slate-400 bg-[#111c44] rounded-3xl border border-slate-800">
          Loading municipal grievances...
        </div>
      ) : issues.length === 0 ? (
        <div className="p-12 text-center text-xs text-slate-400 bg-[#111c44] rounded-3xl border border-slate-800">
          No reports found matching your active filter criteria.
        </div>
      ) : (
        <div className="space-y-3">
          {issues.map((issue) => (
            <div
              key={issue._id}
              className="p-4 sm:p-5 rounded-2xl bg-[#111c44] border border-slate-700/80 hover:border-slate-600 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-md"
            >
              <div className="space-y-1.5 min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
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
                  <Badge
                    variant={
                      issue.status === 'RESOLVED'
                        ? 'success'
                        : issue.status === 'IN_PROGRESS' || issue.status === 'ASSIGNED'
                        ? 'info'
                        : 'warning'
                    }
                    size="sm"
                  >
                    {issue.status}
                  </Badge>
                  <span className="text-[11px] text-purple-400 flex items-center gap-1 font-medium">
                    <Layers className="w-3 h-3" /> {issue.duplicateCount || 0} Duplicates
                  </span>
                </div>

                <h3 className="text-sm sm:text-base font-bold text-white line-clamp-1">{issue.title}</h3>
                <div className="text-xs text-slate-400 flex items-center gap-1.5 truncate">
                  <MapPin className="w-3.5 h-3.5 text-sky-400 flex-shrink-0" />
                  <span className="truncate">{issue.location?.addressText || 'Nagpur'}</span>
                  <span className="text-slate-600">•</span>
                  <span className="text-slate-300 font-medium">Dept: {issue.departmentId?.code || 'ROADS'}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start md:self-center flex-shrink-0">
                <Link
                  to={`/issues/${issue._id}`}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all"
                >
                  <Eye className="w-3.5 h-3.5" />
                  View Details
                </Link>
                <Link
                  to="/admin/triage"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all"
                >
                  <Wrench className="w-3.5 h-3.5" />
                  Triage / Assign
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
