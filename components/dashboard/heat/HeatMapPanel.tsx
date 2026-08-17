'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { MAPBOX_TOKEN } from '@/lib/config';
import { useMission } from '@/components/dashboard/MissionContext';
import type { HeatGridResponse, HeatMapCity } from '@/lib/api/schemas';

const LOCATION_COORDS: Record<string, [number, number]> = {
  Bhubaneswar: [85.8245, 20.2961],
  Cuttack: [85.883, 20.4625],
  Puri: [85.8312, 19.8135],
  Sambalpur: [83.9701, 21.4669],
  Rourkela: [84.8536, 22.2604],
};

function normalizeKey(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '');
}

function coordsFor(region: string, lat?: number | null, lng?: number | null): [number, number] | null {
  if (typeof lat === 'number' && typeof lng === 'number' && Number.isFinite(lat) && Number.isFinite(lng)) {
    return [lng, lat];
  }
  const hit =
    LOCATION_COORDS[region] ??
    Object.entries(LOCATION_COORDS).find(([k]) => normalizeKey(k) === normalizeKey(region))?.[1];
  return hit ?? null;
}

function hiColorExpr(): mapboxgl.Expression {
  return [
    'interpolate',
    ['linear'],
    ['coalesce', ['get', 'heat_index_c'], ['get', 'tmax_c'], 20],
    24,
    '#38bdf8',
    28,
    '#fde047',
    32,
    '#fb923c',
    38,
    '#f97316',
    41,
    '#ef4444',
    46,
    '#991b1b',
  ];
}

/**
 * Odisha heat field from ModelEarth /heat/grid (continuous cells) + secondary city pins.
 */
