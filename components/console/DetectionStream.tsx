"use client";

import React, { useEffect, useState } from "react";
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
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { DetectionEvent } from "@/types/detection";

interface DetectionStreamProps {
  latestDetection?: DetectionEvent | null;
  onSelectIssue?: (issueId: string) => void;
}

export function DetectionStream({ latestDetection, onSelectIssue }: DetectionStreamProps) {
  const [detections, setDetections] = useState<DetectionEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDetections = async () => {
    try {
      const res = await fetch("/api/detections?limit=15");
      const data = await res.json();
      if (data.success) {
        setDetections(data.data.detections);
      }
    } catch (err) {
      console.error("Failed to fetch detections:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDetections();
    const interval = setInterval(fetchDetections, 5000);
    return () => clearInterval(interval);
  }, []);

  // Prepend latest detection if triggered from video
  useEffect(() => {
    if (latestDetection) {
      setDetections((prev) => [latestDetection, ...prev.filter((d) => d.id !== latestDetection.id)]);
    }
  }, [latestDetection]);

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case "POTHOLE":
        return <AlertTriangle className="w-4 h-4 text-amber-400" />;
      case "GARBAGE_ACCUMULATION":
        return <Trash2 className="w-4 h-4 text-emerald-400" />;
      case "STREETLIGHT_FAULT":
        return <Zap className="w-4 h-4 text-sky-400" />;
      case "ROAD_OBSTRUCTION":
        return <Construction className="w-4 h-4 text-rose-400" />;
      default:
        return <Layers className="w-4 h-4 text-purple-400" />;
    }
  };

  return (
    <div className="rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-5 flex flex-col gap-4 h-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Radio className="w-4 h-4 text-rose-500 animate-pulse" />
          <h3 className="text-sm font-bold text-white tracking-tight">Real-Time Detection Event Feed</h3>
        </div>
        <span className="text-[11px] text-slate-500 font-mono">{detections.length} recorded events</span>
      </div>

      {/* Events List */}
      <div className="flex-1 overflow-y-auto space-y-2.5 max-h-[520px] pr-1">
        {isLoading && detections.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-500">Loading detection stream...</div>
        ) : detections.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-500">No detection events captured yet.</div>
        ) : (
          detections.map((event) => {
            const isNew = event.matchStatus === "NEW_CANONICAL_ISSUE";
            return (
              <div
                key={event.id}
                className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 transition-all space-y-2 group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1 rounded-lg bg-slate-900 border border-slate-800">
                      {getCategoryIcon(event.detectedClass)}
                    </div>
                    <span className="text-xs font-bold text-slate-200">
                      {event.detectedClass.replace("_", " ")}
                    </span>
                  </div>

                  <span className="text-[11px] font-mono text-slate-400">
                    {Math.round(event.confidence * 100)}% conf
                  </span>
                </div>

                <div className="flex items-center gap-1 text-[11px] text-slate-400">
                  <MapPin className="w-3 h-3 text-sky-400 shrink-0" />
                  <span className="truncate">{event.location?.addressText || "Nagpur Urban Zone"}</span>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-slate-800/60 text-[10px]">
                  <div className="flex items-center gap-1 text-slate-500 font-mono">
                    <Clock className="w-3 h-3" />
                    <span>{new Date(event.detectedAt).toLocaleTimeString()}</span>
                  </div>

                  {isNew ? (
                    <Badge variant="danger" size="sm">
                      <Flame className="w-2.5 h-2.5 mr-0.5" /> NEW ISSUE
                    </Badge>
                  ) : (
                    <button
                      onClick={() => event.matchedIssueId && onSelectIssue && onSelectIssue(event.matchedIssueId)}
                      className="inline-flex items-center gap-1 text-purple-400 hover:text-purple-300 font-medium cursor-pointer"
                    >
                      <Layers className="w-2.5 h-2.5" />
                      <span>Linked ({event.matchedIssueRef || "Duplicate"})</span>
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
}
