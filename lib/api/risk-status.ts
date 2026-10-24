/**
 * Risk payload honesty helpers (D023-D025, D036).
 * Gate alerts on `alerting === true`.
 * Gate river display on `riverIsLive` (`live` CWC telemetry or `live_daily` DoWR bulletin).
 */

export type RiverStatus = 'live' | 'live_daily' | 'stale' | 'unavailable';
export type ScoringMode = 'rain_only' | 'rain_and_river' | string;

export const RIVER_LIVE: ReadonlySet<string> = new Set(['live', 'live_daily']);

export function riverIsLive(s: string | null | undefined): boolean {
  return RIVER_LIVE.has(String(s ?? '').toLowerCase());
}

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
  if (s === 'live' || s === 'live_daily' || s === 'stale' || s === 'unavailable') return s;
  return 'unavailable';
}

export function scoringModeOf(risk: Record<string, unknown>): ScoringMode {
  const raw = riskRaw(risk);
  const m = String(risk.scoring_mode ?? raw.scoring_mode ?? '').toLowerCase();
  if (m === 'rain_only' || m === 'rain_and_river') return m;
  return riverIsLive(riverStatusOf(risk)) ? 'rain_and_river' : 'rain_only';
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

/** Never call a DoWR bulletin "live". CWC hourly = Live gauge; bulletin = dated. */
export function fmtIstStamp(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (!Number.isFinite(d.getTime())) return null;
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Kolkata',
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(d);
  const get = (t: Intl.DateTimeFormatPartTypes) => parts.find((p) => p.type === t)?.value ?? '';
  const day = get('day');
  const month = get('month');
  const hour = get('hour');
  const minute = get('minute');
  if (!day || !month) return null;
  return `${day} ${month} ${hour}:${minute}`;
}

export function riverFeedCaption(status: string, observedAt?: string | null): string | null {
  if (status === 'live') return 'Live gauge';
  if (status === 'live_daily') {
    const t = fmtIstStamp(observedAt);
    return t ? `DoWR bulletin, ${t} IST` : 'DoWR bulletin';
  }
  return null;
}

export function riverSourceLabel(source: unknown): string | null {
  const s = String(source ?? '').trim().toLowerCase();
  if (!s) return null;
  if (s === 'dowr_flood_bulletin') return 'DoWR daily bulletin';
  if (s === 'cwc_telemetry') return 'CWC gauge';
  return s.replace(/[_-]+/g, ' ');
}

export function riverTrendWord(trend: unknown): string | null {
  const t = String(trend ?? '').trim().toLowerCase();
  if (t === 'rising') return 'rising';
  if (t === 'falling') return 'falling';
  if (t === 'steady' || t === 'stable' || t === 'flat') return 'steady';
  return null;
}

/* ==========================================================================
   Rule v2.5 (D034) - river stage is a scoring input, not just a decay gate.
   D036: `live_daily` (DoWR bulletin ≤ 30 h) scores like `live` on the four
   pilot reaches. The five LIVE cities stay rain-only.
   ========================================================================== */

export type SignalSource = 'rainfall' | 'river' | 'both';

/** Which signal actually drove the score. Answers "why is this HIGH?". */
export function signalSourceOf(risk: Record<string, unknown>): SignalSource {
  const raw = riskRaw(risk);
  const s = String(risk.signal_source ?? raw.signal_source ?? '').toLowerCase();
  if (s === 'rainfall' || s === 'river' || s === 'both') return s;
  // no field: infer from mode rather than guessing "both"
  return scoringModeOf(risk) === 'rain_and_river' ? 'both' : 'rainfall';
}

/**
 * River level as a fraction of its published danger level. >= 1.0 is at or over
 * danger. Returns null when there is no live river reading, so callers render
 * nothing rather than an empty gauge that looks like "zero risk".
 */
export function riverRatioOf(risk: Record<string, unknown>): number | null {
  const raw = riskRaw(risk);
  const v = risk.river_ratio ?? raw.river_ratio;
  if (typeof v !== 'number' || !Number.isFinite(v) || v <= 0) return null;
  return v;
}

/** "97% of its danger mark" / "at danger" / "12% over danger". */
export function fmtRiverRatio(ratio: number | null): string {
  if (ratio === null) return '-';
  const p = Math.round(ratio * 100);
  if (p === 100) return 'at its danger mark';
  if (p > 100) return `${p - 100}% over its danger mark`;
  return `${p}% of its danger mark`;
}
