'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import mapboxgl from 'mapbox-gl';
import { useQuery } from '@tanstack/react-query';
import { opsApi } from '@/lib/ops/api';
import { MAPBOX_TOKEN } from '@/lib/config';
import { normalizeSeverity, needsAttention, severity as sev } from '@/lib/ops/severity';
import { ago } from '@/lib/ops/language';
import { includeShadowPlaces, placeStatusKind, placesFromMaps, type OpsPlace } from '@/lib/ops/places';
import { isRiverWatch } from '@/lib/ops/alerts';
import { fmtMetres, riverSourceLabel } from '@/lib/api/risk-status';
import { SeverityChip, StatusLabel, Unreachable } from '@/components/ops/Bits';
import { useOpsTheme, useOpsUser } from '@/components/ops/OpsShell';

const SOURCE = 'ops-places';
const DOTS = 'ops-dots';
const HALO = 'ops-halo';
const LABELS = 'ops-labels';
const GAUGE_SRC = 'ops-gauges';
const GAUGE_LYR = 'ops-gauge-dots';
const GAUGE_LBL = 'ops-gauge-labels';
const WP_SRC = 'ops-weak';
const WP_LYR = 'ops-weak-dots';
const WP_LBL = 'ops-weak-labels';
const WET_SRC = 'ops-wet';
const WET_LYR = 'ops-wet-dots';
const GFM_SRC = 'ops-gfm';
const GFM_LYR = 'ops-gfm-fill';

type RiverState = {
  state?: string;
  label?: string;
  ratio?: number | null;
  trend?: string | null;
};

type District = {
  location: string;
  severity?: string;
  risk_score?: number | null;
  top_reason?: string | null;
  river_state?: RiverState;
  river_site?: string;
  river_source?: string;
};

type GaugeReading = {
  site: string;
  present_m: number | null;
  warning_m: number | null;
  danger_m: number | null;
  trend: string | null;
  observed: string | null;
};

type GisLayers = {
  layers?: {
    gauges?: GeoJSON.FeatureCollection;
    weak_points?: GeoJSON.FeatureCollection;
    historical_wet?: GeoJSON.FeatureCollection;
    copernicus_gfm?: { tile_template_3857?: string; note?: string };
  };
  note?: string;
};

function esc(s: unknown): string {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function siteKey(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '');
}

function numProp(v: unknown): number | null {
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  if (typeof v === 'string' && v.trim() && Number.isFinite(Number(v))) return Number(v);
  return null;
}

function gaugeBand(present: number | null, warning: number | null, danger: number | null): 'danger' | 'warning' | 'below' | 'unknown' {
  if (present == null) return 'unknown';
  if (danger != null && present >= danger) return 'danger';
  if (warning != null && present >= warning) return 'warning';
  return 'below';
}

function bandColor(band: 'danger' | 'warning' | 'below' | 'unknown', dark: boolean): string {
  if (band === 'danger') return '#c81e1e';
  if (band === 'warning') return '#d97706';
  if (band === 'below') return dark ? '#7eb6ff' : '#1d4ed8';
  return dark ? '#8a8576' : '#475569';
}

function bandWord(band: 'danger' | 'warning' | 'below' | 'unknown'): string {
  if (band === 'danger') return 'At or above danger';
  if (band === 'warning') return 'At official warning';
  if (band === 'below') return 'Below warning';
  return 'No reading today';
}

function emptyCollection(): GeoJSON.FeatureCollection {
  return { type: 'FeatureCollection', features: [] };
}

function asPlaceCollection(
  places: OpsPlace[],
  districtByName: Map<string, District>,
): GeoJSON.FeatureCollection {
  return {
    type: 'FeatureCollection',
    features: places.map((p) => {
      const s = sev(p.severity);
      const d = districtByName.get(p.region.toLowerCase());
      return {
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [p.lng, p.lat] },
        properties: {
          kind: 'place',
          region: p.region,
          color: s.hex,
          live: p.live ? 1 : 0,
          imd: s.imd,
          action: s.action,
          score: p.rule_score == null ? '' : p.rule_score.toFixed(2),
          riverLabel: d?.river_state?.label ?? '',
          riverSite: d?.river_site ?? '',
          riverSource: riverSourceLabel(d?.river_source) ?? '',
        },
      };
    }),
  };
}

