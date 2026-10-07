'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import mapboxgl from 'mapbox-gl';
import { useQuery } from '@tanstack/react-query';
import { opsApi } from '@/lib/ops/api';
import { MAPBOX_TOKEN } from '@/lib/config';
import { normalizeSeverity, needsAttention, severity as sev } from '@/lib/ops/severity';
import { ago } from '@/lib/ops/language';
import { canSeeShadowLocations, placesFromMaps, type OpsPlace } from '@/lib/ops/places';
import { SeverityChip, StatusLabel, Unreachable } from '@/components/ops/Bits';
import { useOpsTheme, useOpsUser } from '@/components/ops/OpsShell';

const SOURCE = 'ops-places';
const DOTS = 'ops-dots';
const LABELS = 'ops-labels';

function asCollection(places: OpsPlace[]): GeoJSON.FeatureCollection {
  return {
    type: 'FeatureCollection',
    features: places.map((p) => {
      const s = sev(p.severity);
      return {
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [p.lng, p.lat] },
        properties: {
          region: p.region,
          color: s.hex,
          live: p.live ? 1 : 0,
        },
      };
    }),
  };
}

export default function OpsMap() {
  const router = useRouter();
  const { dark } = useOpsTheme();
  const user = useOpsUser();
  const routerRef = useRef(router);
  routerRef.current = router;

  const holderRef = useRef<HTMLDivElement | null>(null);
  const [holder, setHolder] = useState<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const fittedRef = useRef(false);
  const [mapFailed, setMapFailed] = useState(false);

  const liveQ = useQuery({
    queryKey: ['ops-risk-map'],
    queryFn: () => opsApi.riskMap(),
    refetchInterval: 120_000,
  });
  const includeShadow = canSeeShadowLocations(user.role, user.jurisdiction);
  const shadowQ = useQuery({
    queryKey: ['ops-shadow-map'],
    queryFn: () => opsApi.shadowMap(),
    refetchInterval: 300_000,
    enabled: includeShadow,
  });

  const places = useMemo(
    () => placesFromMaps(liveQ.data, shadowQ.data, user.jurisdiction, includeShadow),
    [liveQ.data, shadowQ.data, user.jurisdiction, includeShadow],
  );
  const placesRef = useRef(places);
  placesRef.current = places;

  const onHolder = useCallback((node: HTMLDivElement | null) => {
    holderRef.current = node;
    setHolder(node);
  }, []);

  const paint = useCallback((map: mapboxgl.Map) => {
    const fc = asCollection(placesRef.current);
    const existing = map.getSource(SOURCE) as mapboxgl.GeoJSONSource | undefined;
    if (existing) {
      existing.setData(fc);
    } else {
      map.addSource(SOURCE, { type: 'geojson', data: fc });
      map.addLayer({
        id: DOTS,
        type: 'circle',
        source: SOURCE,
        paint: {
          'circle-radius': ['interpolate', ['linear'], ['zoom'], 5, 6, 8, 8, 11, 11],
          'circle-color': ['get', 'color'],
          'circle-stroke-width': 2,
          'circle-stroke-color': dark ? '#1a1814' : '#faf8f1',
          'circle-opacity': 0.95,
        },
      });
      map.addLayer({
        id: LABELS,
        type: 'symbol',
        source: SOURCE,
        layout: {
          'text-field': ['get', 'region'],
          'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Regular'],
          'text-size': 12,
          'text-offset': [0, 1.15],
          'text-anchor': 'top',
          'text-allow-overlap': true,
          'text-padding': 2,
        },
        paint: {
          'text-color': dark ? '#f3f0e6' : '#16140f',
          'text-halo-color': dark ? '#12110e' : '#ffffff',
          'text-halo-width': 1.4,
        },
      });
      map.on('click', DOTS, (e) => {
        const name = e.features?.[0]?.properties?.region;
        if (typeof name === 'string' && name) {
          routerRef.current.push(`/ops/places/${encodeURIComponent(name)}`);
        }
      });
      map.on('mouseenter', DOTS, () => {
        map.getCanvas().style.cursor = 'pointer';
      });
      map.on('mouseleave', DOTS, () => {
        map.getCanvas().style.cursor = '';
      });
    }

    if (!fittedRef.current && placesRef.current.length > 0) {
      const bounds = new mapboxgl.LngLatBounds();
      placesRef.current.forEach((p) => bounds.extend([p.lng, p.lat]));
      if (!bounds.isEmpty()) {
        map.fitBounds(bounds, {
          padding: { top: 56, bottom: 40, left: 48, right: 48 },
          maxZoom: 7.4,
          duration: 0,
        });
        fittedRef.current = true;
      }
    }
  }, [dark]);

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
          style: dark ? 'mapbox://styles/mapbox/dark-v11' : 'mapbox://styles/mapbox/light-v11',
          center: [85.1, 21.1],
          zoom: 6.15,
          minZoom: 5,
          maxZoom: 11,
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
          paint(map!);
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
      map?.remove();
      if (mapRef.current === map) mapRef.current = null;
    };
  }, [holder, dark, paint]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || mapFailed) return;
    const run = () => paint(map);
    if (map.isStyleLoaded()) run();
    else map.once('load', run);
  }, [places, paint, mapFailed]);

  const needing = places.filter((p) => needsAttention(p.severity)).length;
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
            : `Scored ${ago(liveQ.dataUpdatedAt)}. The list is the same as the map.`}
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
      </div>

      <div className="ops-map-list">
        {failed ? (
          <Unreachable lastGood={liveQ.dataUpdatedAt || null} onRetry={() => void liveQ.refetch()} />
        ) : (
          <ul className="ops-list">
            {places.map((p) => {
              const k = normalizeSeverity(p.severity);
              return (
                <li key={p.region} className={`ops-row ops-row-${k}`} style={{ padding: '12px 14px' }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
                    <Link href={`/ops/places/${encodeURIComponent(p.region)}`} className="ops-item-name">
                      {p.region}
                    </Link>
                    <SeverityChip value={p.severity} showAction />
                    {!p.live ? <StatusLabel kind="SHADOW" /> : null}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
