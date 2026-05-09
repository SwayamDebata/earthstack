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
 * Never hardcode tokens in source — GitHub push protection will block the commit.
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

export const POLLING_INTERVALS = {
  health: 15_000,
  alerts: 20_000,
  risk: 30_000,
  rainfall: 45_000,
  forecast: 60_000,
  map: 60_000,
  mlLogs: 60_000,
  replay: 0,
} as const;

export const STALE_THRESHOLDS_MS = {
  health: 60_000,
  weather: 30 * 60_000,
  risk: 20 * 60_000,
  alerts: 15 * 60_000,
  rainfall: 60 * 60_000,
  forecast: 3 * 60 * 60_000,
} as const;