function enrichGauges(
  raw: GeoJSON.FeatureCollection | undefined,
  bySite: Map<string, GaugeReading>,
  dark: boolean,
): GeoJSON.FeatureCollection {
  const src = raw ?? emptyCollection();
  return {
    type: 'FeatureCollection',
    features: src.features.map((f) => {
      const props = (f.properties ?? {}) as Record<string, unknown>;
      const site = String(props.site ?? '');
      const reading = bySite.get(siteKey(site));
      const warning = reading?.warning_m ?? numProp(props.warning_m);
      const danger = reading?.danger_m ?? numProp(props.danger_m);
      const present = reading?.present_m ?? null;
      const band = gaugeBand(present, warning, danger);
      return {
        ...f,
        properties: {
          ...props,
          kind: 'gauge',
          color: bandColor(band, dark),
          band,
          bandWord: bandWord(band),
          present_m: present,
          warning_m: warning,
          danger_m: danger,
          trend: reading?.trend ?? '',
        },
      };
    }),
  };
}

function placePopupHtml(p: Record<string, unknown>): string {
  const name = esc(p.region);
  const href = `/ops/places/${encodeURIComponent(String(p.region ?? ''))}`;
  const imd = esc(p.imd);
  const action = esc(p.action);
  const river = String(p.riverLabel ?? '').trim();
  const site = [p.riverSite, p.riverSource].filter((x) => String(x ?? '').trim()).join(' · ');
  const score = String(p.score ?? '').trim();
  return `<div class="ops-pop">
    <div class="ops-pop-k">Location</div>
    <div class="ops-pop-name">${name}</div>
    <div class="ops-pop-stage">${imd}${action ? ` · ${action}` : ''}</div>
    ${river ? `<div class="ops-pop-line">${esc(river)}</div>` : ''}
    ${site ? `<div class="ops-pop-meta">${esc(site)}</div>` : ''}
    ${score ? `<div class="ops-pop-meta">Score ${esc(score)}</div>` : ''}
    <a class="ops-pop-link" href="${href}">Open ${name}</a>
  </div>`;
}

function gaugePopupHtml(p: Record<string, unknown>): string {
  const site = esc(p.site);
  const loc = esc(p.location);
  const present = numProp(p.present_m);
  const warning = numProp(p.warning_m);
  const danger = numProp(p.danger_m);
  const level = present == null ? 'No bulletin reading today' : fmtMetres(present);
  const marks = [
    warning != null ? `warning ${fmtMetres(warning)}` : null,
    danger != null ? `danger ${fmtMetres(danger)}` : null,
  ]
    .filter(Boolean)
    .join(' · ');
  return `<div class="ops-pop">
    <div class="ops-pop-k">DoWR / CWC gauge</div>
    <div class="ops-pop-name">${site}</div>
    <div class="ops-pop-stage">${esc(p.bandWord)}</div>
    <div class="ops-pop-line">${esc(level)}</div>
    ${marks ? `<div class="ops-pop-meta">${esc(marks)}</div>` : ''}
    ${loc ? `<div class="ops-pop-meta">Scores ${loc}</div>` : ''}
    <div class="ops-pop-meta">Enters the score as the river term. Not a flood map.</div>
  </div>`;
}

