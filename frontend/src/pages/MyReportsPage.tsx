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
} from 'lucide-react';
import { Badge } from '../components/ui/Badge';
import { issueService, Issue } from '../services/issueService';

export const MyReportsPage: React.FC = () => {
  const [reports, setReports] = useState<Issue[]>([]);
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2.5">
            <Inbox className="w-6 h-6 text-blue-400" />
            My Submitted Grievances ({reports.length})
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Real-time status tracking for all infrastructure issues you have reported to Nagpur Municipal Corporation.
          </p>
        </div>

        <Link
          to="/report"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm shadow-md transition-all self-start sm:self-auto"
        >
          <FilePlus className="w-4 h-4" />
          + Report New Defect
        </Link>
      </div>

      {isLoading ? (
        <div className="p-12 text-center text-xs text-slate-400 bg-[#111c44] rounded-3xl border border-slate-800">
          Loading your grievances...
        </div>
      ) : reports.length === 0 ? (
        <div className="p-12 rounded-3xl bg-[#111c44] border border-slate-800 text-center space-y-4 shadow-xl">
          <div className="w-16 h-16 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-slate-500 mx-auto">
            <Inbox className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white">No reports found</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              You haven't reported any civic defects yet. Notice a pothole, open manhole, or streetlight issue?
            </p>
          </div>
          <div>
            <Link
              to="/report"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition-all"
            >
              <FilePlus className="w-4 h-4" />
              Submit Your First Grievance
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reports.map((report) => (
            <div
              key={report._id}
              className="p-5 rounded-2xl bg-[#111c44] border border-slate-700/80 hover:border-slate-600 transition-all flex flex-col justify-between gap-4 shadow-lg"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
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

                <h3 className="text-base font-bold text-white line-clamp-1">{report.title}</h3>
                <p className="text-xs text-slate-400 line-clamp-2">{report.description}</p>

                <div className="text-xs text-slate-400 flex items-center gap-1.5 pt-1">
                  <MapPin className="w-3.5 h-3.5 text-sky-400 flex-shrink-0" />
                  <span className="truncate">{report.location?.addressText || 'Nagpur'}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400 flex items-center gap-1 font-mono text-[11px]">
                  <Clock className="w-3 h-3" />
                  {new Date(report.firstReportedAt || Date.now()).toLocaleDateString()}
                </span>

                <Link
                  to={`/issues/${report._id}`}
                  className="inline-flex items-center gap-1 text-xs font-bold text-blue-400 hover:text-blue-300"
                >
                  Track Progress
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
