import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Inbox,
  FilePlus,
  MapPin,
  Clock,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  Sparkles,
  Camera,
  CheckCircle2,
} from 'lucide-react';
import { Badge } from '../components/ui/Badge';
import { issueService, Issue } from '../services/issueService';

export const MyReportsPage: React.FC = () => {
  const [reports, setReports] = useState<Issue[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<'ALL' | 'NEW' | 'IN_PROGRESS' | 'RESOLVED'>('ALL');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const data = await issueService.getMyReports();
        setReports(data);
      } catch (err) {
        console.error('Failed to load my reports:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReports();
  }, []);

  const filteredReports = reports.filter((r) => {
    if (selectedFilter === 'ALL') return true;
    if (selectedFilter === 'NEW') return r.status === 'NEW' || r.status === 'TRIAGED';
    if (selectedFilter === 'IN_PROGRESS') return r.status === 'ASSIGNED' || r.status === 'IN_PROGRESS' || r.status === 'SUBMITTED_FOR_VERIFICATION';
    if (selectedFilter === 'RESOLVED') return r.status === 'RESOLVED';
    return true;
  });

  const getStageStep = (status: string) => {
    if (status === 'RESOLVED') return 4;
    if (status === 'SUBMITTED_FOR_VERIFICATION') return 3;
    if (status === 'IN_PROGRESS' || status === 'ASSIGNED') return 2;
    return 1;
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-600/10 border border-blue-500/30 text-xs font-bold text-blue-400 mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            Citizen Grievance Ledger
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2.5">
            My Submitted Grievances ({reports.length})
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Real-time status tracking for all infrastructure issues you have reported to Nagpur Municipal Corporation.
          </p>
        </div>

        <Link
          to="/report"
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-xs sm:text-sm shadow-lg shadow-blue-500/25 transition-all self-start sm:self-auto"
        >
          <FilePlus className="w-4 h-4" />
          Report New Defect
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[
          { id: 'ALL', label: `All Reports (${reports.length})` },
          { id: 'NEW', label: `Pending Triage (${reports.filter((r) => r.status === 'NEW' || r.status === 'TRIAGED').length})` },
          { id: 'IN_PROGRESS', label: `In Progress (${reports.filter((r) => r.status === 'ASSIGNED' || r.status === 'IN_PROGRESS' || r.status === 'SUBMITTED_FOR_VERIFICATION').length})` },
          { id: 'RESOLVED', label: `Verified Closed (${reports.filter((r) => r.status === 'RESOLVED').length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedFilter(tab.id as any)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              selectedFilter === tab.id
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25 border border-blue-400/30'
                : 'bg-slate-900/80 text-slate-400 hover:text-white border border-white/[0.06] hover:bg-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="p-12 text-center text-xs text-slate-400 bg-[#0f172a]/70 rounded-3xl border border-white/[0.08]">
          Loading your grievances...
        </div>
      ) : filteredReports.length === 0 ? (
        <div className="p-12 rounded-3xl bg-[#0f172a]/70 border border-white/[0.08] text-center space-y-4 shadow-xl">
          <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-white/[0.08] flex items-center justify-center text-slate-500 mx-auto">
            <Inbox className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white">No reports match this filter</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Select another status tab above or submit a new grievance with photo evidence.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredReports.map((report) => {
            const step = getStageStep(report.status);
            const photo = report.evidencePhotos?.[0];

            return (
              <div
                key={report._id}
                className="p-5 rounded-3xl bg-[#0f172a]/70 backdrop-blur border border-white/[0.08] hover:border-blue-500/40 transition-all flex flex-col justify-between gap-4 shadow-lg group hover:-translate-y-0.5"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-bold text-sky-400">{report.referenceCode}</span>
                      <Badge
                        variant={
                          report.status === 'RESOLVED'
                            ? 'success'
                            : report.status === 'IN_PROGRESS' || report.status === 'ASSIGNED'
                            ? 'info'
                            : 'warning'
                        }
                        size="sm"
                      >
                        {report.status.replace('_', ' ')}
                      </Badge>
                    </div>

                    <span className="text-[10px] font-mono text-slate-400">
                      {new Date(report.firstReportedAt || (report as any).createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex items-start gap-3.5">
                    {photo ? (
                      <div className="w-20 h-20 rounded-2xl bg-slate-900 border border-white/[0.1] overflow-hidden flex-shrink-0 shadow-inner">
                        <img src={photo} alt="Report evidence" className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="w-20 h-20 rounded-2xl bg-slate-900 border border-dashed border-white/[0.08] flex items-center justify-center text-slate-600 flex-shrink-0">
                        <Camera className="w-6 h-6" />
                      </div>
                    )}

                    <div className="min-w-0 space-y-1">
                      <h3 className="text-sm sm:text-base font-extrabold text-white truncate">{report.title}</h3>
                      <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">{report.description}</p>
                      <div className="text-xs text-slate-400 flex items-center gap-1.5 pt-0.5 truncate">
                        <MapPin className="w-3.5 h-3.5 text-sky-400 flex-shrink-0" />
                        <span className="truncate">{report.location?.addressText || 'Nagpur'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between text-[10px] font-semibold text-slate-400">
                      <span>Reported</span>
                      <span>Triaged</span>
                      <span>Dispatched</span>
                      <span className={step === 4 ? 'text-emerald-400 font-bold' : ''}>Verified Closed</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-900 overflow-hidden flex">
                      <div
                        className={`h-full transition-all duration-500 rounded-full ${
                          step === 4
                            ? 'w-full bg-emerald-500'
                            : step === 3
                            ? 'w-3/4 bg-blue-500'
                            : step === 2
                            ? 'w-1/2 bg-sky-500'
                            : 'w-1/4 bg-amber-500'
                        }`}
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs">
                  <span className="text-slate-400 text-[11px] font-medium">
                    Priority:{' '}
                    <strong className="text-amber-400 font-mono">{report.priorityLevel}</strong>
                  </span>

                  <Link
                    to={`/issues/${report._id}`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    View Status & Proof
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
