import { NextResponse } from 'next/server';
import { API_BASE_URL } from '@/lib/config';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const ODISHA_LAT_MIN = 17.9;
const ODISHA_LAT_MAX = 22.6;
const ODISHA_LON_MIN = 81.3;
const ODISHA_LON_MAX = 87.5;
const STEP = 0.5;
const BATCH = 40;
const OPENMETEO = 'https://api.open-meteo.com';

type Cell = { lat: number; lon: number };

function centers(): Cell[] {
  const out: Cell[] = [];
  for (let lat = ODISHA_LAT_MIN; lat <= ODISHA_LAT_MAX + 1e-9; lat += STEP) {
    for (let lon = ODISHA_LON_MIN; lon <= ODISHA_LON_MAX + 1e-9; lon += STEP) {
      out.push({ lat: Math.round(lat * 1000) / 1000, lon: Math.round(lon * 1000) / 1000 });
    }
  }
  return out;
}

function heatIndexC(tempC: number, rhPct: number): number {
  const t = tempC * (9 / 5) + 32;
  const rh = Math.max(0, Math.min(100, rhPct));
  const simple = 0.5 * (t + 61.0 + (t - 68.0) * 1.2 + rh * 0.094);
  let hiF = simple;
  if (simple >= 80) {
    hiF =
      -42.379 +
      2.04901523 * t +
      10.14333127 * rh -
      0.22475541 * t * rh -
      0.00683783 * t * t -
      0.05481717 * rh * rh +
      0.00122874 * t * t * rh +
      0.00085282 * t * rh * rh -
      0.00000199 * t * t * rh * rh;
    if (rh < 13 && t >= 80 && t <= 112) {
      hiF -= ((13 - rh) / 4) * Math.pow((17 - Math.abs(t - 95)) / 17, 0.5);
    } else if (rh > 85 && t >= 80 && t <= 87) {
      hiF += ((rh - 85) / 10) * ((87 - t) / 5);
    }
  }
  return Math.round(((hiF - 32) * (5 / 9)) * 100) / 100;
}

function hiBand(hi: number | null): string {
  if (hi == null) return 'UNKNOWN';
  if (hi >= 46) return 'CRITICAL';
  if (hi >= 41) return 'HIGH';
  if (hi >= 32) return 'MEDIUM';
  return 'LOW';
}

function middayRh(hourly: { time?: string[]; relative_humidity_2m?: (number | null)[] }, dayS: string): number | null {
  const times = hourly.time ?? [];
  const rhs = hourly.relative_humidity_2m ?? [];
  const samples: number[] = [];
  for (let i = 0; i < times.length; i++) {
    const t = times[i];
    const rh = rhs[i];
    if (!t || rh == null || !t.startsWith(dayS)) continue;
    const hour = Number(t.slice(11, 13));
    if (hour >= 11 && hour <= 15) samples.push(Number(rh));
  }
  if (!samples.length) return null;
  return Math.round((samples.reduce((a, b) => a + b, 0) / samples.length) * 10) / 10;
}

function cellPolygon(lat: number, lon: number): number[][][] {
  const h = STEP / 2;
  return [
    [
      [lon - h, lat - h],
      [lon + h, lat - h],
      [lon + h, lat + h],
      [lon - h, lat + h],
      [lon - h, lat - h],
    ],
  ];
}

async function buildLocalGrid() {
  const pts = centers();
  const features: Record<string, unknown>[] = [];
  const today = new Date().toISOString().slice(0, 10);

  for (let i = 0; i < pts.length; i += BATCH) {
    const batch = pts.slice(i, i + BATCH);
    const url = new URL(`${OPENMETEO}/v1/forecast`);
    url.searchParams.set('latitude', batch.map((p) => p.lat).join(','));
    url.searchParams.set('longitude', batch.map((p) => p.lon).join(','));
    url.searchParams.set('daily', 'temperature_2m_max,temperature_2m_min');
    url.searchParams.set('hourly', 'temperature_2m,relative_humidity_2m');
    url.searchParams.set('timezone', 'Asia/Kolkata');
    url.searchParams.set('forecast_days', '2');

    const resp = await fetch(url.toString(), { cache: 'no-store' });
    if (!resp.ok) throw new Error(`Open-Meteo ${resp.status}`);
    const data = await resp.json();
    const payloads = Array.isArray(data) ? data : [data];

    for (let j = 0; j < batch.length; j++) {
      const payload = payloads[j] ?? {};
      const daily = payload.daily ?? {};
      const hourly = payload.hourly ?? {};
      const times: string[] = daily.time ?? [];
      const tmaxs: (number | null)[] = daily.temperature_2m_max ?? [];
      let idx = 0;
      for (let k = 0; k < times.length; k++) {
        if (times[k] === today) {
          idx = k;
          break;
        }
      }
      const dayS = times[idx] ?? today;
      const tmax = tmaxs[idx] ?? null;
      const rh = middayRh(hourly, dayS);
      const hi = tmax != null && rh != null ? heatIndexC(Number(tmax), rh) : null;
      const { lat, lon } = batch[j];
      features.push({
        type: 'Feature',
        geometry: { type: 'Polygon', coordinates: cellPolygon(lat, lon) },
        properties: {
          lat,
          lon,
          tmax_c: tmax == null ? null : Math.round(Number(tmax) * 100) / 100,
          rh_midday_pct: rh,
          heat_index_c: hi,
          severity_band: hiBand(hi),
          obs_date: dayS,
          source: 'open_meteo_forecast',
          mode: 'shadow',
        },
      });
    }
  }

  return {
    type: 'FeatureCollection',
    mode: 'shadow',
    advisory: true,
    engine: 'heat_grid_v1_next',
    generated_at: new Date().toISOString(),
    bbox: [ODISHA_LON_MIN, ODISHA_LAT_MIN, ODISHA_LON_MAX, ODISHA_LAT_MAX],
    step_deg: STEP,
    cell_count: features.length,
    features,
    attribution:
      'Weather data: Open-Meteo (CC BY 4.0). Decision layer: ModelEarth heat engine (shadow).',
  };
}

/**
 * Prefer ModelEarth backend /heat/grid; fall back to same Open-Meteo Odisha grid
 * so Heat Ops works before the VM route is deployed.
 */
export async function GET() {
  try {
    const upstream = await fetch(`${API_BASE_URL}/heat/grid`, {
      cache: 'no-store',
      headers: { Accept: 'application/json' },
    });
    if (upstream.ok) {
      const json = await upstream.json();
      if (json?.type === 'FeatureCollection' && Array.isArray(json.features)) {
        return NextResponse.json(json, {
          headers: { 'Cache-Control': 'public, s-maxage=900, stale-while-revalidate=300' },
        });
      }
    }
  } catch {
    // fall through to local grid
  }

  try {
    const local = await buildLocalGrid();
    return NextResponse.json(local, {
      headers: { 'Cache-Control': 'public, s-maxage=900, stale-while-revalidate=300' },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Heat grid unavailable';
    return NextResponse.json({ error: message, mode: 'shadow' }, { status: 502 });
  }
}
