import { isAlertingRegion, isShadowRegion, ALERTING_REGIONS } from '@/lib/ops/language';

export type OpsPlace = {
  region: string;
  severity: string;
  rule_score: number | null;
  lat: number;
  lng: number;
  live: boolean;
  trend: string | null;
};

const SHADOW_COORDS: Record<string, [number, number]> = {
  anandapur: [86.123, 21.214],
  bhadrak: [86.505, 21.058],
  jajpur: [86.337, 20.848],
  baripada: [86.722, 21.934],
};

function num(v: unknown): number | null {
  return typeof v === 'number' && Number.isFinite(v) ? v : null;
}

function fromRow(r: Record<string, unknown>, live: boolean): OpsPlace | null {
  const region = String(r.region ?? r.district ?? r.location ?? '').trim();
  if (!region || region.toLowerCase() === 'odisha') return null;
  const key = region.toLowerCase();
  const fallback = SHADOW_COORDS[key];
  const lat = num(r.lat) ?? num(r.latitude) ?? (fallback ? fallback[1] : null);
  const lng = num(r.lng) ?? num(r.longitude) ?? num(r.lon) ?? (fallback ? fallback[0] : null);
  if (lat === null || lng === null) return null;
  if (live && !isAlertingRegion(region)) return null;
  if (!live && !isShadowRegion(region)) return null;
  return {
    region,
    severity: String(r.severity ?? r.risk_level ?? ''),
    rule_score: num(r.rule_score),
    lat,
    lng,
    live,
    trend: typeof r.trend === 'string' ? r.trend : null,
  };
}

/** Internal / admin sees north Odisha in shadow. A single-district office does not. */
export function canSeeShadowLocations(role: string, jurisdiction: string[]): boolean {
  if (role === 'admin') return true;
  const have = new Set(jurisdiction.map((n) => n.trim().toLowerCase()));
  return ALERTING_REGIONS.every((c) => have.has(c.toLowerCase()));
}

/** Live `/risk/map` plus, when allowed, north Odisha `/risk/shadow/map`. */
export function placesFromMaps(
  liveMap: unknown,
  shadowMap: unknown,
  allowedLive: string[],
  includeShadow: boolean,
): OpsPlace[] {
  const liveRows = (Array.isArray(liveMap) ? liveMap : []) as Record<string, unknown>[];
  const allow = new Set(allowedLive.map((n) => n.trim().toLowerCase()).filter(Boolean));

  const byName = new Map<string, OpsPlace>();
  for (const r of liveRows) {
    const p = fromRow(r, true);
    if (!p) continue;
    if (allow.size && !allow.has(p.region.toLowerCase())) continue;
    byName.set(p.region.toLowerCase(), p);
  }

  if (includeShadow) {
    const shadowCities =
      shadowMap && typeof shadowMap === 'object'
        ? (((shadowMap as { cities?: Record<string, unknown>[] }).cities ?? []) as Record<string, unknown>[])
        : [];
    for (const r of shadowCities) {
      const p = fromRow(r, false);
      if (!p) continue;
      const key = p.region.toLowerCase();
      if (!byName.has(key)) byName.set(key, p);
    }
  }

  return [...byName.values()].sort((a, b) => a.region.localeCompare(b.region));
}
