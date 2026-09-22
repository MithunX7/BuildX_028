import React, { useEffect, useRef, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Compass, HardHat } from 'lucide-react';

// Fix Leaflet's default icon path issue with Vite bundler
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface OperationsMapProps {
  issues: any[];
  selectedIssueId?: string;
  onSelectIssue?: (issue: any) => void;
}

// ─── Priority colours ─────────────────────────────────────────────────────────
const PRIORITY_COLOR: Record<string, string> = {
  CRITICAL: '#f43f5e',
  HIGH:     '#f59e0b',
  MEDIUM:   '#38bdf8',
  LOW:      '#22c55e',
};

const PRIORITY_GLOW: Record<string, string> = {
  CRITICAL: 'rgba(244,63,94,0.45)',
  HIGH:     'rgba(245,158,11,0.45)',
  MEDIUM:   'rgba(56,189,248,0.45)',
  LOW:      'rgba(34,197,94,0.45)',
};

// ─── Build a custom DivIcon for each issue ────────────────────────────────────
function buildDivIcon(priority: string, isSelected: boolean): L.DivIcon {
  const color  = PRIORITY_COLOR[priority]  || PRIORITY_COLOR.MEDIUM;
  const glow   = PRIORITY_GLOW[priority]   || PRIORITY_GLOW.MEDIUM;
  const size   = isSelected ? 22 : 16;
  const pulse  = priority === 'CRITICAL' ? `
    <span style="
      position:absolute;inset:0;border-radius:50%;
      background:${color};opacity:0.4;
      animation:leaflet-pulse 1.5s ease-out infinite;
    "></span>` : '';

  return L.divIcon({
    className: '',
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -(size / 2 + 4)],
    html: `
      <div style="position:relative;width:${size}px;height:${size}px;">
        ${pulse}
        <div style="
          position:absolute;inset:0;border-radius:50%;
          background:${color};
          border:2px solid white;
          box-shadow:0 0 0 2px ${glow},0 4px 12px ${glow};
          transition:transform 0.15s;
          ${isSelected ? 'transform:scale(1.4);' : ''}
        "></div>
      </div>`,
  });
}

// ─── Map tile providers ───────────────────────────────────────────────────────
const TILE_LAYERS = {
  standard: {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  },
  carto_dark: {
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>',
  },
  carto_light: {
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>',
  },
};

// ─── CSS for pulse animation ──────────────────────────────────────────────────
const PULSE_STYLE = `
@keyframes leaflet-pulse {
  0%   { transform: scale(1);   opacity: 0.5; }
  70%  { transform: scale(2.2); opacity: 0; }
  100% { transform: scale(1);   opacity: 0; }
}
.leaflet-container {
  font-family: inherit;
  background: #0d1526;
}
.leaflet-popup-content-wrapper {
  background: #0f172a;
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 14px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.5);
  color: white;
  padding: 0;
}
.leaflet-popup-tip-container { display: none; }
.leaflet-popup-content { margin: 0; }
.leaflet-control-zoom a {
  background: #0f172a !important;
  color: #94a3b8 !important;
  border-color: rgba(255,255,255,0.1) !important;
}
.leaflet-control-zoom a:hover {
  background: #1e293b !important;
  color: white !important;
}
.leaflet-control-attribution {
  background: rgba(0,0,0,0.6) !important;
  color: #64748b !important;
  font-size: 9px !important;
}
.leaflet-control-attribution a { color: #94a3b8 !important; }
`;