function weakPopupHtml(p: Record<string, unknown>): string {
  const site = esc(p.site);
  const bits = [p.location, p.river, p.block].filter((x) => String(x ?? '').trim()).join(' · ');
  const note = String(p.note ?? '').trim();
  const source = String(p.source ?? '').trim();
  return `<div class="ops-pop">
    <div class="ops-pop-k">Weak point · approximate pin</div>
    <div class="ops-pop-name">${site}</div>
    ${bits ? `<div class="ops-pop-line">${esc(bits)}</div>` : ''}
    ${note ? `<div class="ops-pop-meta">${esc(note)}</div>` : ''}
    ${source ? `<div class="ops-pop-meta">${esc(source)}</div>` : ''}
    <div class="ops-pop-meta">Block-scale, not a surveyed chainage. Does not enter the score.</div>
  </div>`;
}

function wetPopupHtml(p: Record<string, unknown>): string {
  const site = esc(p.site);
  let dates = '';
  if (Array.isArray(p.dates)) dates = p.dates.map(String).join(', ');
  else if (typeof p.dates === 'string') {
    try {
      const parsed = JSON.parse(p.dates) as unknown;
      dates = Array.isArray(parsed) ? parsed.map(String).join(', ') : p.dates;
    } catch {
      dates = p.dates;
    }
  }
  return `<div class="ops-pop">
    <div class="ops-pop-k">2026 above-danger days</div>
    <div class="ops-pop-name">${site}</div>
    <div class="ops-pop-line">${esc(dates)}</div>
    <div class="ops-pop-meta">Days this gauge crossed danger in 2026. A point, not a satellite flood polygon. Does not enter the score.</div>
  </div>`;
}

function popupFor(kind: string, props: Record<string, unknown>): string | null {
  if (kind === 'place') return placePopupHtml(props);
  if (kind === 'gauge') return gaugePopupHtml(props);
  if (kind === 'weak_point') return weakPopupHtml(props);
  if (kind === 'historical_wet') return wetPopupHtml(props);
  return null;
}