export default function HeatMapPanel({
  grid,
  cities,
  isLoading,
  isError,
  onRetry,
  activeLocation,
  onSelectCity,
}: {
  grid: HeatGridResponse | undefined;
  cities: HeatMapCity[];
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  activeLocation?: string | null;
  onSelectCity: (city: string) => void;
}) {
  const { uiMode } = useMission();
  const std = uiMode === 'standard';
  const mapStyle = std ? 'mapbox://styles/mapbox/light-v11' : 'mapbox://styles/mapbox/dark-v11';
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const onSelectRef = useRef(onSelectCity);
  onSelectRef.current = onSelectCity;
  const [mapReady, setMapReady] = useState(false);
  const [mapLoadError, setMapLoadError] = useState<string | null>(null);
  const tokenMissing = !MAPBOX_TOKEN;

  const cityPoints = useMemo(() => {
    return cities
      .map((c) => {
        const xy = coordsFor(c.region, c.lat, c.lng);
        if (!xy) return null;
        return {
          region: c.region,
          severity: c.severity,
          score: c.heat_score ?? null,
          lng: xy[0],
          lat: xy[1],
        };
      })
      .filter(Boolean) as Array<{
      region: string;
      severity?: string;
      score: number | null;
      lng: number;
      lat: number;
    }>;
  }, [cities]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    if (tokenMissing) return;

    mapboxgl.accessToken = MAPBOX_TOKEN;
    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: mapStyle,
      center: [85.2, 20.7],
      zoom: 6.15,
      pitch: 0,
      bearing: 0,
      antialias: true,
    });
    mapRef.current = map;
    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'top-right');
    map.on('load', () => {
      setMapReady(true);
      map.resize();
    });
    map.on('error', (e) => {
      setMapLoadError(e.error?.message ?? 'Map failed to load tiles');
    });

    return () => {
      const m = mapRef.current;
      if (m) {
        for (const id of ['heat-fill', 'heat-outline', 'heat-cities', 'heat-cities-active', 'heat-city-labels']) {
          if (m.getLayer(id)) m.removeLayer(id);
        }
        if (m.getSource('heat-grid')) m.removeSource('heat-grid');
        if (m.getSource('heat-cities')) m.removeSource('heat-cities');
        m.remove();
      }
      mapRef.current = null;
      setMapReady(false);
    };
  }, [tokenMissing, mapStyle]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) return;

    const features = (grid?.features ?? []) as GeoJSON.Feature[];
    const geojson: GeoJSON.FeatureCollection = {
      type: 'FeatureCollection',
      features,
    };

    const upsert = () => {
      const existing = map.getSource('heat-grid') as mapboxgl.GeoJSONSource | undefined;
      if (existing) {
        existing.setData(geojson);
      } else {
        map.addSource('heat-grid', { type: 'geojson', data: geojson });
        map.addLayer({
          id: 'heat-fill',
          type: 'fill',
          source: 'heat-grid',
          paint: {
            'fill-color': hiColorExpr(),
            'fill-opacity': 0.55,
          },
        });
        map.addLayer({
          id: 'heat-outline',
          type: 'line',
          source: 'heat-grid',
          paint: {
            'line-color': std ? 'rgba(15,23,42,0.12)' : 'rgba(255,255,255,0.08)',
            'line-width': 0.4,
          },
        });
      }
    };

    if (map.isStyleLoaded()) upsert();
    else map.once('idle', upsert);
  }, [grid, mapReady, std]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) return;

    const activeKey = activeLocation ? normalizeKey(activeLocation) : '';
    const geojson: GeoJSON.FeatureCollection = {
      type: 'FeatureCollection',
      features: cityPoints.map((p) => ({
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [p.lng, p.lat] },
        properties: {
          region: p.region,
          severity: p.severity ?? 'low',
          score: p.score,
          isActive: normalizeKey(p.region) === activeKey ? 1 : 0,
        },
      })),
    };

    const upsert = () => {
      const existing = map.getSource('heat-cities') as mapboxgl.GeoJSONSource | undefined;
      if (existing) {
        existing.setData(geojson);
        return;
      }

      map.addSource('heat-cities', { type: 'geojson', data: geojson });
      map.addLayer({
        id: 'heat-cities',
        type: 'circle',
        source: 'heat-cities',
        paint: {
          'circle-radius': ['interpolate', ['linear'], ['zoom'], 5, 6, 9, 9],
          'circle-color': std ? '#0f172a' : '#f8fafc',
          'circle-stroke-width': 2,
          'circle-stroke-color': std ? '#b45309' : '#fbbf24',
        },
      });
      map.addLayer({
        id: 'heat-cities-active',
        type: 'circle',
        source: 'heat-cities',
        filter: ['==', ['get', 'isActive'], 1],
        paint: {
          'circle-radius': 14,
          'circle-color': 'transparent',
          'circle-stroke-width': 2.5,
          'circle-stroke-color': std ? '#b45309' : '#fbbf24',
        },
      });
      map.addLayer({
        id: 'heat-city-labels',
        type: 'symbol',
        source: 'heat-cities',
        layout: {
          'text-field': ['get', 'region'],
          'text-font': ['DIN Pro Medium', 'Arial Unicode MS Bold'],
          'text-size': 11,
          'text-offset': [0, 1.35],
          'text-anchor': 'top',
        },
        paint: {
          'text-color': std ? '#1e293b' : '#f8fafc',
          'text-halo-color': std ? 'rgba(255,255,255,0.92)' : 'rgba(2,6,23,0.92)',
          'text-halo-width': 1.2,
        },
      });

      map.on('click', 'heat-cities', (e) => {
        const region = e.features?.[0]?.properties?.region;
        if (typeof region === 'string' && region) onSelectRef.current(region);
      });
      map.on('mouseenter', 'heat-cities', () => {
        map.getCanvas().style.cursor = 'pointer';
      });
      map.on('mouseleave', 'heat-cities', () => {
        map.getCanvas().style.cursor = '';
      });
    };

    if (map.isStyleLoaded()) upsert();
    else map.once('idle', upsert);
  }, [cityPoints, mapReady, activeLocation, std]);

  useEffect(() => {
    if (!mapRef.current || !mapReady || !activeLocation) return;
    const target = coordsFor(activeLocation);
    if (!target) return;
    mapRef.current.flyTo({ center: target, zoom: 8.1, speed: 1.05, curve: 1.3 });
  }, [activeLocation, mapReady]);

  return (
    <div
      className={
        std
          ? 'relative h-full min-h-[440px] w-full overflow-hidden rounded-lg border border-slate-200 bg-slate-100'
          : 'relative h-full min-h-[440px] w-full overflow-hidden rounded-md border border-amber-400/20 bg-[#0a0c10]'
      }
    >
      <div ref={containerRef} className="absolute inset-0" />

      <div
        className={
          std
            ? 'pointer-events-none absolute left-3 top-3 z-10 max-w-[220px] rounded-md border border-slate-200 bg-white/95 px-2.5 py-1.5 text-[11px] text-slate-600 shadow-sm'
            : 'pointer-events-none absolute left-3 top-3 z-10 max-w-[240px] rounded-md border border-amber-400/25 bg-black/70 px-2.5 py-1.5 text-[11px] text-amber-50'
        }
      >
        <p className={std ? 'font-semibold text-slate-800' : 'font-medium text-amber-100'}>Odisha heat field</p>
        <p className="mt-0.5 text-[10px] opacity-80">Heat index (°C) · ModelEarth grid · SHADOW</p>
      </div>

      <div
        className={
          std
            ? 'pointer-events-none absolute bottom-3 left-3 z-10 rounded-md border border-slate-200 bg-white/95 px-2.5 py-2 text-[10px] text-slate-600 shadow-sm'
            : 'pointer-events-none absolute bottom-3 left-3 z-10 rounded-md border border-white/10 bg-black/70 px-2.5 py-2 text-[10px] text-slate-300'
        }
      >
        <p className="mb-1.5 font-medium">Heat index</p>
        <div className="flex h-2 w-44 overflow-hidden rounded-sm">
          <span className="flex-1 bg-sky-400" />
          <span className="flex-1 bg-yellow-300" />
          <span className="flex-1 bg-orange-400" />
          <span className="flex-1 bg-orange-500" />
          <span className="flex-1 bg-red-500" />
          <span className="flex-1 bg-red-800" />
        </div>
        <div className="mt-1 flex justify-between tabular-nums">
          <span>24°C</span>
          <span>32</span>
          <span>41</span>
          <span>46°C+</span>
        </div>
        <p className="mt-1.5 opacity-70">Cities = decision layer. Click a city for evidence.</p>
      </div>

      {tokenMissing ? (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-slate-950/80 p-6 text-center">
          <p className="max-w-sm text-sm text-slate-200">
            Map needs NEXT_PUBLIC_MAPBOX_TOKEN. City list still works without the map.
          </p>
        </div>
      ) : null}

      {mapLoadError || isError ? (
        <div className="absolute inset-x-3 bottom-24 z-20 rounded-md border border-red-400/30 bg-red-950/80 px-3 py-2 text-sm text-red-100">
          {mapLoadError ?? 'Heat field unavailable'}
          <button type="button" onClick={onRetry} className="ml-2 underline">
            Retry
          </button>
        </div>
      ) : null}

      {isLoading ? (
        <div className={`absolute inset-0 z-10 animate-pulse ${std ? 'bg-slate-200/50' : 'bg-white/5'}`} />
      ) : null}
    </div>
  );
}
