/* ==========================================================================
   The words.

   One rule, applied everywhere: if a sentence would make sense to a person who
   has never heard of ModelEarth and is worried about a river, it stays. If it
   only makes sense to someone thinking about a dashboard, it is cut.

   That rule deletes mission timers, telemetry language, link status, latency,
   "active zones" and the word "unknown". None of those describe the river or
   the officer's job; they describe our software's opinion of itself.

   These helpers exist so the phrasing is written once rather than being
   reinvented, slightly differently, on every screen.
   ========================================================================== */

const MIN = 60_000;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;

function parse(t: string | number | Date | null | undefined): number | null {
  if (t === null || t === undefined) return null;
  const ms = t instanceof Date ? t.getTime() : typeof t === 'number' ? t : Date.parse(t);
  return Number.isFinite(ms) ? ms : null;
}

/**
 * How long ago, said the way a person says it.
 * "14 minutes ago", not "T+000:00:14:00".
 */
export function ago(t: string | number | Date | null | undefined, now = Date.now()): string {
  const ms = parse(t);
  if (ms === null) return 'never';
  const d = Math.max(0, now - ms);
  if (d < 45 * 1000) return 'just now';
  if (d < 90 * 1000) return 'a minute ago';
  if (d < HOUR) return `${Math.round(d / MIN)} minutes ago`;
  if (d < 2 * HOUR) return 'an hour ago';
  if (d < DAY) return `${Math.round(d / HOUR)} hours ago`;
  if (d < 2 * DAY) return 'yesterday';
  return `${Math.round(d / DAY)} days ago`;
}

/**
 * Elapsed time since an alert fired. This is the most important number in the
 * inbox, so it is short and scannable rather than conversational: "3h 12m".
 */
export function elapsed(t: string | number | Date | null | undefined, now = Date.now()): string {
  const ms = parse(t);
  if (ms === null) return '-';
  const d = Math.max(0, now - ms);
  const h = Math.floor(d / HOUR);
  const m = Math.floor((d % HOUR) / MIN);
  if (h === 0) return `${m}m`;
  if (h < 48) return `${h}h ${m}m`;
  return `${Math.floor(h / 24)}d ${h % 24}h`;
}

/** Minutes since, for thresholds and sorting. */
export function minutesSince(t: string | number | Date | null | undefined, now = Date.now()): number {
  const ms = parse(t);
  return ms === null ? Number.POSITIVE_INFINITY : Math.max(0, (now - ms) / MIN);
}

