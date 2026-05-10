'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { MAPBOX_TOKEN } from '@/lib/config';

type RiskMapRow = Record<string, unknown>;

const LOCATION_COORDS: Record<string, [number, number]> = {
  Bhubaneswar: [85.8245, 20.2961],
  Cuttack: [85.883, 20.4625],
  Puri: [85.8312, 19.8135],
  Sambalpur: [83.9701, 21.4669],
  Rourkela: [84.8536, 22.2604],
};

const NORMALIZED_LOCATION_COORDS: Record<string, [number, number]> = Object.fromEntries(
  Object.entries(LOCATION_COORDS).map(([key, value]) => [key.toLowerCase().replace(/\s+/g, ''), value]),
);

function getSeverityColor(severity?: string): string {
  const value = String(severity ?? '').toLowerCase();
  if (value === 'critical' || value === 'high') return '#ef4444';
  if (value === 'medium' || value === 'warning') return '#f59e0b';
  return '#10b981';
}

function asNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

function rowLocation(row: RiskMapRow): string {
  const raw = row.location ?? row.district ?? row.name ?? row.city ?? row.region;
  return String(raw ?? '');
}

function rowSeverity(row: RiskMapRow): string | undefined {
  const s = row.severity ?? row.level ?? row.risk_level;
  return s !== undefined && s !== null ? String(s) : undefined;
}

function fmtCoord(n: number, axis: 'lat' | 'lng') {
  const abs = Math.abs(n);
  const dir = axis === 'lat' ? (n >= 0 ? 'N' : 'S') : n >= 0 ? 'E' : 'W';
  return `${abs.toFixed(4)}° ${dir}`;
}

