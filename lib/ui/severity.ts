import type { UiMode } from '@/lib/access/ui-mode';

/**
 * Shared severity + trend + confidence system for the Decision Engine / War Room.
 * One helper used everywhere so colors never drift between views.
 *
 * Severity scale (per product spec):
 *   CRITICAL = deep red, HIGH = red/orange, MEDIUM = amber, LOW = green.
 */
export type SeverityKey = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'UNKNOWN';

export const SEVERITY_ORDER: SeverityKey[] = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];

export function normalizeSeverity(input: unknown): SeverityKey {
  const v = String(input ?? '').trim().toUpperCase();
  if (v === 'CRITICAL' || v === 'SEVERE') return 'CRITICAL';
  if (v === 'HIGH') return 'HIGH';
  if (v === 'MEDIUM' || v === 'MODERATE' || v === 'WARNING' || v === 'WARN') return 'MEDIUM';
  if (v === 'LOW' || v === 'NORMAL' || v === 'OK') return 'LOW';
  return 'UNKNOWN';
}

type SeverityStyle = {
  key: SeverityKey;
  label: string;
  /** Solid hex for bars, segments, gauges, map markers. */
  hex: string;
  /** Small status dot / accent hex. */
  accent: string;
};

const SEVERITY_STYLE: Record<SeverityKey, SeverityStyle> = {
  CRITICAL: { key: 'CRITICAL', label: 'Critical', hex: '#b91c1c', accent: '#ef4444' },
  HIGH: { key: 'HIGH', label: 'High', hex: '#f97316', accent: '#fb923c' },
  MEDIUM: { key: 'MEDIUM', label: 'Medium', hex: '#f59e0b', accent: '#fbbf24' },
  LOW: { key: 'LOW', label: 'Low', hex: '#10b981', accent: '#34d399' },
  UNKNOWN: { key: 'UNKNOWN', label: 'Unknown', hex: '#64748b', accent: '#94a3b8' },
};

export function severityColor(input: unknown): SeverityStyle {
  return SEVERITY_STYLE[normalizeSeverity(input)];
}

/** Chip / pill classes for a severity, aware of the light (standard) vs dark (command) theme. */
export function severityChipClass(input: unknown, mode: UiMode): string {
  const key = normalizeSeverity(input);
  const base =
    'inline-flex items-center gap-1 rounded px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide';
  const std = mode === 'standard';
  const light: Record<SeverityKey, string> = {
    CRITICAL: 'bg-red-100 text-red-800 ring-1 ring-red-300',
    HIGH: 'bg-orange-100 text-orange-800 ring-1 ring-orange-300',
    MEDIUM: 'bg-amber-100 text-amber-900 ring-1 ring-amber-300',
    LOW: 'bg-emerald-100 text-emerald-800 ring-1 ring-emerald-300',
    UNKNOWN: 'bg-slate-100 text-slate-700 ring-1 ring-slate-300',
  };
  const dark: Record<SeverityKey, string> = {
    CRITICAL: 'bg-red-600/25 text-red-200 ring-1 ring-red-500/50',
    HIGH: 'bg-orange-500/20 text-orange-200 ring-1 ring-orange-400/45',
    MEDIUM: 'bg-amber-500/20 text-amber-200 ring-1 ring-amber-400/45',
    LOW: 'bg-emerald-500/20 text-emerald-200 ring-1 ring-emerald-400/45',
    UNKNOWN: 'bg-slate-500/20 text-slate-300 ring-1 ring-slate-400/35',
  };
  return `${base} ${(std ? light : dark)[key]}`;
}

/** Left-border / accent classes for cards, aware of theme. */
export function severityBorderClass(input: unknown, mode: UiMode): string {
  const key = normalizeSeverity(input);
  const std = mode === 'standard';
  const light: Record<SeverityKey, string> = {
    CRITICAL: 'border-l-red-600',
    HIGH: 'border-l-orange-500',
    MEDIUM: 'border-l-amber-500',
    LOW: 'border-l-emerald-500',
    UNKNOWN: 'border-l-slate-400',
  };
  const dark: Record<SeverityKey, string> = {
    CRITICAL: 'border-l-red-500',
    HIGH: 'border-l-orange-400',
    MEDIUM: 'border-l-amber-400',
    LOW: 'border-l-emerald-400',
    UNKNOWN: 'border-l-slate-500',
  };
  return (std ? light : dark)[key];
}

export function needsAttention(input: unknown): boolean {
  const key = normalizeSeverity(input);
  return key === 'CRITICAL' || key === 'HIGH' || key === 'MEDIUM';
}

/**
 * Coverage scale for the FloodBench matrix. Same helper family as severity,
 * mapped to yes = green, partial = amber, no = grey/empty.
 */
export type CoverageKey = 'yes' | 'partial' | 'no';

