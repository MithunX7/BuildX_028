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
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-blue-900/60 via-[#111c44] to-[#0b1329] border border-blue-500/30 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-xs font-semibold text-blue-400">
            <UserCheck className="w-3.5 h-3.5" />
            Citizen Grievance & Tracking Portal
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Welcome back, {currentUser?.name || 'Citizen'}!
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
            Track your submitted civic issues, monitor municipal repair progress, and help make Nagpur roads safer and cleaner.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <Link
            to="/report"
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-blue-500/25 transition-all"
          >
            <FilePlus className="w-4 h-4" />
            Report Issue
          </Link>
          <Link
            to="/issues"
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-200 font-semibold text-xs sm:text-sm border border-slate-700 transition-all"
          >
            <Compass className="w-4 h-4 text-sky-400" />
            Explore City Map
          </Link>
        </div>
      </div>

      {/* Citizen Personal Statistics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-[#111c44] border border-slate-700/80 flex items-center justify-between shadow-sm">
          <div>
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total Reports</div>
            <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono mt-0.5">{myReports.length}</div>
          </div>
          <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400">
            <Inbox className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#111c44] border border-slate-700/80 flex items-center justify-between shadow-sm">
          <div>
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Under Triage</div>
            <div className="text-2xl sm:text-3xl font-extrabold text-amber-400 font-mono mt-0.5">{pendingCount}</div>
          </div>
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#111c44] border border-slate-700/80 flex items-center justify-between shadow-sm">
          <div>
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Repairs In Progress</div>
            <div className="text-2xl sm:text-3xl font-extrabold text-sky-400 font-mono mt-0.5">{inProgressCount}</div>
          </div>
          <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-400">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#111c44] border border-slate-700/80 flex items-center justify-between shadow-sm">
          <div>
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Verified & Resolved</div>
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-mono mt-0.5">{resolvedCount}</div>
          </div>
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Section: My Active Reports & City Solved Showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* My Reports Column */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <Inbox className="w-5 h-5 text-blue-400" />
              My Submitted Reports ({myReports.length})
            </h2>
            <Link to="/my-reports" className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1">
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {isLoading ? (
            <div className="p-8 rounded-2xl bg-[#111c44] border border-slate-800 text-center text-xs text-slate-400">
              Loading your reports...
            </div>
          ) : myReports.length === 0 ? (
            <div className="p-8 rounded-2xl bg-[#111c44] border border-slate-800 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-500 mx-auto">
                <FilePlus className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-300">No reports submitted yet</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Notice a broken road, overflowing garbage, or open hazard? File a complaint with GPS and photo evidence.
              </p>
              <Link
                to="/report"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all"
              >
                <FilePlus className="w-3.5 h-3.5" />
                Report First Issue
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {myReports.slice(0, 5).map((report) => (
                <div
                  key={report._id}
                  className="p-4 rounded-2xl bg-[#111c44] border border-slate-700/80 hover:border-slate-600 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md"
                >
                  <div className="space-y-1 min-w-0">
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
                        {report.status}
                      </Badge>
                    </div>
                    <h4 className="text-sm font-bold text-white truncate">{report.title}</h4>
                    <div className="text-xs text-slate-400 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-sky-400 flex-shrink-0" />
                      <span className="truncate">{report.location?.addressText || 'Nagpur Sector'}</span>
                    </div>
                  </div>

                  <Link
                    to={`/issues/${report._id}`}
                    className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white border border-slate-700 transition-all flex-shrink-0"
                  >
                    View Status
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Resolved City Repairs Showcase Column */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              Verified City Repairs
            </h2>
            <Link to="/issues" className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1">
              Public Map <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {resolvedIssues.length === 0 ? (
            <div className="p-8 rounded-2xl bg-[#111c44] border border-slate-800 text-center text-xs text-slate-400">
              No verified repairs to display yet.
            </div>
          ) : (
            <div className="space-y-3">
              {resolvedIssues.map((issue) => (
                <div
                  key={issue._id}
                  className="p-4 rounded-2xl bg-[#111c44] border border-slate-700/80 space-y-2 shadow-md"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs font-bold text-sky-400">{issue.referenceCode}</span>
                    <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-bold">
                      <CheckCircle2 className="w-3 h-3" /> Repaired & Closed
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white line-clamp-1">{issue.title}</h4>
                  <div className="text-xs text-slate-400 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-sky-400 flex-shrink-0" />
                    <span className="truncate">{issue.location?.addressText}</span>
                  </div>
                  <div className="pt-1 flex justify-end">
                    <Link
                      to={`/issues/${issue._id}`}
                      className="text-[11px] font-semibold text-sky-400 hover:underline flex items-center gap-1"
                    >
                      View Resolution Proof <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