export default function RiskMapPanel({
  rows,
  isLoading,
  isError,
  onRetry,
  activeLocation,
}: {
  rows: RiskMapRow[];
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  activeLocation?: string;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const [mapReady, setMapReady] = useState(false);
  const [mapLoadError, setMapLoadError] = useState<string | null>(null);
  const [center, setCenter] = useState<[number, number]>([85.5, 20.5]);
  const [zoom, setZoom] = useState<number>(6);
  const [bearing, setBearing] = useState<number>(-14);
  const tokenMissing = !MAPBOX_TOKEN;

  const enrichedRows = useMemo(() => {
    return rows
      .map((row) => {
        const location = rowLocation(row);
        const normalizedLocation = location.toLowerCase().replace(/\s+/g, '');
        const fallback = LOCATION_COORDS[location] ?? NORMALIZED_LOCATION_COORDS[normalizedLocation];
        const lat = asNumber(row.lat ?? row.latitude) ?? (fallback ? fallback[1] : null);
        const lng = asNumber(row.lng ?? row.lon ?? row.longitude) ?? (fallback ? fallback[0] : null);
        return { row, location, severity: rowSeverity(row), lat, lng };
      })
      .filter((r) => r.lat !== null && r.lng !== null);
  }, [rows]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    if (tokenMissing) return;

    mapboxgl.accessToken = MAPBOX_TOKEN;

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [85.5, 20.5],
      zoom: 6,
      pitch: 48,
      bearing: -14,
      antialias: true,
    });

    mapRef.current = map;

    map.on('load', () => {
      setMapReady(true);
      map.resize();
    });

    map.on('move', () => {
      const c = map.getCenter();
      setCenter([c.lng, c.lat]);
      setZoom(map.getZoom());
      setBearing(map.getBearing());
    });

    map.on('error', (e) => {
      const msg = e.error?.message ?? 'Map failed to load tiles';
      setMapLoadError(msg);
    });

    return () => {
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];
      map.remove();
      mapRef.current = null;
      setMapReady(false);
    };
  }, [tokenMissing]);

  // Markers
  useEffect(() => {
    if (!mapRef.current || !mapReady) return;

    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    enrichedRows.forEach(({ row, location, severity, lat, lng }) => {
      const wrap = document.createElement('div');
      wrap.style.position = 'relative';
      wrap.style.width = '20px';
      wrap.style.height = '20px';

      const ring = document.createElement('div');
      ring.style.cssText = `position:absolute;inset:0;border-radius:9999px;border:1px solid ${getSeverityColor(severity)};opacity:0.45;`;

      const dot = document.createElement('div');
      const color = getSeverityColor(severity);
      dot.style.cssText = `position:absolute;left:50%;top:50%;width:8px;height:8px;margin:-4px 0 0 -4px;border-radius:9999px;background:${color};box-shadow:0 0 12px ${color};`;

      const tag = document.createElement('div');
      tag.textContent = location || 'unknown';
      tag.style.cssText = `position:absolute;left:14px;top:-6px;font:600 9px/1 ui-monospace,monospace;letter-spacing:0.12em;text-transform:uppercase;color:#a5f3fc;background:rgba(2,6,23,0.85);padding:3px 5px;border:1px solid rgba(34,211,238,0.25);border-radius:2px;white-space:nowrap;`;

      wrap.appendChild(ring);
      wrap.appendChild(dot);
      wrap.appendChild(tag);

      const marker = new mapboxgl.Marker({ element: wrap, anchor: 'center' })
        .setLngLat([lng as number, lat as number])
        .setPopup(
          new mapboxgl.Popup({ closeButton: false, offset: 14 }).setHTML(
            `<div style="font-family:ui-monospace,monospace;color:#0f172a;min-width:140px">
              <p style="font-weight:700;margin:0 0 4px 0">${location || 'Unknown'}</p>
              <p style="font-size:11px;margin:0">Severity: ${severity ?? 'N/A'}</p>
              <p style="font-size:11px;margin:0">Score: ${String(row.final_score ?? row.risk_score ?? 'N/A')}</p>
            </div>`,
          ),
        )
        .addTo(mapRef.current as mapboxgl.Map);

      markersRef.current.push(marker);
    });
  }, [enrichedRows, mapReady]);

  // Fly to active location when it changes
  useEffect(() => {
    if (!mapRef.current || !mapReady || !activeLocation) return;
    const target =
      LOCATION_COORDS[activeLocation] ??
      NORMALIZED_LOCATION_COORDS[activeLocation.toLowerCase().replace(/\s+/g, '')];
    if (!target) return;
    mapRef.current.flyTo({ center: target, zoom: 8.5, pitch: 52, speed: 1.1, curve: 1.4 });
  }, [activeLocation, mapReady]);

  return (
    <div className="relative h-full min-h-[440px] w-full overflow-hidden rounded-md border border-cyan-400/20 bg-[#03070f]">
      {/* Map */}
      <div ref={containerRef} className="absolute inset-0" />

      {/* Radar sweep over the map (subtle, no scrim) */}
      {mapReady && !isError ? (
        <div className="pointer-events-none absolute left-1/2 top-1/2 z-10 h-[120%] w-[120%] -translate-x-1/2 -translate-y-1/2 mix-blend-screen opacity-60">
          <div className="radar-sweep absolute inset-0 rounded-full" />
        </div>
      ) : null}

      {/* Crosshair + concentric rings */}
      {mapReady ? (
        <div className="pointer-events-none absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2">
          <div className="relative h-32 w-32">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-300/25"
                style={{ width: i * 38, height: i * 38 }}
              />
            ))}
            <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-cyan-300/25" />
            <div className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-cyan-300/25" />
            <div className="absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-300 shadow-[0_0_8px_#22d3ee]" />
          </div>
        </div>
      ) : null}

      {/* Grid overlay */}
      <div className="pointer-events-none absolute inset-0 z-10 opacity-[0.06] hud-grid-overlay" />

      {/* Coordinate readout — bottom left */}
      <div className="pointer-events-none absolute bottom-3 left-3 z-20 rounded-sm border border-cyan-400/25 bg-black/60 px-2 py-1 font-mono text-[10px] uppercase tracking-widest text-cyan-200">
        <p>LAT {fmtCoord(center[1], 'lat')}</p>
        <p>LNG {fmtCoord(center[0], 'lng')}</p>
        <p className="text-slate-500">ZOOM {zoom.toFixed(2)} · BRG {bearing.toFixed(0)}°</p>
      </div>

      {/* Severity legend — bottom right */}
      <div className="pointer-events-none absolute bottom-3 right-3 z-20 flex gap-2 rounded-sm border border-cyan-400/25 bg-black/60 px-2 py-1 font-mono text-[10px] uppercase tracking-widest">
        <span className="flex items-center gap-1 text-emerald-300">
          <span className="h-2 w-2 rounded-full bg-emerald-400" /> Low
        </span>
        <span className="flex items-center gap-1 text-amber-300">
          <span className="h-2 w-2 rounded-full bg-amber-400" /> Med
        </span>
        <span className="flex items-center gap-1 text-red-300">
          <span className="h-2 w-2 rounded-full bg-red-400" /> High
        </span>
      </div>

      {/* Active region label — top left */}
      {activeLocation ? (
        <div className="pointer-events-none absolute left-3 top-3 z-20 rounded-sm border border-cyan-400/25 bg-black/60 px-2 py-1 font-mono text-[10px] uppercase tracking-widest text-cyan-200">
          <p className="text-slate-500">TARGET</p>
          <p className="text-cyan-100">{activeLocation}</p>
        </div>
      ) : null}

      {/* States */}
      {isLoading ? (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-slate-950/55">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />
          <p className="mt-3 font-mono text-[10px] uppercase tracking-widest text-cyan-200/90">SYNCING /risk/map</p>
        </div>
      ) : null}

      {isError ? (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-slate-950/70 px-6 text-center">
          <p className="text-sm font-semibold text-red-200">/risk/map upstream unavailable</p>
          <p className="mt-1 max-w-md text-xs text-slate-400">
            Basemap may still load. Inspect <span className="font-mono">/api/proxy/risk/map</span> in Network tab.
          </p>
          <button
            type="button"
            onClick={onRetry}
            className="mt-4 rounded-sm border border-cyan-400/40 bg-cyan-500/10 px-4 py-1.5 font-mono text-[10px] uppercase tracking-widest text-cyan-200 hover:bg-cyan-500/20"
          >
            Retry transmission
          </button>
        </div>
      ) : null}

      {tokenMissing || mapLoadError ? (
        <div className="absolute bottom-14 left-3 right-3 z-30 rounded-sm border border-amber-500/40 bg-amber-950/80 px-3 py-2 font-mono text-[10px] uppercase tracking-widest text-amber-100">
          MAPBOX: {tokenMissing ? 'TOKEN MISSING (set NEXT_PUBLIC_MAPBOX_TOKEN)' : mapLoadError}
        </div>
      ) : null}

      {!isLoading && !isError && enrichedRows.length === 0 && mapReady ? (
        <div className="pointer-events-none absolute left-3 top-16 z-20 max-w-sm rounded-sm border border-white/15 bg-slate-950/85 px-2 py-1 font-mono text-[10px] uppercase tracking-widest text-slate-300">
          BASEMAP LIVE · NO MAPPABLE ROWS IN PAYLOAD
        </div>
      ) : null}
    </div>
  );
}
