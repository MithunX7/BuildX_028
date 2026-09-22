"use client";

import React from "react";
import { MapPin, AlertTriangle, HardHat, Compass, Layers } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { CanonicalIssue } from "@/types/issue";

interface OperationsMapProps {
  issues: CanonicalIssue[];
  selectedIssueId?: string;
  onSelectIssue?: (issue: CanonicalIssue) => void;
}

export function OperationsMap({ issues, selectedIssueId, onSelectIssue }: OperationsMapProps) {
  // Approximate coordinate normalization for Nagpur visual canvas
  // Nagpur bounds: Lng [79.04 to 79.12], Lat [21.09 to 21.17]
  const minLng = 79.04;
  const maxLng = 79.12;
  const minLat = 21.09;
  const maxLat = 21.17;

  const projectToPercent = (lng: number, lat: number) => {
    const x = ((lng - minLng) / (maxLng - minLng)) * 100;
    const y = 100 - ((lat - minLat) / (maxLat - minLat)) * 100;
    return { x: Math.max(5, Math.min(x, 95)), y: Math.max(5, Math.min(y, 95)) };
  };

  return (
    <div className="rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-5 flex flex-col gap-4 h-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Compass className="w-4 h-4 text-sky-400" />
          <h3 className="text-sm font-bold text-white tracking-tight">Nagpur Spatial Intelligence & Conflicts</h3>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="warning" size="sm">
            <HardHat className="w-3 h-3 mr-1" /> Metro Conflict Zone Active
          </Badge>
        </div>
      </div>

      {/* Map Graphic Surface */}
      <div className="relative w-full aspect-video rounded-2xl bg-slate-950 border border-slate-800/80 overflow-hidden shadow-inner flex items-center justify-center">
        {/* Street Network Grid Lines */}
        <svg className="absolute inset-0 w-full h-full opacity-30 stroke-slate-700" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
          {/* Simulated Major Arterial Roads in Nagpur */}
          <line x1="15%" y1="90%" x2="55%" y2="45%" stroke="#38bdf8" strokeWidth="2.5" strokeOpacity="0.4" />
          <line x1="55%" y1="45%" x2="85%" y2="20%" stroke="#38bdf8" strokeWidth="2.5" strokeOpacity="0.4" />
          <line x1="10%" y1="45%" x2="90%" y2="45%" stroke="#64748b" strokeWidth="1.5" strokeOpacity="0.3" />
        </svg>

        {/* Major Nagpur Landmark Labels */}
        <div className="absolute top-[22%] left-[55%] text-[10px] font-bold text-slate-500 pointer-events-none">
          Sitabuldi Interchange
        </div>
        <div className="absolute bottom-[20%] left-[25%] text-[10px] font-bold text-slate-500 pointer-events-none">
          Wardha Road Corridor
        </div>
        <div className="absolute top-[45%] left-[20%] text-[10px] font-bold text-slate-500 pointer-events-none">
          Dharampeth Junction
        </div>

        {/* Construction Conflict Polygon Overlay (Dharampeth Metro Pipe Cut) */}
        <div className="absolute top-[40%] left-[16%] w-24 h-20 rounded-2xl border-2 border-amber-500/60 bg-amber-500/10 backdrop-blur-[1px] flex flex-col items-center justify-center p-1 pointer-events-none animate-pulse">
          <HardHat className="w-4 h-4 text-amber-400" />
          <span className="text-[9px] font-bold text-amber-300 text-center leading-tight mt-0.5">
            MahaMetro Utility Cut
          </span>
        </div>

        {/* Render Issue Pins */}
        {issues.map((issue) => {
          const coords = issue.location?.coordinates || [79.08, 21.14];
          const { x, y } = projectToPercent(coords[0], coords[1]);
          const isSelected = selectedIssueId === issue.id;

          let pinBg = "bg-blue-500";
          if (issue.priorityLevel === "CRITICAL") pinBg = "bg-rose-500";
          if (issue.priorityLevel === "HIGH") pinBg = "bg-amber-500";

          return (
            <button
              key={issue.id}
              onClick={() => onSelectIssue && onSelectIssue(issue)}
              style={{ top: `${y}%`, left: `${x}%` }}
              className={`absolute -translate-x-1/2 -translate-y-1/2 group cursor-pointer transition-all z-20 ${
                isSelected ? "scale-125 z-30" : "hover:scale-110"
              }`}
            >
              <div
                className={`w-7 h-7 rounded-full ${pinBg} text-slate-950 flex items-center justify-center shadow-lg font-bold text-xs border-2 border-white`}
              >
                <MapPin className="w-4 h-4" />
              </div>

              {/* Tooltip on Hover */}
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden group-hover:flex flex-col items-center pointer-events-none z-40 whitespace-nowrap">
                <div className="px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-800 text-[11px] font-bold text-white shadow-2xl">
                  <span>{issue.referenceCode}</span> • <span className="text-amber-400">{issue.priorityLevel}</span>
                </div>
                <div className="w-2 h-2 bg-slate-900 rotate-45 -mt-1 border-r border-b border-slate-800" />
              </div>
            </button>
          );
        })}
      </div>

      {/* Map Legend */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400 pt-1">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Critical Priority
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> High Priority
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Medium/Low
          </span>
        </div>
        <span className="text-[10px] text-slate-500">Nagpur Urban Coordinates (21.1458° N, 79.0882° E)</span>
      </div>
    </div>
  );
}