export function normalizeCoverage(input: unknown): CoverageKey {
  const v = String(input ?? '').trim().toLowerCase();
  if (v === 'yes' || v === 'full' || v === 'covered') return 'yes';
  if (v === 'partial' || v === 'part') return 'partial';
  return 'no';
}

type CoverageStyle = { key: CoverageKey; label: string; hex: string };

const COVERAGE_STYLE: Record<CoverageKey, CoverageStyle> = {
  yes: { key: 'yes', label: 'Yes', hex: '#10b981' },
  partial: { key: 'partial', label: 'Partial', hex: '#f59e0b' },
  no: { key: 'no', label: 'No', hex: '#64748b' },
};

export function coverageColor(input: unknown): CoverageStyle {
  return COVERAGE_STYLE[normalizeCoverage(input)];
}

export function coverageBadgeClass(input: unknown, mode: UiMode): string {
  const key = normalizeCoverage(input);
  const base = 'inline-flex min-w-[3.5rem] items-center justify-center rounded px-2 py-1 text-[11px] font-semibold uppercase tracking-wide';
  const std = mode === 'standard';
  const light: Record<CoverageKey, string> = {
    yes: 'bg-emerald-100 text-emerald-800 ring-1 ring-emerald-300',
    partial: 'bg-amber-100 text-amber-900 ring-1 ring-amber-300',
    no: 'bg-slate-100 text-slate-400 ring-1 ring-slate-200',
  };
  const dark: Record<CoverageKey, string> = {
    yes: 'bg-emerald-500/20 text-emerald-200 ring-1 ring-emerald-400/45',
    partial: 'bg-amber-500/20 text-amber-200 ring-1 ring-amber-400/45',
    no: 'bg-white/[0.04] text-slate-500 ring-1 ring-white/10',
  };
  return `${base} ${(std ? light : dark)[key]}`;
}

/** Trend direction. Rising up, Falling down, everything else stable. */
export type TrendKey = 'rising' | 'falling' | 'stable';

export function normalizeTrend(input: unknown): TrendKey {
  const v = String(input ?? '').trim().toLowerCase();
  if (v === 'rising' || v === 'up' || v === 'increasing') return 'rising';
  if (v === 'falling' || v === 'down' || v === 'decreasing') return 'falling';
  return 'stable';
}

/** Unicode arrow for a trend (used where an icon component is overkill). */
export function trendArrow(input: unknown): string {
  const t = normalizeTrend(input);
  return t === 'rising' ? '\u2191' : t === 'falling' ? '\u2193' : '\u2192';
}

export function trendLabel(input: unknown): string {
  const raw = String(input ?? '').trim();
  if (raw) return raw;
  return 'Stable';
}

/** Confidence as a 0-100 integer. Accepts 0-1 fractions or 0-100 values. */
export function confidencePct(input: unknown): number | null {
  const n = typeof input === 'number' ? input : Number(input);
  if (!Number.isFinite(n)) return null;
  const pct = n <= 1 ? n * 100 : n;
  return Math.max(0, Math.min(100, Math.round(pct)));
}

export const LOW_CONFIDENCE_PCT = 65;

export function isLowConfidence(input: unknown): boolean {
  const pct = confidencePct(input);
  return pct !== null && pct < LOW_CONFIDENCE_PCT;
}

/** Risk score (0-1) as a percentage integer. */
export function scorePct(input: unknown): number | null {
  const n = typeof input === 'number' ? input : Number(input);
  if (!Number.isFinite(n)) return null;
  const pct = n <= 1 ? n * 100 : n;
  return Math.max(0, Math.min(100, Math.round(pct)));
}

/**
 * Parse an API replay_url like "/replay/historical/indofloods/INDOFLOODS-gauge-759-6"
 * into { source, eventId } so we can open the in-app replay view for that event.
 */
export function parseReplayUrl(url: unknown): { source: string; eventId: string } | null {
  if (typeof url !== 'string' || !url) return null;
  const match = url.match(/\/replay\/historical\/([^/]+)\/([^/?#]+)/);
  if (!match) return null;
  return { source: decodeURIComponent(match[1]), eventId: decodeURIComponent(match[2]) };
}

/** Build the in-app operational replay link for a historical event. */
export function replayViewHref(opts: {
  eventId?: string | null;
  source?: string | null;
  replayUrl?: string | null;
}): string {
  let eventId = opts.eventId ?? undefined;
  let source = opts.source ?? undefined;
  if (!eventId) {
    const parsed = parseReplayUrl(opts.replayUrl);
    if (parsed) {
      eventId = parsed.eventId;
      source = source ?? parsed.source;
    }
  }
  const params = new URLSearchParams();
  if (eventId) params.set('event', eventId);
  if (source) params.set('source', source);
  const qs = params.toString();
  return `/dashboard/ops/replay${qs ? `?${qs}` : ''}`;
}
