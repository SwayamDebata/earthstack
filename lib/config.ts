function firstNonEmptyBaseUrl(...candidates: (string | undefined)[]): string {
  for (const raw of candidates) {
    const s = raw?.trim().replace(/\/$/, '');
    if (s) return s;
  }
  return 'https://api.modelearth.in';
}

/**
 * Server-side proxy and SSR should prefer `API_BASE_URL` (private / internal) when set.
 * Browser still uses `/api/proxy` only; it does not read this for direct calls.
 * Empty strings are ignored so a bad `.env` line does not break all requests.
 */
export const API_BASE_URL = firstNonEmptyBaseUrl(
  process.env.API_BASE_URL,
  process.env.EARTHSTACK_API_BASE_URL,
  process.env.NEXT_PUBLIC_API_BASE_URL,
);

/** Upstream timeout for the Next.js proxy (ms). */
export const API_UPSTREAM_TIMEOUT_MS = Number(process.env.API_UPSTREAM_TIMEOUT_MS ?? '45000');
/**
 * Mapbox public token. Must be provided via env (NEXT_PUBLIC_MAPBOX_TOKEN).
 * Never hardcode tokens in source - GitHub push protection will block the commit.
 * Set in .env.local for dev and in your hosting provider's env for prod.
 */
export const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? '';

export const LOCATIONS = [
  'Bhubaneswar',
  'Cuttack',
  'Puri',
  'Sambalpur',
  'Rourkela',
] as const;

export type Location = (typeof LOCATIONS)[number];

/**
 * Polling cadence per channel.
 *
 * Tuned to be friendly to a DB-backed upstream:
 *   - chrome (health/alerts/map) refresh ~ once a minute
 *   - per-region heavy endpoints (rainfall/forecast/ml) refresh every 2-5 minutes
 *   - replay is on-demand only
 *
 * Each subscriber should pass these through `withJitter()` so multiple
 * widgets sharing an interval don't synchronize their polls into a spike.
 */
export const POLLING_INTERVALS = {
  health: 60_000,
  alerts: 60_000,
  risk: 90_000,
  map: 120_000,
  rainfall: 180_000,
  forecast: 300_000,
  mlLogs: 120_000,
  replay: 0,
} as const;

/**
 * Add up to ±25% jitter to a polling interval.
 * Spreads out concurrent subscribers so they don't fire at the same instant.
 *
 * Usage in React Query:
 *   refetchInterval: () => withJitter(POLLING_INTERVALS.risk)
 */
export function withJitter(intervalMs: number, ratio = 0.25): number {
  if (!intervalMs || intervalMs <= 0) return intervalMs;
  const delta = intervalMs * ratio;
  return Math.round(intervalMs + (Math.random() * 2 - 1) * delta);
}

export const STALE_THRESHOLDS_MS = {
  health: 60_000,
  weather: 30 * 60_000,
  risk: 20 * 60_000,
  alerts: 15 * 60_000,
  rainfall: 60 * 60_000,
  forecast: 3 * 60 * 60_000,
} as const;
