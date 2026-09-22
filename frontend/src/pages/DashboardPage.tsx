import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FilePlus,
  Compass,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  MapPin,
  Inbox,
  UserCheck,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { Badge } from '../components/ui/Badge';
import { issueService, Issue } from '../services/issueService';
import { authService, User } from '../services/authService';

export const DashboardPage: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(authService.getStoredUser());
  const [myReports, setMyReports] = useState<Issue[]>([]);
  const [resolvedIssues, setResolvedIssues] = useState<Issue[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [userReports, allIssues] = await Promise.all([
          issueService.getMyReports(),
          issueService.getIssues({ status: 'RESOLVED' }),
        ]);
        setMyReports(userReports);
        setResolvedIssues(allIssues.slice(0, 4));
      } catch (err) {
        console.error('Failed to load citizen dashboard data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const pendingCount = myReports.filter((r) => r.status === 'NEW' || r.status === 'TRIAGED').length;
  const inProgressCount = myReports.filter((r) => r.status === 'ASSIGNED' || r.status === 'IN_PROGRESS').length;
  const resolvedCount = myReports.filter((r) => r.status === 'RESOLVED').length;

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Welcome Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-blue-950/70 via-[#0f172a]/90 to-slate-950 border border-white/[0.08] shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="pointer-events-none absolute -right-10 -top-10 w-72 h-72 bg-blue-600/10 blur-[80px] rounded-full" />

        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-xs font-bold text-blue-300">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            Citizen Grievance & Tracking Portal
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Welcome back, {currentUser?.name || 'Citizen'}!
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl font-normal">
            Track your submitted civic issues, monitor municipal repair progress, and view verified engineering photo proof.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 relative z-10">
          <Link
            to="/report"
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-xs sm:text-sm shadow-lg shadow-blue-500/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <FilePlus className="w-4 h-4" />
            Report Issue
          </Link>
          <Link
            to="/issues"
            className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-slate-900/80 hover:bg-slate-800 text-slate-200 font-bold text-xs sm:text-sm border border-white/[0.08] transition-all"
          >
            <Compass className="w-4 h-4 text-sky-400" />
            Explore City Map
          </Link>
        </div>
      </div>

      {/* Citizen Personal Statistics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 sm:p-5 rounded-2xl bg-[#0f172a]/70 backdrop-blur border border-white/[0.08] flex items-center justify-between shadow-sm">
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Reports</div>
            <div className="text-2xl sm:text-3xl font-black text-white font-mono mt-0.5">{myReports.length}</div>
          </div>
          <div className="p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
            <Inbox className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-[#0f172a]/70 backdrop-blur border border-white/[0.08] flex items-center justify-between shadow-sm">
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Under Triage</div>
            <div className="text-2xl sm:text-3xl font-black text-amber-400 font-mono mt-0.5">{pendingCount}</div>
          </div>
          <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-[#0f172a]/70 backdrop-blur border border-white/[0.08] flex items-center justify-between shadow-sm">
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Dispatched Crews</div>
            <div className="text-2xl sm:text-3xl font-black text-sky-400 font-mono mt-0.5">{inProgressCount}</div>
          </div>
          <div className="p-3 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-400">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-[#0f172a]/70 backdrop-blur border border-white/[0.08] flex items-center justify-between shadow-sm">
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Verified Closed</div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono mt-0.5">{resolvedCount}</div>
          </div>
          <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Grid: My Recent Reports & Verified Public Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: My Submitted Reports */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              <Inbox className="w-5 h-5 text-blue-400" />
              My Submitted Grievances ({myReports.length})
            </h2>
            <Link
              to="/my-reports"
              className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1"
            >
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {isLoading ? (
            <div className="p-12 text-center text-xs text-slate-400 bg-[#0f172a]/70 rounded-3xl border border-white/[0.08]">
              Loading your grievances...
            </div>
          ) : myReports.length === 0 ? (
            <div className="p-8 sm:p-12 text-center rounded-3xl bg-[#0f172a]/70 border border-white/[0.08] space-y-4 shadow-sm">
              <div className="w-14 h-14 rounded-2xl bg-blue-600/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mx-auto">
                <FilePlus className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white">No reports submitted yet</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Notice a pothole, garbage dump, or broken streetlight in your ward? Report it with a photo to alert NMC crews.
                </p>
              </div>
              <Link
                to="/report"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs"
              >
                <FilePlus className="w-4 h-4" />
                Report First Defect
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {myReports.slice(0, 5).map((report) => (
                <div
                  key={report._id}
                  className="p-4 sm:p-5 rounded-2xl bg-[#0f172a]/70 border border-white/[0.08] hover:border-blue-500/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    {report.evidencePhotos?.[0] ? (
                      <div className="w-16 h-16 rounded-xl bg-slate-900 border border-white/[0.08] overflow-hidden flex-shrink-0">
                        <img src={report.evidencePhotos[0]} alt="Defect proof" className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="w-16 h-16 rounded-xl bg-slate-900 border border-dashed border-white/[0.1] flex items-center justify-center text-slate-600 flex-shrink-0">
                        <MapPin className="w-5 h-5" />
                      </div>
                    )}
                    <div className="min-w-0 space-y-1">
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
                      <h4 className="text-sm font-bold text-white truncate">{report.title}</h4>
                      <p className="text-xs text-slate-400 flex items-center gap-1 truncate">
                        <MapPin className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                        {report.location?.addressText || 'Nagpur'}
                      </p>
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-2 sm:pt-0 border-white/[0.06] flex-shrink-0">
                    <span className="text-[11px] text-slate-400">
                      {new Date(report.firstReportedAt || (report as any).createdAt).toLocaleDateString()}
                    </span>
                    <Link
                      to={`/issues/${report._id}`}
                      className="inline-flex items-center gap-1 text-xs font-bold text-blue-400 hover:text-blue-300 mt-1"
                    >
                      Track Progress <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Col: Verified Municipal Resolutions */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              Verified Citywide Repairs
            </h2>
            <Link
              to="/issues"
              className="text-xs font-bold text-slate-400 hover:text-white"
            >
              Feed
            </Link>
          </div>

          <div className="space-y-3">
            {resolvedIssues.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 bg-[#0f172a]/70 rounded-3xl border border-white/[0.08]">
                No verified resolutions published yet today.
              </div>
            ) : (
              resolvedIssues.map((issue) => (
                <div
                  key={issue._id}
                  className="p-4 rounded-2xl bg-[#0f172a]/70 border border-white/[0.08] space-y-2 shadow-sm"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs font-bold text-emerald-400">{issue.referenceCode}</span>
                    <Badge variant="success" size="sm">
                      VERIFIED REPAIR
                    </Badge>
                  </div>
                  <div className="text-xs font-bold text-white truncate">{issue.title}</div>
                  <div className="text-[11px] text-slate-400 flex items-center gap-1 truncate">
                    <MapPin className="w-3 h-3 text-slate-500" />
                    {issue.location?.addressText || 'Nagpur'}
                  </div>
                  <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-[10px]">
                    <span className="text-slate-500">Quality Approved</span>
                    <Link to={`/issues/${issue._id}`} className="text-blue-400 font-bold hover:underline">
                      View Photo Proof
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
