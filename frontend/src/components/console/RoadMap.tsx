import React, { useEffect, useRef, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin } from 'lucide-react';
import { RoadData } from '../../services/maintenanceService';

const PRIORITY_COLOR: Record<string, string> = {
  CRITICAL: '#f43f5e',
  HIGH:     '#f97316',
  MEDIUM:   '#eab308',
  LOW:      '#22c55e',
};

const DECISION_RING: Record<string, string> = {
  RECOMMENDED: '#10b981',
  DEFERRED:    '#64748b',
  PENDING:     '#38bdf8',
};

function buildRoadIcon(road: RoadData, isSelected: boolean): L.DivIcon {
  const color  = PRIORITY_COLOR[road.priorityLevel] || '#38bdf8';
  const ring   = DECISION_RING[road.maintenanceDecision] || '#38bdf8';
  const size   = isSelected ? 28 : 20;
  const pulse  = road.priorityLevel === 'CRITICAL' ? `
    <span style="position:absolute;inset:0;border-radius:50%;background:${color};opacity:0.4;animation:leaflet-pulse 1.4s ease-out infinite;"></span>` : '';

  return L.divIcon({
    className: '',
    iconAnchor:   [size / 2, size / 2],
    popupAnchor:  [0, -(size / 2 + 6)],
    html: `
      <div style="position:relative;width:${size}px;height:${size}px;">
        ${pulse}
        <div style="
          position:absolute;inset:0;border-radius:50%;
          background:${color};
          border:3px solid ${ring};
          box-shadow:0 0 0 2px rgba(0,0,0,0.5),0 4px 14px ${color}80;
          ${isSelected ? 'transform:scale(1.3);' : ''}
        "></div>
      </div>`,
  });
}

interface RoadMapProps {
  roads: RoadData[];
  selectedRoadId?: string;
  onSelectRoad?: (road: RoadData) => void;
}

