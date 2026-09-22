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
  Layers,
  Sparkles,
  ExternalLink,
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
      <div className="p-12 text-center text-xs text-slate-400 bg-[#0f172a]/70 rounded-3xl border border-white/[0.08]">
        Loading issue details...
      </div>
    );
  }

  if (errorMessage || !issueData) {
    return (
      <div className="p-8 sm:p-12 rounded-3xl bg-[#0f172a]/70 border border-white/[0.08] text-center space-y-4 max-w-lg mx-auto">
        <div className="w-14 h-14 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-7 h-7" />
        </div>
        <h3 className="text-lg font-bold text-white">Issue Not Found</h3>
        <p className="text-xs text-slate-400">{errorMessage || 'The requested defect could not be found.'}</p>
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-slate-800 text-white text-xs font-bold"
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

  const steps = [
    { title: 'Reported', completed: true },
    { title: 'Triage & Risk Score', completed: issueData.status !== 'NEW' },
    { title: 'Contractor Dispatched', completed: issueData.status === 'ASSIGNED' || issueData.status === 'IN_PROGRESS' || issueData.status === 'SUBMITTED_FOR_VERIFICATION' || issueData.status === 'RESOLVED' },
    { title: 'Field Work Submitted', completed: !!repairPhoto || issueData.status === 'SUBMITTED_FOR_VERIFICATION' || issueData.status === 'RESOLVED' },
    { title: 'Engineering Verified', completed: issueData.status === 'RESOLVED' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back Button */}
      <div>
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to list
        </button>
      </div>

      {/* Main Header Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#0f172a]/80 backdrop-blur-xl border border-white/[0.08] shadow-2xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-white/[0.08]">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-base font-black text-sky-400">{issueData.referenceCode}</span>
              <Badge
                variant={
                  issueData.status === 'RESOLVED'
                    ? 'success'
                    : issueData.status === 'IN_PROGRESS' || issueData.status === 'ASSIGNED'
                    ? 'info'
                    : 'warning'
                }
              >
                {issueData.status.replace('_', ' ')}
              </Badge>
              <Badge variant="outline" size="sm">
                Priority: {issueData.priorityLevel} ({issueData.priorityScore || 50}/100)
              </Badge>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white">{issueData.title}</h1>
          </div>

          <div className="text-right sm:text-right text-xs text-slate-400 font-mono">
            <div>Reported: {new Date(issueData.firstReportedAt || issueData.createdAt).toLocaleDateString()}</div>
            <div className="text-amber-400 font-bold mt-0.5">SLA Target: 24h</div>
          </div>
        </div>

        {/* Lifecycle Stepper */}
        <div className="space-y-2">
          <div className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
            Resolution Lifecycle Status
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {steps.map((st, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-2xl border text-center space-y-1 transition-all ${
                  st.completed
                    ? 'bg-blue-600/15 border-blue-500/40 text-white'
                    : 'bg-slate-900/50 border-white/[0.06] text-slate-500'
                }`}
              >
                <div className="flex items-center justify-center">
                  <CheckCircle2 className={`w-4 h-4 ${st.completed ? 'text-blue-400' : 'text-slate-600'}`} />
                </div>
                <div className="text-[11px] font-bold leading-tight">{st.title}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Metadata Telemetry Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-white/[0.06] space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-sky-400" /> Defect Geolocation
            </span>
            <div className="font-semibold text-xs text-slate-200">{issueData.location?.addressText || 'Nagpur'}</div>
            {issueData.location?.coordinates && (
              <div className="text-[11px] font-mono text-slate-400">
                {issueData.location.coordinates[1]?.toFixed(4)}° N, {issueData.location.coordinates[0]?.toFixed(4)}° E
              </div>
            )}
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/70 border border-white/[0.06] space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-blue-400" /> Assigned Municipal Agency
            </span>
            <div className="font-semibold text-xs text-slate-200">
              {issueData.departmentId?.name || 'Roads & Traffic Department'}
            </div>
            <div className="text-[11px] font-mono text-slate-400">
              Dept Code: {issueData.departmentId?.code || 'ROADS'} • Standard SLA: 24h
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <div className="text-xs font-extrabold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-blue-400" /> Defect Description
          </div>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed bg-slate-950/60 p-4 rounded-2xl border border-white/[0.06]">
            {issueData.description}
          </p>
        </div>

        {/* Before vs After Dual Photo Comparison */}
        <div className="space-y-3 pt-2">
          <div className="text-xs font-extrabold text-slate-200 uppercase tracking-wider flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Camera className="w-4 h-4 text-emerald-400" /> Photographic Proof Verification
            </span>
            <span className="text-[10px] font-normal text-slate-400">Audited Proof</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Before Photo */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" /> BEFORE (Reported Defect)
              </div>
              {initialPhoto ? (
                <div className="aspect-video rounded-2xl bg-slate-950 border border-white/[0.1] overflow-hidden shadow-inner">
                  <img src={initialPhoto} alt="Initial Defect" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="aspect-video rounded-2xl bg-slate-950 border border-dashed border-white/[0.08] flex items-center justify-center p-4 text-center">
                  <span className="text-xs text-slate-500">No initial photo uploaded with complaint</span>
                </div>
              )}
            </div>

            {/* After Photo */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" /> AFTER (Contractor Repair Evidence)
              </div>
              {repairPhoto ? (
                <div className="aspect-video rounded-2xl bg-slate-950 border border-emerald-500/40 overflow-hidden shadow-inner ring-1 ring-emerald-500/20">
                  <img src={repairPhoto} alt="Repaired Defect" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="aspect-video rounded-2xl bg-slate-950 border border-dashed border-white/[0.08] flex items-center justify-center p-4 text-center">
                  <span className="text-xs text-slate-500">
                    {issueData.status === 'RESOLVED'
                      ? 'Verified on site by municipal engineering inspector'
                      : 'Pending field repair completion photo upload'}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Activity Timeline */}
      {auditHistory.length > 0 && (
        <div className="p-6 rounded-3xl bg-[#0f172a]/70 backdrop-blur border border-white/[0.08] shadow-xl space-y-4">
          <h3 className="text-sm font-black text-white flex items-center gap-2">
            <History className="w-4 h-4 text-sky-400" />
            Activity & Resolution Timeline
          </h3>

          <div className="space-y-3">
            {auditHistory.map((log) => (
              <div key={log._id} className="flex items-start gap-3 text-xs">
                <div className="w-2 h-2 rounded-full bg-blue-400 mt-1.5 flex-shrink-0" />
                <div className="space-y-0.5 min-w-0">
                  <div className="font-bold text-white flex items-center gap-2">
                    <span>{log.action?.replace(/_/g, ' ')}</span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(log.timestamp || log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-slate-400 text-[11px]">
                    Action logged by <strong className="text-slate-300">{log.actorName || 'System'}</strong>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
