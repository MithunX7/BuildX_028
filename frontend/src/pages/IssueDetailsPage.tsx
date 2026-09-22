import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  MapPin,
  Clock,
  CheckCircle2,
  Building2,
  ShieldCheck,
  AlertTriangle,
  History,
  FileText,
  Camera,
} from 'lucide-react';
import { Badge } from '../components/ui/Badge';
import { issueService } from '../services/issueService';

export const IssueDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [issueData, setIssueData] = useState<any | null>(null);
  const [auditHistory, setAuditHistory] = useState<any[]>([]);
  const [workOrders, setWorkOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const fetchIssue = async () => {
      setIsLoading(true);
      try {
        const res = await issueService.getIssueById(id);
        setIssueData(res.issue);
        setAuditHistory(res.auditHistory || []);
        setWorkOrders(res.workOrders || []);
      } catch (err: any) {
        console.error('Failed to load issue details:', err);
        setErrorMessage(err.message || 'Unable to load issue details.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchIssue();
  }, [id]);

  if (isLoading) {
    return (
      <div className="p-12 text-center text-xs text-slate-400 bg-[#111c44] rounded-3xl border border-slate-800">
        Loading issue details...
      </div>
    );
  }

  if (errorMessage || !issueData) {
    return (
      <div className="p-8 rounded-3xl bg-[#111c44] border border-slate-800 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-white">Issue Not Found</h3>
        <p className="text-xs text-slate-400">{errorMessage || 'The requested defect could not be found.'}</p>
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 text-white text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" /> Go Back
        </button>
      </div>
    );
  }

  const initialPhoto =
    issueData.evidencePhotos?.[0] ||
    issueData.initialDetectionFrame ||
    (Array.isArray(issueData.evidencePhotos) && issueData.evidencePhotos.length > 0 ? issueData.evidencePhotos[0] : null);

  const workOrderWithEvidence = workOrders.find(
    (w) =>
      (w.evidenceIds && w.evidenceIds.length > 0) ||
      w.status === 'VERIFIED' ||
      w.status === 'SUBMITTED_FOR_VERIFICATION' ||
      w.completionEvidenceUrl
  );

  const repairPhoto =
    workOrderWithEvidence?.evidenceIds?.[0]?.fileUrl ||
    workOrderWithEvidence?.evidenceIds?.[0]?.mediaUrl ||
    (typeof workOrderWithEvidence?.evidenceIds?.[0] === 'string' && workOrderWithEvidence?.evidenceIds?.[0]?.startsWith('/')
      ? workOrderWithEvidence?.evidenceIds?.[0]
      : null) ||
    workOrderWithEvidence?.completionEvidenceUrl;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back Button */}
      <div>
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to list
        </button>
      </div>

      {/* Main Header Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#111c44] border border-slate-700/80 shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-sm font-bold text-sky-400">{issueData.referenceCode}</span>
              <Badge
                variant={
                  issueData.status === 'RESOLVED'
                    ? 'success'
                    : issueData.status === 'IN_PROGRESS' || issueData.status === 'ASSIGNED'
                    ? 'info'
                    : 'warning'
                }
                size="md"
              >
                {issueData.status}
              </Badge>
              <Badge variant="outline" size="md">
                Priority: {issueData.priorityLevel} (Score {issueData.priorityScore}/100)
              </Badge>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white">{issueData.title}</h1>
          </div>

          <div className="text-left sm:text-right text-xs text-slate-400 space-y-1">
            <div className="font-mono text-[11px]">
              Reported: {new Date(issueData.firstReportedAt || issueData.createdAt).toLocaleString()}
            </div>
            {issueData.resolvedAt && (
              <div className="text-emerald-400 font-semibold font-mono text-[11px]">
                Resolved: {new Date(issueData.resolvedAt).toLocaleString()}
              </div>
            )}
          </div>
        </div>

        {/* Location & Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-sky-400" /> Location Details
            </span>
            <div className="font-semibold text-slate-200">{issueData.location?.addressText || 'Nagpur Sector'}</div>
            {issueData.location?.coordinates && (
              <div className="text-[11px] font-mono text-slate-500">
                Coordinates: {issueData.location.coordinates[1]?.toFixed(4)}° N, {issueData.location.coordinates[0]?.toFixed(4)}° E
              </div>
            )}
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5 text-blue-400" /> Responsible Municipal Department
            </span>
            <div className="font-semibold text-slate-200">{issueData.departmentId?.name || 'Roads & Traffic Department'}</div>
            <div className="text-[11px] text-slate-500">
              Department Code: {issueData.departmentId?.code || 'ROADS'}
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-1.5 pt-2">
          <div className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-blue-400" /> Defect Description
          </div>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
            {issueData.description}
          </p>
        </div>

        {/* Evidence Photos Comparison */}
        <div className="space-y-3 pt-2">
          <div className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Camera className="w-4 h-4 text-emerald-400" /> Photographic Evidence Proof
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Before Photo */}
            <div className="space-y-1.5">
              <div className="text-[11px] font-bold text-amber-400 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> Initial Reported Defect
              </div>
              {initialPhoto ? (
                <div className="aspect-video rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden relative group">
                  <img src={initialPhoto} alt="Initial Defect" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="aspect-video rounded-2xl bg-slate-950 border border-dashed border-slate-800 flex items-center justify-center p-4 text-center">
                  <span className="text-xs text-slate-500">No initial photo uploaded with complaint</span>
                </div>
              )}
            </div>

            {/* After Photo */}
            <div className="space-y-1.5">
              <div className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Repaired Status Proof
              </div>
              {repairPhoto ? (
                <div className="aspect-video rounded-2xl bg-slate-950 border border-emerald-500/40 overflow-hidden relative group shadow-inner">
                  <img src={repairPhoto} alt="Repaired Defect" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="aspect-video rounded-2xl bg-slate-950 border border-dashed border-slate-800 flex items-center justify-center p-4 text-center">
                  <span className="text-xs text-slate-500">
                    {issueData.status === 'RESOLVED'
                      ? 'Verified on site by municipal engineering inspector'
                      : 'Pending contractor completion photo upload'}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Audit History Timeline */}
      {auditHistory.length > 0 && (
        <div className="p-6 rounded-3xl bg-[#111c44] border border-slate-700/80 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <History className="w-4 h-4 text-sky-400" />
            Activity & Resolution Timeline
          </h3>

          <div className="space-y-3">
            {auditHistory.map((log) => (
              <div key={log._id} className="flex items-start gap-3 text-xs">
                <div className="w-2 h-2 rounded-full bg-sky-400 mt-1.5 flex-shrink-0" />
                <div className="space-y-0.5 min-w-0">
                  <div className="text-slate-200 font-semibold">{log.action?.replace(/_/g, ' ')}</div>
                  <div className="text-slate-400 text-[11px]">
                    By: <span className="text-slate-300 font-medium">{log.actorName}</span> •{' '}
                    {new Date(log.timestamp).toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