/** "14 September, 06:12" - the format a briefing would print. */
export function dateTime(t: string | number | Date | null | undefined): string {
  const ms = parse(t);
  if (ms === null) return 'not recorded';
  return new Date(ms).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

/** "17 September 2026" - the date a printed briefing is filed under. */
export function dateOnly(t: string | number | Date | null | undefined): string {
  const ms = parse(t);
  if (ms === null) return 'not recorded';
  return new Date(ms).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function timeOnly(t: string | number | Date | null | undefined): string {
  const ms = parse(t);
  if (ms === null) return '-';
  return new Date(ms).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

/**
 * Freshness, stated as a fact about the data rather than about the connection.
 * "Waiting for rainfall data. Last good reading 06:12." beats "Awaiting
 * upstream telemetry", which tells an officer nothing they can act on.
 */
export function freshness(
  lastGood: string | number | Date | null | undefined,
  opts: { subject?: string; staleAfterMinutes?: number } = {},
): { tone: 'fresh' | 'stale' | 'missing'; text: string } {
  const { subject = 'data', staleAfterMinutes = 90 } = opts;
  const ms = parse(lastGood);
  if (ms === null) {
    return { tone: 'missing', text: `No ${subject} yet.` };
  }
  const mins = minutesSince(ms);
  if (mins <= staleAfterMinutes) {
    return { tone: 'fresh', text: `Updated ${ago(ms)}.` };
  }
  return {
    tone: 'stale',
    text: `Waiting for ${subject}. Last good reading ${timeOnly(ms)}, ${ago(ms)}.`,
  };
}

/** "5 locations monitored, 2 above alert level" - never "Active zones: 2". */
export function coverageLine(monitored: number, aboveAlert: number): string {
  const loc = monitored === 1 ? 'location' : 'locations';
  if (aboveAlert === 0) return `${monitored} ${loc} monitored, none above alert level`;
  return `${monitored} ${loc} monitored, ${aboveAlert} above alert level`;
}

/** "3 alerts need attention" - never "Alert queue: 3 act". */
export function needAttentionLine(n: number): string {
  if (n === 0) return 'Nothing needs attention';
  return `${n} alert${n === 1 ? '' : 's'} need${n === 1 ? 's' : ''} attention`;
}

/** Plain sentence for which signal drove a score. */
export function drivenBy(signalSource: string | null | undefined): string {
  const s = String(signalSource ?? '').toLowerCase();
  if (s === 'river') return 'Driven by river level';
  if (s === 'both') return 'Driven by rainfall and river level';
  if (s === 'rainfall') return 'Driven by rainfall';
  return 'Driven by rainfall';
}

/** Cities the product issues alerts for. */
export const ALERTING_REGIONS = [
  'Bhubaneswar',
  'Cuttack',
  'Puri',
  'Sambalpur',
  'Rourkela',
] as const;

/** North Odisha — scored live, shown in Ops, labelled SHADOW until the trust gate. */
export const SHADOW_REGIONS = ['Anandapur', 'Bhadrak', 'Jajpur', 'Baripada'] as const;

export const ALL_REGIONS = [...ALERTING_REGIONS, ...SHADOW_REGIONS] as const;

export function isAlertingRegion(region: string | null | undefined): boolean {
  const r = String(region ?? '').trim().toLowerCase();
  return ALERTING_REGIONS.some((x) => x.toLowerCase() === r);
}

export function isShadowRegion(region: string | null | undefined): boolean {
  const r = String(region ?? '').trim().toLowerCase();
  return SHADOW_REGIONS.some((x) => x.toLowerCase() === r);
}

export function isKnownRegion(region: string | null | undefined): boolean {
  const r = String(region ?? '').trim().toLowerCase();
  if (r === 'odisha') return false;
  return ALL_REGIONS.some((x) => x.toLowerCase() === r);
}

/**
 * Data sources, named the way a person would say them out loud.
 *
 * The API returns machine identifiers like `imd_bhubaneswar_rfnormal` and
 * `openweather`. Printing those verbatim on an operational screen is the exact
 * failure mode of writing about the software instead of about the river: the
 * string is meaningful to whoever wrote the pipeline and to nobody else. An
 * officer wants to know whether the baseline came from IMD or from a vendor,
 * which is a real question with a real answer in plain words.
 *
 * Unrecognised identifiers are tidied rather than hidden, because inventing a
 * friendly name for a source we do not recognise would be worse than showing
 * a slightly ugly one.
 */
export function sourceName(id: string | null | undefined): string | null {
  const raw = String(id ?? '').trim();
  if (!raw) return null;
  const v = raw.toLowerCase();

  if (v === 'openweather' || v === 'openweathermap') return 'OpenWeather';
  if (v === 'imd' || v.startsWith('imd_')) {
    // imd_<place>_rfnormal -> IMD's <Place> rainfall normals
    const m = /^imd_([a-z]+)_rfnormal$/.exec(v);
    if (m) {
      const place = m[1].charAt(0).toUpperCase() + m[1].slice(1);
      return `IMD's ${place} rainfall normals`;
    }
    return 'the India Meteorological Department';
  }
  if (v.includes('cwc')) return 'the Central Water Commission';
  if (v.includes('era5')) return 'the ERA5 reanalysis record';
  if (v.includes('gfs')) return 'the GFS global forecast';

  // Unknown source: make it readable without pretending to know what it is.
  return raw.replace(/[_-]+/g, ' ');
}

/**
 * Reason text from the API, in words an officer would use.
 *
 * The engine writes `3.7 mm rain in last 24h (heavy-rain baseline p95 25.31
 * mm)`. "p95" is a statistician's word: it is precise, it is correct, and it
 * means nothing to a tahsildar reading a printed briefing at 9am. The number
 * behind it is worth keeping, so this rewrites the phrasing rather than
 * dropping the figure.
 *
 * Anything that does not match a known pattern is returned untouched. Silently
 * mangling a reason we do not recognise would be worse than printing it as the
 * engine wrote it.
 */
export function plainReason(text: string | null | undefined): string {
  const raw = String(text ?? '').trim();
  if (!raw) return '';

  return (
    raw
      // "(heavy-rain baseline p95 25.31 mm)" -> "(heavy rain here starts near 25.3 mm)"
      .replace(
        /\(\s*heavy[- ]rain baseline\s*p95\s*([\d.]+)\s*mm\s*\)/gi,
        (_m, mm: string) => `(heavy rain here starts near ${Number(mm).toFixed(1)} mm)`,
      )
      // bare "p95 baseline 25.31 mm" anywhere else
      .replace(
        /p95\s*(?:baseline)?\s*([\d.]+)\s*mm/gi,
        (_m, mm: string) => `heavy-rain level ${Number(mm).toFixed(1)} mm`,
      )
      // "in next 24h" / "in last 24h" read better spelled out on paper
      // "in next 24h" -> "in the next 24 hours". Deliberately not "expected in
      // the next", because the engine already writes "rain forecast in next
      // 24h" and the result would read "forecast expected in".
      .replace(/\bin next (\d+)\s*h\b/gi, 'in the next $1 hours')
      .replace(/\bin last (\d+)\s*h\b/gi, 'in the last $1 hours')
  );
}
