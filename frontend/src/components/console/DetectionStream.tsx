import React, { useEffect, useState } from 'react';
import {
  Radio,
  AlertTriangle,
  Trash2,
  Zap,
  Construction,
  Layers,
  Flame,
  Clock,
  MapPin,
  ExternalLink,
} from 'lucide-react';
import { Badge } from '../ui/Badge';
import { detectionService } from '../../services/detectionService';

interface DetectionStreamProps {
  latestDetection?: any | null;
  onSelectIssue?: (issueId: string) => void;
}

export const DetectionStream: React.FC<DetectionStreamProps> = ({
  latestDetection,
  onSelectIssue,
}) => {
  const [detections, setDetections] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDetections = async () => {
    try {
      const data = await detectionService.getDetections(20);
      setDetections(data);
    } catch (err) {
      console.error('Failed to fetch detections:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDetections();
    const interval = setInterval(fetchDetections, 4500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (latestDetection?.detectionRecord) {
      setDetections((prev) => [latestDetection.detectionRecord, ...prev]);
    }
  }, [latestDetection]);

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'POTHOLE':
        return <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />;
      case 'GARBAGE_ACCUMULATION':
        return <Trash2 className="w-3.5 h-3.5 text-emerald-400" />;
      case 'STREETLIGHT_FAULT':
        return <Zap className="w-3.5 h-3.5 text-sky-400" />;
      case 'ROAD_OBSTRUCTION':
        return <Construction className="w-3.5 h-3.5 text-rose-400" />;
      default:
        return <Layers className="w-3.5 h-3.5 text-purple-400" />;
    }
  };

  return (
    <div className="rounded-2xl sm:rounded-3xl bg-[#111c44] border border-slate-700/80 shadow-2xl p-4 sm:p-5 flex flex-col gap-3 h-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Radio className="w-4 h-4 text-rose-500 animate-pulse flex-shrink-0" />
          <h3 className="text-sm font-bold text-white tracking-tight">Real-Time Event Feed</h3>
        </div>
        <span className="text-[11px] text-slate-400 font-mono">
          {detections.length} events
        </span>
      </div>

      {/* Events List */}
      <div className="flex-1 overflow-y-auto space-y-2.5 max-h-[460px] sm:max-h-[520px] pr-1">
        {isLoading && detections.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-400">Streaming detections...</div>
        ) : detections.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-400">No events captured yet.</div>
        ) : (
          detections.map((event, idx) => {
            const isNew = event.matchStatus === 'NEW_CANONICAL_ISSUE';
            return (
              <div
                key={event._id || event.id || idx}
                className="p-3 rounded-xl sm:rounded-2xl bg-slate-900/80 border border-slate-800/80 hover:border-slate-700 transition-all space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1 rounded-lg bg-slate-950 border border-slate-800">
                      {getCategoryIcon(event.detectedClass)}
                    </div>
                    <span className="text-xs font-bold text-slate-200">
                      {(event.detectedClass || '').replace('_', ' ')}
                    </span>
                  </div>

                  <span className="text-[10px] sm:text-[11px] font-mono text-slate-400">
                    {Math.round((event.confidence || 0.85) * 100)}% conf
                  </span>
                </div>

                <div className="flex items-center gap-1 text-[11px] text-slate-400">
                  <MapPin className="w-3 h-3 text-sky-400 flex-shrink-0" />
                  <span className="truncate">{event.location?.addressText || 'Nagpur Urban Sector'}</span>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-slate-800/60 text-[10px]">
                  <div className="flex items-center gap-1 text-slate-400 font-mono">
                    <Clock className="w-3 h-3" />
                    <span>{event.detectedAt ? new Date(event.detectedAt).toLocaleTimeString() : 'Just now'}</span>
                  </div>

                  {isNew ? (
                    <Badge variant="danger" size="sm">
                      <Flame className="w-2.5 h-2.5 mr-0.5" /> NEW DEFECT
                    </Badge>
                  ) : (
                    <button
                      onClick={() => {
                        const targetId = event.matchedIssueId?._id || event.matchedIssueId;
                        if (targetId && onSelectIssue) onSelectIssue(targetId);
                      }}
                      className="inline-flex items-center gap-1 text-purple-400 hover:text-purple-300 font-medium cursor-pointer"
                    >
                      <Layers className="w-2.5 h-2.5" />
                      <span>Linked Cluster</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