export default function OpsMap() {
  const { dark } = useOpsTheme();
  const user = useOpsUser();

  const holderRef = useRef<HTMLDivElement | null>(null);
  const [holder, setHolder] = useState<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const popupRef = useRef<mapboxgl.Popup | null>(null);
  const fittedRef = useRef(false);
  const [mapFailed, setMapFailed] = useState(false);
  const [mapEpoch, setMapEpoch] = useState(0);
  const [showGauges, setShowGauges] = useState(true);
  const [showWeak, setShowWeak] = useState(true);
  const [showWet, setShowWet] = useState(false);
  const [showGfm, setShowGfm] = useState(false);

  const liveQ = useQuery({
    queryKey: ['ops-risk-map'],
    queryFn: () => opsApi.riskMap(),
    refetchInterval: 120_000,
  });
  const includeShadow = includeShadowPlaces(user.role, user.pilot_jurisdiction);
  const shadowQ = useQuery({
    queryKey: ['ops-shadow-map'],
    queryFn: () => opsApi.shadowMap(),
    refetchInterval: 300_000,
    enabled: includeShadow,
  });
  const briefingQ = useQuery({
    queryKey: ['ops-briefing'],
    queryFn: () => opsApi.briefing(),
    refetchInterval: 300_000,
  });
  const layersQ = useQuery({
    queryKey: ['ops-map-layers'],
    queryFn: () => opsApi.mapLayers() as Promise<GisLayers>,
    refetchInterval: 600_000,
  });
  const riversQ = useQuery({
    queryKey: ['ops-shadow-rivers'],
    queryFn: () => opsApi.shadowRivers(),
    refetchInterval: 300_000,
  });

  const places = useMemo(
    () =>
      placesFromMaps(liveQ.data, shadowQ.data, user.jurisdiction, {
        role: user.role,
        pilotJurisdiction: user.pilot_jurisdiction,
      }),
    [liveQ.data, shadowQ.data, user.jurisdiction, user.role, user.pilot_jurisdiction],
  );

  const districtByName = useMemo(() => {
    const m = new Map<string, District>();
    for (const d of (briefingQ.data?.districts ?? []) as District[]) {
      if (d.location) m.set(d.location.toLowerCase(), d);
    }
    return m;
  }, [briefingQ.data]);

  const riverStateByPlace = useMemo(() => {
    const m = new Map<string, string>();
    for (const d of districtByName.values()) {
      if (d.river_state?.state) m.set(d.location.toLowerCase(), d.river_state.state);
    }
    return m;
  }, [districtByName]);

  const gaugeBySite = useMemo(() => {
    const m = new Map<string, GaugeReading>();
    for (const g of riversQ.data?.gauges ?? []) {
      const site = String(g.site ?? '').trim();
      if (!site) continue;
      m.set(siteKey(site), {
        site,
        present_m: typeof g.present_level_m === 'number' ? g.present_level_m : null,
        warning_m: typeof g.warning_level_m === 'number' ? g.warning_level_m : null,
        danger_m: typeof g.danger_level_m === 'number' ? g.danger_level_m : null,
        trend: typeof g.trend === 'string' ? g.trend : null,
        observed: typeof g.observed_time === 'string' ? g.observed_time : null,
      });
    }
    return m;
  }, [riversQ.data]);

  const placesRef = useRef(places);
  placesRef.current = places;
  const districtRef = useRef(districtByName);
  districtRef.current = districtByName;
  const gaugeFeaturesRef = useRef<GeoJSON.Feature[]>([]);
  gaugeFeaturesRef.current = layersQ.data?.layers?.gauges?.features ?? [];

  const onHolder = useCallback((node: HTMLDivElement | null) => {
    holderRef.current = node;
    setHolder(node);
  }, []);

  const openPopup = useCallback((map: mapboxgl.Map, e: mapboxgl.MapLayerMouseEvent) => {
    const feature = e.features?.[0];
    if (!feature?.properties) return;
    const geom = feature.geometry;
    if (!geom || geom.type !== 'Point') return;
    const props = feature.properties as Record<string, unknown>;
    const kind = String(props.kind ?? '');
    const html = popupFor(kind, props);
    if (!html) return;
    const coords = (geom.coordinates as [number, number]).slice() as [number, number];
    popupRef.current?.remove();
    popupRef.current = new mapboxgl.Popup({ closeButton: true, offset: 16, maxWidth: '280px' })
      .setLngLat(coords)
      .setHTML(html)
      .addTo(map);
  }, []);

  const bindPointer = useCallback((map: mapboxgl.Map, layerId: string) => {
    if (map.getLayer(`${layerId}__bound`)) return;
    map.on('click', layerId, (e) => openPopup(map, e));
    map.on('mouseenter', layerId, () => {
      map.getCanvas().style.cursor = 'pointer';
    });
    map.on('mouseleave', layerId, () => {
      map.getCanvas().style.cursor = '';
    });
  }, [openPopup]);

  const paintPlaces = useCallback(
    (map: mapboxgl.Map) => {
      const fc = asPlaceCollection(placesRef.current, districtRef.current);
      const existing = map.getSource(SOURCE) as mapboxgl.GeoJSONSource | undefined;
      if (existing) {
        existing.setData(fc);
      } else {
        map.addSource(SOURCE, { type: 'geojson', data: fc });
        map.addLayer({
          id: HALO,
          type: 'circle',
          source: SOURCE,
          paint: {
            'circle-radius': ['interpolate', ['linear'], ['zoom'], 5, 11, 8, 16, 11, 22],
            'circle-color': ['get', 'color'],
            'circle-opacity': 0.22,
          },
        });
        map.addLayer({
          id: DOTS,
          type: 'circle',
          source: SOURCE,
          paint: {
            'circle-radius': ['interpolate', ['linear'], ['zoom'], 5, 7, 8, 11, 11, 15],
            'circle-color': ['get', 'color'],
            'circle-stroke-width': 2.5,
            'circle-stroke-color': dark ? '#12110e' : '#ffffff',
            'circle-opacity': 1,
          },
        });
        map.addLayer({
          id: LABELS,
          type: 'symbol',
          source: SOURCE,
          layout: {
            'text-field': ['get', 'region'],
            'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
            'text-size': ['interpolate', ['linear'], ['zoom'], 6, 12, 9, 14],
            'text-offset': [0, 1.25],
            'text-anchor': 'top',
            'text-allow-overlap': true,
            'text-padding': 2,
          },
          paint: {
            'text-color': dark ? '#f3f0e6' : '#16140f',
            'text-halo-color': dark ? '#12110e' : '#ffffff',
            'text-halo-width': 1.8,
          },
        });
        bindPointer(map, DOTS);
      }

      if (!fittedRef.current && placesRef.current.length > 0) {
        const bounds = new mapboxgl.LngLatBounds();
        placesRef.current.forEach((p) => bounds.extend([p.lng, p.lat]));
        for (const f of gaugeFeaturesRef.current) {
          if (f.geometry?.type === 'Point') {
            bounds.extend(f.geometry.coordinates as [number, number]);
          }
        }
        if (!bounds.isEmpty()) {
          map.fitBounds(bounds, {
            padding: { top: 48, bottom: 36, left: 40, right: 40 },
            maxZoom: 8.6,
            duration: 0,
          });
          fittedRef.current = true;
        }
      }
    },
    [dark, bindPointer],
  );

  useEffect(() => {
    if (!holder || !MAPBOX_TOKEN) return;
    if (typeof mapboxgl.supported === 'function' && !mapboxgl.supported()) {
      setMapFailed(true);
      return;
    }

    let cancelled = false;
    let map: mapboxgl.Map | null = null;
    let ro: ResizeObserver | null = null;
    setMapFailed(false);

    const start = () => {
      if (cancelled || mapRef.current) return;
      if (holder.clientWidth < 40 || holder.clientHeight < 40) return;

      try {
        mapboxgl.accessToken = MAPBOX_TOKEN;
        map = new mapboxgl.Map({
          container: holder,
          style: dark ? 'mapbox://styles/mapbox/dark-v11' : 'mapbox://styles/mapbox/outdoors-v12',
          center: [86.25, 21.15],
          zoom: 7.6,
          minZoom: 6,
          maxZoom: 12,
          pitch: 0,
          bearing: 0,
          antialias: false,
          fadeDuration: 0,
          attributionControl: true,
          cooperativeGestures: false,
          trackResize: true,
        });
        map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'top-right');
        map.on('error', (e) => {
          const msg = String(e.error?.message ?? '');
          if (/webgl|context lost|failed to initialize/i.test(msg)) setMapFailed(true);
        });
        map.on('load', () => {
          map?.resize();
          paintPlaces(map!);
          setMapEpoch((n) => n + 1);
        });
        mapRef.current = map;
        fittedRef.current = false;
      } catch {
        setMapFailed(true);
      }
    };

    start();
    ro = new ResizeObserver(() => {
      if (!mapRef.current) {
        start();
        return;
      }
      mapRef.current.resize();
    });
    ro.observe(holder);

    return () => {
      cancelled = true;
      ro?.disconnect();
      popupRef.current?.remove();
      popupRef.current = null;
      map?.remove();
      if (mapRef.current === map) mapRef.current = null;
    };
  }, [holder, dark, paintPlaces]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || mapFailed) return;
    const run = () => paintPlaces(map);
    if (map.isStyleLoaded()) run();
    else map.once('load', run);
  }, [places, districtByName, paintPlaces, mapFailed]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || mapFailed || !map.isStyleLoaded()) return;
    const layers = layersQ.data?.layers;

    const upsertCircle = (
      id: string,
      data: GeoJSON.FeatureCollection | undefined,
      layerId: string,
      visible: boolean,
      spec: mapboxgl.CircleLayerSpecification['paint'],
      labelId?: string,
      labelField?: string,
    ) => {
      if (!data) return;
      const src = map.getSource(id) as mapboxgl.GeoJSONSource | undefined;
      if (src) src.setData(data);
      else {
        map.addSource(id, { type: 'geojson', data });
        map.addLayer({
          id: layerId,
          type: 'circle',
          source: id,
          paint: spec,
        });
        if (labelId && labelField) {
          map.addLayer({
            id: labelId,
            type: 'symbol',
            source: id,
            minzoom: 7.2,
            layout: {
              'text-field': ['get', labelField],
              'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Regular'],
              'text-size': 11,
              'text-offset': [0, 1.2],
              'text-anchor': 'top',
              'text-optional': true,
            },
            paint: {
              'text-color': dark ? '#ece8dc' : '#16140f',
              'text-halo-color': dark ? '#12110e' : '#ffffff',
              'text-halo-width': 1.4,
            },
          });
        }
        bindPointer(map, layerId);
      }
      if (map.getLayer(layerId)) {
        map.setLayoutProperty(layerId, 'visibility', visible ? 'visible' : 'none');
      }
      if (labelId && map.getLayer(labelId)) {
        map.setLayoutProperty(labelId, 'visibility', visible ? 'visible' : 'none');
      }
    };

    upsertCircle(
      GAUGE_SRC,
      enrichGauges(layers?.gauges, gaugeBySite, dark),
      GAUGE_LYR,
      showGauges,
      {
        'circle-radius': ['interpolate', ['linear'], ['zoom'], 6, 5, 9, 8],
        'circle-color': ['get', 'color'],
        'circle-stroke-width': 2,
        'circle-stroke-color': dark ? '#12110e' : '#ffffff',
      },
      GAUGE_LBL,
      'site',
    );
    upsertCircle(
      WP_SRC,
      layers?.weak_points,
      WP_LYR,
      showWeak,
      {
        'circle-radius': 6,
        'circle-color': '#9a3412',
        'circle-stroke-width': 2,
        'circle-stroke-color': dark ? '#f3f0e6' : '#ffffff',
      },
      WP_LBL,
      'site',
    );
    upsertCircle(
      WET_SRC,
      layers?.historical_wet,
      WET_LYR,
      showWet,
      {
        'circle-radius': 11,
        'circle-color': 'transparent',
        'circle-stroke-width': 2,
        'circle-stroke-color': '#2563eb',
        'circle-opacity': 1,
      },
    );

    const tile = layers?.copernicus_gfm?.tile_template_3857;
    if (tile) {
      if (!map.getSource(GFM_SRC)) {
        map.addSource(GFM_SRC, { type: 'raster', tiles: [tile], tileSize: 256 });
        map.addLayer(
          {
            id: GFM_LYR,
            type: 'raster',
            source: GFM_SRC,
            paint: { 'raster-opacity': 0.55 },
          },
          DOTS,
        );
      }
      if (map.getLayer(GFM_LYR)) {
        map.setLayoutProperty(GFM_LYR, 'visibility', showGfm ? 'visible' : 'none');
      }
    }
  }, [layersQ.data, gaugeBySite, showGauges, showWeak, showWet, showGfm, mapFailed, dark, bindPointer, mapEpoch]);

  const needing = places.filter((p) => needsAttention(p.severity)).length;
  const onPilot = places.filter((p) => p.tier === 'pilot').length;
  const failed = liveQ.isError;
  const loading = liveQ.isLoading;

  return (
    <div className="ops-map-stage">
      <div className="ops-map-head">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
          <h1 className="ops-h1">
            {loading
              ? 'Locations'
              : `${places.length} locations${
                  needing === 0 ? ', none above alert level' : `, ${needing} above alert level`
                }`}
          </h1>
          <StatusLabel kind="LIVE" />
        </div>
        <p className="ops-lede">
          {loading
            ? 'Loading scores…'
            : `Scored ${ago(liveQ.dataUpdatedAt)}. Click a pin for the gauge reading. Overlays do not change the score.`}
          {onPilot ? ` ${onPilot} on pilot tier.` : ''}
        </p>
      </div>

      <div className="ops-map-canvas">
        {MAPBOX_TOKEN ? (
          <div ref={onHolder} className="ops-map" aria-label="Map of monitored locations" />
        ) : null}
        {!MAPBOX_TOKEN || mapFailed ? (
          <p className="ops-lede ops-map-fallback">
            The map could not load. The list has the same information.
          </p>
        ) : null}

        <div className="ops-map-float">
          <div className="ops-map-card" role="group" aria-label="Map layers">
            <div className="ops-h2" style={{ marginBottom: 8 }}>
              Layers
            </div>
            <label className="ops-layer">
              <input type="checkbox" checked={showGauges} onChange={(e) => setShowGauges(e.target.checked)} />
              Gauges · today’s DoWR level
            </label>
            <label className="ops-layer">
              <input type="checkbox" checked={showWeak} onChange={(e) => setShowWeak(e.target.checked)} />
              Weak points · approximate
            </label>
            <label className="ops-layer">
              <input type="checkbox" checked={showWet} onChange={(e) => setShowWet(e.target.checked)} />
              2026 danger-crossing days
            </label>
            <label className="ops-layer">
              <input type="checkbox" checked={showGfm} onChange={(e) => setShowGfm(e.target.checked)} />
              Copernicus GFM · after a pass, not a forecast
            </label>
            {showGfm ? (
              <p className="ops-map-hint">Empty on a dry day is correct. Water appears hours after a Sentinel-1 pass.</p>
            ) : null}
          </div>
          <div className="ops-map-card ops-map-legend" aria-label="Map legend">
            <div className="ops-h2" style={{ marginBottom: 8 }}>
              Legend
            </div>
            <ul>
              <li>
                <i style={{ background: '#047857' }} /> Location · Green / no warning
              </li>
              <li>
                <i style={{ background: '#b45309' }} /> Location · Yellow / be aware
              </li>
              <li>
                <i style={{ background: '#d97706' }} /> Location · Orange / be prepared
              </li>
              <li>
                <i style={{ background: '#c81e1e' }} /> Location · Red / take action
              </li>
              <li>
                <i style={{ background: '#1d4ed8' }} /> Gauge below warning
              </li>
              <li>
                <i style={{ background: '#d97706' }} /> Gauge at warning
              </li>
              <li>
                <i style={{ background: '#c81e1e' }} /> Gauge at danger
              </li>
              <li>
                <i style={{ background: '#9a3412' }} /> Weak point (not surveyed)
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="ops-map-list">
        {failed ? (
          <Unreachable lastGood={liveQ.dataUpdatedAt || null} onRetry={() => void liveQ.refetch()} />
        ) : (
          <ul className="ops-list">
            {places.map((p) => {
              const k = normalizeSeverity(p.severity);
              const d = districtByName.get(p.region.toLowerCase());
              const river = d?.river_state?.label;
              const site = [d?.river_site, riverSourceLabel(d?.river_source)].filter(Boolean).join(' · ');
              return (
                <li key={p.region} className={`ops-row ops-row-${k}`} style={{ padding: '12px 14px' }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
                    <Link href={`/ops/places/${encodeURIComponent(p.region)}`} className="ops-item-name">
                      {p.region}
                    </Link>
                    <SeverityChip
                      value={p.severity}
                      showAction
                      riverWatch={isRiverWatch({
                        tier: p.tier,
                        severity: p.severity,
                        signal_source: p.signal_source,
                        river_state: riverStateByPlace.get(p.region.toLowerCase()) ?? null,
                      })}
                    />
                    {placeStatusKind(p) ? <StatusLabel kind={placeStatusKind(p)!} /> : null}
                  </div>
                  {river ? <p className="ops-item-meta">{river}{site ? ` · ${site}` : ''}</p> : null}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
