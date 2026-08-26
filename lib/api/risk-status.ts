/**
 * Risk payload honesty helpers (D023-D025).
 * Gate alerts on `alerting === true`. Gate river display on `river_status === "live"`.
 */

export type RiverStatus = 'live' | 'stale' | 'unavailable' | string;
export type ScoringMode = 'rain_only' | 'rain_and_river' | string;

const RAIN_ONLY_CAP = 0.665;

function asRecord(v: unknown): Record<string, unknown> {
  return v && typeof v === 'object' ? (v as Record<string, unknown>) : {};
}

export function riskRaw(risk: Record<string, unknown>): Record<string, unknown> {
  return asRecord(risk.raw_data);
}

export function riverStatusOf(
  riskOrEvidence: Record<string, unknown>,
): RiverStatus {
  const raw = riskRaw(riskOrEvidence);
  const s = String(riskOrEvidence.river_status ?? raw.river_status ?? '').toLowerCase();
  if (s === 'live' || s === 'stale' || s === 'unavailable') return s;
  return 'unavailable';
}

export function scoringModeOf(risk: Record<string, unknown>): ScoringMode {
  const raw = riskRaw(risk);
  const m = String(risk.scoring_mode ?? raw.scoring_mode ?? '').toLowerCase();
  if (m === 'rain_only' || m === 'rain_and_river') return m;
  return riverStatusOf(risk) === 'live' ? 'rain_and_river' : 'rain_only';
}

/** True only when this location may trigger product alerts. */
export function isAlertingLocation(risk: Record<string, unknown>): boolean {
  if (typeof risk.alerting === 'boolean') return risk.alerting;
  // Legacy payloads without the field: treat as product (alerting) unless mode=shadow.
  if (String(risk.mode ?? '').toLowerCase() === 'shadow') return false;
  return true;
}

export function isShadowRisk(risk: Record<string, unknown>): boolean {
  if (typeof risk.advisory === 'boolean' && risk.advisory) return true;
  return String(risk.mode ?? '').toLowerCase() === 'shadow';
}

/**
 * Dial ceiling. Rain-only mode caps ~0.665 so CRITICAL is unreachable.
 * Prefer upstream `max_achievable_score` when present.
 */
export function maxAchievableScore(risk: Record<string, unknown>): number {
  const raw = riskRaw(risk);
  const v = risk.max_achievable_score ?? raw.max_achievable_score;
  if (typeof v === 'number' && Number.isFinite(v) && v > 0) return v;
  if (scoringModeOf(risk) === 'rain_only') return RAIN_ONLY_CAP;
  return 1;
}

export function riverObservedAt(riskOrEvidence: Record<string, unknown>): string | null {
  const raw = riskRaw(riskOrEvidence);
  const t = riskOrEvidence.river_observed_at ?? raw.river_observed_at;
  return typeof t === 'string' && t.trim() ? t : null;
}

export function riverStationLabel(riskOrEvidence: Record<string, unknown>): string | null {
  const raw = riskRaw(riskOrEvidence);
  const cwc = riskOrEvidence.river_station_cwc ?? raw.river_station_cwc;
  const station = riskOrEvidence.river_station ?? raw.river_station ?? riskOrEvidence.river_station_name;
  if (typeof cwc === 'string' && cwc.trim()) return cwc;
  if (typeof station === 'string' && station.trim()) return station;
  return null;
}

export function fmtMetres(n: number | null | undefined): string {
  if (n === null || n === undefined || !Number.isFinite(n)) return '-';
  return `${Math.round(n * 100) / 100} m`;
}

export function fmtSignedMetres(n: number | null | undefined): string {
  if (n === null || n === undefined || !Number.isFinite(n)) return '-';
  const v = Math.round(n * 100) / 100;
  return `${v > 0 ? '+' : ''}${v} m`;
}