export const RoadMap: React.FC<RoadMapProps> = ({ roads, selectedRoadId, onSelectRoad }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef       = useRef<L.Map | null>(null);
  const markersRef   = useRef<Map<string, L.Marker>>(new Map());

  const buildPopup = useCallback((road: RoadData): string => {
    const color  = PRIORITY_COLOR[road.priorityLevel] || '#38bdf8';
    const ring   = DECISION_RING[road.maintenanceDecision] || '#38bdf8';
    const isRec  = road.maintenanceDecision === 'RECOMMENDED';
    return `
      <div style="padding:12px 14px;min-width:220px;">
        <div style="display:flex;align-items:center;gap:6px;margin-bottom:6px;">
          <span style="width:8px;height:8px;border-radius:50%;background:${color};flex-shrink:0;"></span>
          <span style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:${color};">${road.priorityLevel}</span>
          <span style="margin-left:auto;font-size:10px;font-weight:700;color:${ring};">${road.maintenanceDecision}</span>
        </div>
        <div style="font-size:13px;font-weight:800;color:#f1f5f9;margin-bottom:2px;">${road.roadName}</div>
        <div style="font-size:10px;color:#94a3b8;margin-bottom:8px;">📍 ${road.location}</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;">
          <div style="background:rgba(255,255,255,0.05);border-radius:8px;padding:6px;">
            <div style="font-size:9px;color:#64748b;font-weight:600;text-transform:uppercase;">Score</div>
            <div style="font-size:15px;font-weight:900;color:${color};font-family:monospace;">${road.priorityScore}<span style="font-size:10px;color:#64748b;">/110</span></div>
          </div>
          <div style="background:rgba(255,255,255,0.05);border-radius:8px;padding:6px;">
            <div style="font-size:9px;color:#64748b;font-weight:600;text-transform:uppercase;">Cost</div>
            <div style="font-size:15px;font-weight:900;color:#38bdf8;font-family:monospace;">₹${road.estimatedRepairCost}L</div>
          </div>
        </div>
        <div style="margin-top:8px;padding:5px 10px;border-radius:99px;text-align:center;font-size:10px;font-weight:700;
          background:${isRec ? 'rgba(16,185,129,0.15)' : 'rgba(100,116,139,0.15)'};
          border:1px solid ${isRec ? 'rgba(16,185,129,0.35)' : 'rgba(100,116,139,0.35)'};
          color:${isRec ? '#34d399' : '#94a3b8'};">
          ${isRec ? '✓ RECOMMENDED FOR REPAIR' : '✗ DEFERRED — BUDGET EXCEEDED'}
        </div>
      </div>`;
  }, []);

  // Init map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [21.1458, 79.0882],
      zoom: 12,
      zoomControl: true,
    });

    // OpenStreetMap standard tiles (reliable, no API key)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      markersRef.current.clear();
    };
  }, []);

  // Sync markers
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const currentIds = new Set(roads.map((r) => r._id));
    markersRef.current.forEach((m, id) => {
      if (!currentIds.has(id)) { m.remove(); markersRef.current.delete(id); }
    });

    roads.forEach((road) => {
      if (!road.latitude || !road.longitude) return;
      const isSelected = selectedRoadId === road._id;
      const existing = markersRef.current.get(road._id);

      if (existing) {
        existing.setIcon(buildRoadIcon(road, isSelected));
        existing.setPopupContent(buildPopup(road));
      } else {
        const marker = L.marker([road.latitude, road.longitude], {
          icon: buildRoadIcon(road, isSelected),
          zIndexOffset: isSelected ? 1000 : 0,
        });
        marker.bindPopup(buildPopup(road), {
          maxWidth: 260, minWidth: 220,
          closeButton: false, className: 'nmc-popup',
        });
        marker.on('click', () => {
          onSelectRoad && onSelectRoad(road);
          marker.openPopup();
        });
        marker.addTo(map);
        markersRef.current.set(road._id, marker);
      }
    });
  }, [roads, selectedRoadId, onSelectRoad, buildPopup]);

  // Fly-to on select
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selectedRoadId) return;
    const road = roads.find((r) => r._id === selectedRoadId);
    if (!road?.latitude) return;
    map.flyTo([road.latitude, road.longitude], Math.max(map.getZoom(), 15), { duration: 0.7 });
    setTimeout(() => markersRef.current.get(selectedRoadId)?.openPopup(), 500);
  }, [selectedRoadId, roads]);

  return (
    <div className="rounded-2xl sm:rounded-3xl border border-slate-700/60 shadow-2xl overflow-hidden flex flex-col" style={{ minHeight: 380 }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#0d1526]/90 backdrop-blur-sm border-b border-white/[0.07] flex-shrink-0">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-amber-400 flex-shrink-0" />
          <h3 className="text-sm font-bold text-white">Smart Maintenance Road Map</h3>
          <span className="hidden sm:inline text-[10px] text-slate-500 font-mono ml-1">Nagpur, Maharashtra</span>
        </div>
        <span className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          {roads.length} Roads Plotted
        </span>
      </div>

      {/* Leaflet map */}
      <div ref={containerRef} className="flex-1 w-full" style={{ minHeight: 320 }} />

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 px-4 py-2.5 bg-[#0d1526]/90 backdrop-blur-sm border-t border-white/[0.07] flex-shrink-0">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mr-1">Priority:</span>
        {Object.entries(PRIORITY_COLOR).map(([level, color]) => (
          <span key={level} className="flex items-center gap-1.5 text-[10px] text-slate-400">
            <span className="w-2 h-2 rounded-full" style={{ background: color }} />
            {level.charAt(0) + level.slice(1).toLowerCase()}
          </span>
        ))}
        <span className="ml-auto flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-[10px] text-slate-400">
            <span className="w-2.5 h-2.5 rounded-full border-2" style={{ borderColor: DECISION_RING.RECOMMENDED, background: 'transparent' }} />
            Recommended
          </span>
          <span className="flex items-center gap-1.5 text-[10px] text-slate-400">
            <span className="w-2.5 h-2.5 rounded-full border-2" style={{ borderColor: DECISION_RING.DEFERRED, background: 'transparent' }} />
            Deferred
          </span>
        </span>
      </div>
    </div>
  );
};
