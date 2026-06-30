'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { MAPBOX_TOKEN } from '@/lib/config';
import { useMission } from '@/components/dashboard/MissionContext';

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

function normalizeLocationKey(location: string): string {
  return location.toLowerCase().replace(/\s+/g, '');
}

function displayLocationName(location: string): string {
  if (!location) return 'Unknown';
  return location.charAt(0).toUpperCase() + location.slice(1).toLowerCase();
}

/** Skip state-level or unknown rows that would duplicate or misplace pins. */
function isMappableLocation(location: string): boolean {
  const key = normalizeLocationKey(location);
  if (!key || key === 'odisha' || key === 'orissa') return false;
  return Boolean(LOCATION_COORDS[displayLocationName(location)] ?? NORMALIZED_LOCATION_COORDS[key]);
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
  const { uiMode } = useMission();
  const std = uiMode === 'standard';
  const mapStyle = std ? 'mapbox://styles/mapbox/light-v11' : 'mapbox://styles/mapbox/dark-v11';
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [mapLoadError, setMapLoadError] = useState<string | null>(null);
  const [center, setCenter] = useState<[number, number]>([85.5, 20.5]);
  const [zoom, setZoom] = useState<number>(6);
  const [bearing, setBearing] = useState<number>(-14);
  const tokenMissing = !MAPBOX_TOKEN;

  const mapPoints = useMemo(() => {
    const byKey = new Map<
      string,
      { row: RiskMapRow; location: string; severity: string | undefined; lat: number; lng: number; score: number }
    >();

    rows.forEach((row) => {
      const location = rowLocation(row);
      if (!isMappableLocation(location)) return;

      const normalizedLocation = normalizeLocationKey(location);
      const displayName = displayLocationName(location);
      const fallback =
        LOCATION_COORDS[displayName] ??
        LOCATION_COORDS[location] ??
        NORMALIZED_LOCATION_COORDS[normalizedLocation];
      const lat = asNumber(row.lat ?? row.latitude) ?? (fallback ? fallback[1] : null);
      const lng = asNumber(row.lng ?? row.lon ?? row.longitude) ?? (fallback ? fallback[0] : null);
      if (lat === null || lng === null) return;

      const score = asNumber(row.final_score ?? row.risk_score) ?? 0;
      const existing = byKey.get(normalizedLocation);
      if (!existing || score >= existing.score) {
        byKey.set(normalizedLocation, {
          row,
          location: displayName,
          severity: rowSeverity(row),
          lat,
          lng,
          score,
        });
      }
    });

    return Array.from(byKey.values());
  }, [rows]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    if (tokenMissing) return;

    mapboxgl.accessToken = MAPBOX_TOKEN;

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: mapStyle,
      center: [85.5, 20.5],
      zoom: 6,
      pitch: std ? 0 : 48,
      bearing: std ? 0 : -14,
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
      const map = mapRef.current;
      if (map) {
        if (map.getLayer('risk-labels')) map.removeLayer('risk-labels');
        if (map.getLayer('risk-circles')) map.removeLayer('risk-circles');
        if (map.getLayer('risk-circles-active')) map.removeLayer('risk-circles-active');
        if (map.getSource('risk-points')) map.removeSource('risk-points');
      }
      map?.remove();
      mapRef.current = null;
      setMapReady(false);
    };
  }, [tokenMissing, mapStyle]);

  // GeoJSON layers - pins stay locked to coordinates at every zoom level
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) return;

    const activeKey = activeLocation ? normalizeLocationKey(activeLocation) : '';

    const geojson: GeoJSON.FeatureCollection = {
      type: 'FeatureCollection',
      features: mapPoints.map(({ location, severity, lat, lng, row, score }) => ({
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [lng, lat] },
        properties: {
          location,
          severity: severity ?? 'low',
          score,
          isActive: normalizeLocationKey(location) === activeKey ? 1 : 0,
          popupHtml: `<div style="font-family:ui-monospace,monospace;color:#0f172a;min-width:140px">
            <p style="font-weight:700;margin:0 0 4px 0">${location}</p>
            <p style="font-size:11px;margin:0">Severity: ${severity ?? 'N/A'}</p>
            <p style="font-size:11px;margin:0">Score: ${String(row.final_score ?? row.risk_score ?? 'N/A')}</p>
          </div>`,
        },
      })),
    };

    const severityColorExpr: mapboxgl.Expression = [
      'match',
      ['downcase', ['get', 'severity']],
      'critical',
      '#ef4444',
      'high',
      '#ef4444',
      'medium',
      '#f59e0b',
      'warning',
      '#f59e0b',
      '#10b981',
    ];

    const upsert = () => {
      const existing = map.getSource('risk-points') as mapboxgl.GeoJSONSource | undefined;
      if (existing) {
        existing.setData(geojson);
        return;
      }

      map.addSource('risk-points', { type: 'geojson', data: geojson });

      map.addLayer({
        id: 'risk-circles',
        type: 'circle',
        source: 'risk-points',
        paint: {
          'circle-radius': ['interpolate', ['linear'], ['zoom'], 4, 5, 8, 9, 12, 12],
          'circle-color': severityColorExpr,
          'circle-opacity': 0.92,
          'circle-stroke-width': 2,
          'circle-stroke-color': 'rgba(34, 211, 238, 0.55)',
        },
      });

      map.addLayer({
        id: 'risk-circles-active',
        type: 'circle',
        source: 'risk-points',
        filter: ['==', ['get', 'isActive'], 1],
        paint: {
          'circle-radius': ['interpolate', ['linear'], ['zoom'], 4, 10, 8, 14, 12, 18],
          'circle-color': 'transparent',
          'circle-stroke-width': 2,
          'circle-stroke-color': '#22d3ee',
          'circle-stroke-opacity': 0.9,
        },
      });

      map.addLayer({
        id: 'risk-labels',
        type: 'symbol',
        source: 'risk-points',
        layout: {
          'text-field': ['upcase', ['get', 'location']],
          'text-font': ['DIN Pro Medium', 'Arial Unicode MS Bold'],
          'text-size': 10,
          'text-offset': [0, 1.35],
          'text-anchor': 'top',
          'text-letter-spacing': 0.08,
          'text-max-width': 12,
        },
        paint: {
          'text-color': '#a5f3fc',
          'text-halo-color': 'rgba(2, 6, 23, 0.92)',
          'text-halo-width': 1.2,
        },
      });

      map.on('click', 'risk-circles', (e) => {
        const feature = e.features?.[0];
        if (!feature?.geometry || feature.geometry.type !== 'Point') return;
        const coords = feature.geometry.coordinates.slice() as [number, number];
        const html = feature.properties?.popupHtml;
        if (typeof html !== 'string') return;
        new mapboxgl.Popup({ closeButton: true, offset: 12 })
          .setLngLat(coords)
          .setHTML(html)
          .addTo(map);
      });

      map.on('mouseenter', 'risk-circles', () => {
        map.getCanvas().style.cursor = 'pointer';
      });
      map.on('mouseleave', 'risk-circles', () => {
        map.getCanvas().style.cursor = '';
      });
    };

    if (map.isStyleLoaded()) {
      upsert();
    } else {
      map.once('idle', upsert);
    }
  }, [mapPoints, mapReady, activeLocation]);

  // Fly to active location when it changes
  useEffect(() => {
    if (!mapRef.current || !mapReady || !activeLocation) return;
    const target =
      LOCATION_COORDS[activeLocation] ??
      NORMALIZED_LOCATION_COORDS[activeLocation.toLowerCase().replace(/\s+/g, '')];
    if (!target) return;
    mapRef.current.flyTo({
      center: target,
      zoom: 8.5,
      pitch: std ? 0 : 52,
      speed: 1.1,
      curve: 1.4,
    });
  }, [activeLocation, mapReady, std]);

  return (
    <div
      className={
        std
          ? 'relative h-full min-h-[440px] w-full overflow-hidden rounded-md border border-slate-200 bg-slate-100'
          : 'relative h-full min-h-[440px] w-full overflow-hidden rounded-md border border-cyan-400/20 bg-[#03070f]'
      }
    >
      {/* Map */}
      <div ref={containerRef} className="absolute inset-0" />

      {/* Radar sweep over the map (subtle, no scrim) */}
      {mapReady && !isError && !std ? (
        <div className="pointer-events-none absolute left-1/2 top-1/2 z-10 h-[120%] w-[120%] -translate-x-1/2 -translate-y-1/2 mix-blend-screen opacity-60">
          <div className="radar-sweep absolute inset-0 rounded-full" />
        </div>
      ) : null}

      {/* Crosshair + concentric rings */}
      {mapReady && !std ? (
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
      {!std ? <div className="pointer-events-none absolute inset-0 z-10 opacity-[0.06] hud-grid-overlay" /> : null}

      {/* Coordinate readout - bottom left */}
      {!std ? (
        <div className="pointer-events-none absolute bottom-3 left-3 z-20 rounded-sm border border-cyan-400/25 bg-black/60 px-2 py-1 font-mono text-[10px] uppercase tracking-widest text-cyan-200">
          <p>LAT {fmtCoord(center[1], 'lat')}</p>
          <p>LNG {fmtCoord(center[0], 'lng')}</p>
          <p className="text-slate-500">ZOOM {zoom.toFixed(2)} · BRG {bearing.toFixed(0)}°</p>
        </div>
      ) : null}

      {/* Severity legend - bottom right */}
      <div
        className={
          std
            ? 'pointer-events-none absolute bottom-3 right-3 z-20 flex gap-3 rounded-md border border-slate-200 bg-white/95 px-3 py-1.5 text-xs font-medium shadow-sm'
            : 'pointer-events-none absolute bottom-3 right-3 z-20 flex gap-2 rounded-sm border border-cyan-400/25 bg-black/60 px-2 py-1 font-mono text-[10px] uppercase tracking-widest'
        }
      >
        <span className={`flex items-center gap-1 ${std ? 'text-emerald-700' : 'text-emerald-300'}`}>
          <span className="h-2 w-2 rounded-full bg-emerald-500" /> Low
        </span>
        <span className={`flex items-center gap-1 ${std ? 'text-amber-700' : 'text-amber-300'}`}>
          <span className="h-2 w-2 rounded-full bg-amber-500" /> Med
        </span>
        <span className={`flex items-center gap-1 ${std ? 'text-red-700' : 'text-red-300'}`}>
          <span className="h-2 w-2 rounded-full bg-red-500" /> High
        </span>
      </div>

      {/* Active region label - top left */}
      {activeLocation ? (
        <div
          className={
            std
              ? 'pointer-events-none absolute left-3 top-3 z-20 rounded-md border border-slate-200 bg-white/95 px-2.5 py-1.5 text-xs shadow-sm'
              : 'pointer-events-none absolute left-3 top-3 z-20 rounded-sm border border-cyan-400/25 bg-black/60 px-2 py-1 font-mono text-[10px] uppercase tracking-widest text-cyan-200'
          }
        >
          <p className={std ? 'text-slate-500' : 'text-slate-500'}>{std ? 'District' : 'TARGET'}</p>
          <p className={std ? 'font-semibold text-slate-900' : 'text-cyan-100'}>{activeLocation}</p>
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

      {!isLoading && !isError && mapPoints.length === 0 && mapReady ? (
        <div className="pointer-events-none absolute left-3 top-16 z-20 max-w-sm rounded-sm border border-white/15 bg-slate-950/85 px-2 py-1 font-mono text-[10px] uppercase tracking-widest text-slate-300">
          BASEMAP LIVE · NO MAPPABLE ROWS IN PAYLOAD
        </div>
      ) : null}
    </div>
  );
}
