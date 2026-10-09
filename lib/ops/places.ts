import { ALERTING_REGIONS, SHADOW_REGIONS } from '@/lib/ops/language';

export type PlaceTier = 'live' | 'pilot' | 'shadow';

export type OpsPlace = {
  region: string;
  severity: string;
  rule_score: number | null;
  lat: number;
  lng: number;
  live: boolean;
  tier: PlaceTier;
  trend: string | null;
  signal_source: string | null;
};

/** Display fallbacks only - never an authorisation list. */
const PLACE_COORDS: Record<string, [number, number]> = {
  bhubaneswar: [85.8245, 20.2961],
  cuttack: [85.8823, 20.4625],
  puri: [85.8312, 19.8135],
  sambalpur: [83.9701, 21.4669],
  rourkela: [84.8536, 22.2604],
  anandapur: [86.123, 21.214],
  bhadrak: [86.505, 21.058],
  jajpur: [86.337, 20.848],
  baripada: [86.722, 21.934],
};

function num(v: unknown): number | null {
  return typeof v === 'number' && Number.isFinite(v) ? v : null;
}

function lc(s: string): string {
  return s.trim().toLowerCase();
}

function fromRow(r: Record<string, unknown>, fromLiveMap: boolean): OpsPlace | null {
  const region = String(r.region ?? r.district ?? r.location ?? '').trim();
  if (!region || region.toLowerCase() === 'odisha') return null;
  const key = region.toLowerCase();
  const fallback = PLACE_COORDS[key];
  const lat = num(r.lat) ?? num(r.latitude) ?? (fallback ? fallback[1] : null);
  const lng = num(r.lng) ?? num(r.longitude) ?? num(r.lon) ?? (fallback ? fallback[0] : null);
  if (lat === null || lng === null) return null;
  const signal = typeof r.signal_source === 'string' ? r.signal_source : null;
  return {
    region,
    severity: String(r.severity ?? r.risk_level ?? ''),
    rule_score: num(r.rule_score),
    lat,
    lng,
    live: fromLiveMap,
    tier: fromLiveMap ? 'live' : 'shadow',
    trend: typeof r.trend === 'string' ? r.trend : null,
    signal_source: signal,
  };
}

/** Shadow / pilot map is fetched when admin, or when /me lists a pilot desk. */
export function includeShadowPlaces(role: string, pilotJurisdiction: string[]): boolean {
  return role === 'admin' || pilotJurisdiction.some((n) => n.trim());
}

export function placeStatusKind(p: OpsPlace): 'PILOT' | 'SHADOW' | null {
  if (p.tier === 'pilot') return 'PILOT';
  if (p.tier === 'shadow') return 'SHADOW';
  return null;
}

/** Live `/risk/map` plus, when allowed, north Odisha `/risk/shadow/map`. */
export function placesFromMaps(
  liveMap: unknown,
  shadowMap: unknown,
  allowed: string[],
  opts: { role: string; pilotJurisdiction: string[] },
): OpsPlace[] {
  const liveRows = (Array.isArray(liveMap) ? liveMap : []) as Record<string, unknown>[];
  const allow = new Set(allowed.map(lc).filter(Boolean));
  const pilot = new Set(opts.pilotJurisdiction.map(lc).filter(Boolean));
  const admin = opts.role === 'admin';

  const byName = new Map<string, OpsPlace>();
  for (const r of liveRows) {
    const p = fromRow(r, true);
    if (!p) continue;
    if (allow.size && !allow.has(p.region.toLowerCase())) continue;
    p.tier = pilot.has(p.region.toLowerCase()) ? 'pilot' : 'live';
    byName.set(p.region.toLowerCase(), p);
  }

  if (admin || pilot.size > 0) {
    const shadowCities =
      shadowMap && typeof shadowMap === 'object'
        ? (((shadowMap as { cities?: Record<string, unknown>[] }).cities ?? []) as Record<string, unknown>[])
        : [];
    for (const r of shadowCities) {
      const p = fromRow(r, false);
      if (!p) continue;
      const key = p.region.toLowerCase();
      if (!admin && !pilot.has(key)) continue;
      if (byName.has(key)) continue;
      p.tier = pilot.has(key) ? 'pilot' : 'shadow';
      byName.set(key, p);
    }
  }

  return [...byName.values()].sort((a, b) => a.region.localeCompare(b.region));
}

/** Kept as coordinate names only. Do not use for tenancy. */
export const DISPLAY_LIVE_REGIONS = ALERTING_REGIONS;
export const DISPLAY_SHADOW_REGIONS = SHADOW_REGIONS;