// ─── Component ────────────────────────────────────────────────────────────────
export const OperationsMap: React.FC<OperationsMapProps> = ({
  issues,
  selectedIssueId,
  onSelectIssue,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef          = useRef<L.Map | null>(null);
  const markersRef      = useRef<Map<string, L.Marker>>(new Map());
  const tileLayerRef    = useRef<L.TileLayer | null>(null);

  // ─ Popup HTML builder ──────────────────────────────────────────────────────
  const buildPopupHtml = useCallback((issue: any): string => {
    const color = PRIORITY_COLOR[issue.priorityLevel] || PRIORITY_COLOR.MEDIUM;
    const cat = (issue.category || '').replace(/_/g, ' ');
    return `
      <div style="padding:12px 14px;min-width:210px;">
        <div style="display:flex;align-items:center;gap:6px;margin-bottom:6px;">
          <span style="width:8px;height:8px;border-radius:50%;background:${color};flex-shrink:0;"></span>
          <span style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:${color};">
            ${issue.priorityLevel}
          </span>
          <span style="margin-left:auto;font-family:monospace;font-size:10px;color:#64748b;">${issue.referenceCode || ''}</span>
        </div>
        <div style="font-size:12px;font-weight:700;color:#f1f5f9;line-height:1.3;margin-bottom:4px;">${issue.title || 'Untitled Issue'}</div>
        ${issue.location?.addressText ? `<div style="font-size:10px;color:#94a3b8;margin-bottom:6px;">📍 ${issue.location.addressText}</div>` : ''}
        <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:6px;">
          <span style="padding:2px 8px;border-radius:99px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);font-size:9px;font-weight:600;color:#94a3b8;text-transform:uppercase;">
            ${cat}
          </span>
          <span style="padding:2px 8px;border-radius:99px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);font-size:9px;font-weight:600;color:#94a3b8;text-transform:uppercase;">
            ${(issue.status || 'NEW').replace(/_/g, ' ')}
          </span>
        </div>
      </div>`;
  }, []);

  // ─ Initialise map once ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Inject CSS
    const styleEl = document.createElement('style');
    styleEl.textContent = PULSE_STYLE;
    document.head.appendChild(styleEl);

    // Create map centred on Nagpur
    const map = L.map(mapContainerRef.current, {
      center: [21.1458, 79.0882],
      zoom: 13,
      zoomControl: true,
      attributionControl: true,
    });

    // Dark CartoDB tile layer (looks stunning, no API key)
    const tile = L.tileLayer(TILE_LAYERS.carto_dark.url, {
      attribution: TILE_LAYERS.carto_dark.attribution,
      maxZoom: 20,
      subdomains: 'abcd',
    }).addTo(map);

    tileLayerRef.current = tile;
    mapRef.current = map;

    // Layer control: switch between dark, light, standard
    const overlays: Record<string, L.TileLayer> = {};
    const baseLayers: Record<string, L.TileLayer> = {
      '🌑 Dark (Default)': tile,
      '☀️ Light': L.tileLayer(TILE_LAYERS.carto_light.url, {
        attribution: TILE_LAYERS.carto_light.attribution,
        maxZoom: 20,
        subdomains: 'abcd',
      }),
      '🗺️ Standard OSM': L.tileLayer(TILE_LAYERS.standard.url, {
        attribution: TILE_LAYERS.standard.attribution,
        maxZoom: 19,
      }),
    };
    L.control.layers(baseLayers, overlays, { position: 'topright', collapsed: true }).addTo(map);

    return () => {
      map.remove();
      mapRef.current = null;
      markersRef.current.clear();
      styleEl.remove();
    };
  }, []);

  // ─ Sync markers when issues change ────────────────────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const currentIds = new Set(issues.map((i) => i._id || i.id));

    // Remove stale markers
    markersRef.current.forEach((marker, id) => {
      if (!currentIds.has(id)) {
        marker.remove();
        markersRef.current.delete(id);
      }
    });

    // Add / update markers
    issues.forEach((issue) => {
      const id       = issue._id || issue.id;
      const coords   = issue.location?.coordinates;
      if (!coords || coords.length < 2) return;

      const lat       = coords[1];
      const lng       = coords[0];
      const isSelected = selectedIssueId === id;

      const existing = markersRef.current.get(id);
      if (existing) {
        existing.setIcon(buildDivIcon(issue.priorityLevel, isSelected));
      } else {
        const marker = L.marker([lat, lng], {
          icon: buildDivIcon(issue.priorityLevel, isSelected),
          zIndexOffset: isSelected ? 1000 : 0,
        });

        marker.bindPopup(buildPopupHtml(issue), {
          maxWidth: 260,
          minWidth: 210,
          closeButton: false,
          className: 'nmc-popup',
        });

        marker.on('click', () => {
          onSelectIssue && onSelectIssue(issue);
          marker.openPopup();
        });

        marker.addTo(map);
        markersRef.current.set(id, marker);
      }
    });
  }, [issues, selectedIssueId, onSelectIssue, buildPopupHtml]);

  // ─ Fly-to on selection ─────────────────────────────────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selectedIssueId) return;

    const issue = issues.find((i) => (i._id || i.id) === selectedIssueId);
    if (!issue) return;

    const coords = issue.location?.coordinates;
    if (!coords || coords.length < 2) return;

    map.flyTo([coords[1], coords[0]], Math.max(map.getZoom(), 15), {
      animate: true,
      duration: 0.8,
    });

    // Open its popup
    const marker = markersRef.current.get(selectedIssueId);
    if (marker) {
      marker.setIcon(buildDivIcon(issue.priorityLevel, true));
      setTimeout(() => marker.openPopup(), 400);
    }
  }, [selectedIssueId, issues, buildPopupHtml]);

  return (
    <div className="rounded-2xl sm:rounded-3xl border border-slate-700/60 shadow-2xl overflow-hidden flex flex-col h-full min-h-[360px]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#0d1526]/90 backdrop-blur-sm border-b border-white/[0.07] flex-shrink-0">
        <div className="flex items-center gap-2">
          <Compass className="w-4 h-4 text-sky-400 flex-shrink-0" />
          <h3 className="text-sm font-bold text-white tracking-tight">Nagpur Spatial Intelligence</h3>
          <span className="hidden sm:inline text-[10px] text-slate-500 font-mono ml-1">21.1458°N · 79.0882°E</span>
        </div>
        <div className="flex items-center gap-2">
          {/* Live indicator */}
          <span className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            LIVE
          </span>
          <div className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-500/10 border border-amber-500/25">
            <HardHat className="w-3 h-3 text-amber-400" />
            <span className="text-[10px] font-bold text-amber-400">Metro Zone</span>
          </div>
        </div>
      </div>

      {/* Map container — Leaflet mounts here */}
      <div ref={mapContainerRef} className="flex-1 w-full" style={{ minHeight: 320 }} />

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 px-4 py-2.5 bg-[#0d1526]/90 backdrop-blur-sm border-t border-white/[0.07] flex-shrink-0">
        {Object.entries(PRIORITY_COLOR).map(([level, color]) => (
          <span key={level} className="flex items-center gap-1.5 text-[10px] sm:text-[11px] text-slate-400">
            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: color }} />
            {level.charAt(0) + level.slice(1).toLowerCase()}
          </span>
        ))}
        <span className="ml-auto text-[10px] text-slate-600 hidden sm:inline">Click marker to inspect · Use layer switcher to change style</span>
      </div>
    </div>
  );
};
