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

export default function RiskMapPanel({
  rows,
  isLoading,
  isError,
  onRetry,
}: {
  rows: RiskMapRow[];
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const [mapReady, setMapReady] = useState(false);
  const [mapLoadError, setMapLoadError] = useState<string | null>(null);
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
      pitch: 42,
      bearing: -14,
      antialias: true,
    });

    mapRef.current = map;

    map.on('load', () => {
      setMapReady(true);
      map.resize();
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

  useEffect(() => {
    if (!mapRef.current || !mapReady) return;

    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    enrichedRows.forEach(({ row, location, severity, lat, lng }) => {
      const el = document.createElement('div');
      el.className = 'h-3 w-3 rounded-full border border-white/80 shadow-[0_0_16px_rgba(34,211,238,0.7)]';
      el.style.background = getSeverityColor(severity);

      const marker = new mapboxgl.Marker({ element: el })
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

  return (
    <div className="relative min-h-[420px] w-full rounded-xl overflow-hidden border border-cyan-500/25 bg-[#050816] shadow-[inset_0_0_0_1px_rgba(34,211,238,0.08)]">
      {/* HUD corners */}
      <div className="pointer-events-none absolute inset-0 z-10">
        <span className="absolute left-2 top-2 h-6 w-6 border-l-2 border-t-2 border-cyan-400/50" />
        <span className="absolute right-2 top-2 h-6 w-6 border-r-2 border-t-2 border-cyan-400/50" />
        <span className="absolute bottom-2 left-2 h-6 w-6 border-b-2 border-l-2 border-cyan-400/50" />
        <span className="absolute bottom-2 right-2 h-6 w-6 border-b-2 border-r-2 border-cyan-400/50" />
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(34,211,238,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(34,211,238,0.35) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
      </div>

      <div ref={containerRef} className="absolute inset-0" />

      {isLoading ? (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-950/55 backdrop-blur-[2px]">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />
          <p className="mt-3 text-xs font-mono uppercase tracking-widest text-cyan-200/90">Syncing /risk/map</p>
        </div>
      ) : null}

      {isError ? (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-950/70 px-6 text-center backdrop-blur-sm">
          <p className="text-sm font-semibold text-red-200">Risk map API unavailable</p>
          <p className="mt-1 max-w-md text-xs text-slate-400">
            Mapbox basemap may still load. Check Network tab for <span className="font-mono">/api/proxy/risk/map</span> (HTTP status or timeout).
          </p>
          <button
            type="button"
            onClick={onRetry}
            className="mt-4 rounded-md border border-white/20 bg-white/10 px-4 py-2 text-sm text-white hover:bg-white/15"
          >
            Retry
          </button>
        </div>
      ) : null}

      {tokenMissing || mapLoadError ? (
        <div className="absolute bottom-3 left-3 right-3 z-30 rounded-md border border-amber-500/40 bg-amber-950/80 px-3 py-2 text-xs text-amber-100">
          Mapbox: {tokenMissing ? 'token missing (set NEXT_PUBLIC_MAPBOX_TOKEN)' : mapLoadError}
        </div>
      ) : null}

      {!isLoading && !isError && enrichedRows.length === 0 && mapReady ? (
        <div className="pointer-events-none absolute bottom-3 left-3 z-20 max-w-sm rounded-md border border-white/15 bg-slate-950/85 px-3 py-2 text-[11px] text-slate-300">
          Basemap live. No mappable rows in payload (add <span className="font-mono">lat/lng</span> or known district names).
        </div>
      ) : null}
    </div>
  );
}
