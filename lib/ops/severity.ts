/* ==========================================================================
   Severity, in the vocabulary the customer already reads.

   IMD publishes a four-stage colour warning system that every district officer
   in India reads fluently: Green = no warning, Yellow = be aware, Orange = be
   prepared, Red = take action. We adopt it exactly. The training cost is zero
   and it says we understand their world.

   Two rules this file exists to enforce:

   1. Severity never shares a colour with brand identity. Cyan is ModelEarth's
      logo colour and nothing else; a chip that is cyan tells an officer
      nothing. Brand and signal must not be the same channel.

   2. Severity is never conveyed by colour alone (WCAG 1.4.1). Every severity
      carries a word AND a shape, so it survives greyscale printing, a washed
      out projector, and colour blindness. Government offices print and project
      these screens, so this is not a theoretical concern.
   ========================================================================== */

export type Severity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'UNKNOWN';

/** IMD's own stage names, which is what an officer will say out loud. */
export type ImdStage = 'Red' | 'Orange' | 'Yellow' | 'Green' | 'Unrated';

export type SeverityStyle = {
  key: Severity;
  /** IMD stage this maps to */
  imd: ImdStage;
  /** what the officer should do, in their language */
  action: string;
  /** shape carried alongside colour, so colour is never the only signal */
  glyph: string;
  /** full class list, light plus dark variants. Must stay a literal string:
      Tailwind scans source text and cannot resolve `dark:${expr}`. */
  chip: string;
  /** solid hex for map pins and bars */
  hex: string;
  /** row emphasis for the inbox, light plus dark in one literal */
  row: string;
};

const STYLES: Record<Severity, SeverityStyle> = {
  CRITICAL: {
    key: 'CRITICAL',
    imd: 'Red',
    action: 'Take action',
    glyph: '■',
    chip: 'bg-red-100 text-red-900 ring-1 ring-red-400 dark:bg-red-950 dark:text-red-100 dark:ring-red-500',
    hex: '#c81e1e',
    row: 'border-l-4 border-l-red-600 bg-red-50/70 dark:border-l-red-500 dark:bg-red-950/30',
  },
  HIGH: {
    key: 'HIGH',
    imd: 'Orange',
    action: 'Be prepared',
    glyph: '▲',
    chip: 'bg-orange-100 text-orange-900 ring-1 ring-orange-400 dark:bg-orange-950 dark:text-orange-100 dark:ring-orange-500',
    hex: '#d97706',
    row: 'border-l-4 border-l-orange-500 bg-orange-50/70 dark:border-l-orange-400 dark:bg-orange-950/25',
  },
  MEDIUM: {
    key: 'MEDIUM',
    imd: 'Yellow',
    action: 'Be aware',
    glyph: '●',
    // amber-200 rather than a pale yellow: yellow on white fails contrast
    chip: 'bg-amber-200 text-amber-950 ring-1 ring-amber-500 dark:bg-amber-950 dark:text-amber-100 dark:ring-amber-500',
    hex: '#b45309',
    row: 'border-l-4 border-l-amber-400 bg-amber-50/60 dark:bg-amber-950/20',
  },
  LOW: {
    key: 'LOW',
    imd: 'Green',
    action: 'No warning',
    glyph: '○',
    chip: 'bg-emerald-100 text-emerald-900 ring-1 ring-emerald-400 dark:bg-emerald-950 dark:text-emerald-100 dark:ring-emerald-500',
    hex: '#047857',
    row: 'border-l-4 border-l-emerald-500',
  },
  UNKNOWN: {
    key: 'UNKNOWN',
    imd: 'Unrated',
    // never ship the word "unknown" to a user: say what is actually true
    action: 'Not scored',
    glyph: '–',
    chip: 'bg-slate-100 text-slate-800 ring-1 ring-slate-400 dark:bg-slate-800 dark:text-slate-100 dark:ring-slate-500',
    hex: '#475569',
    row: 'border-l-4 border-l-slate-400 dark:border-l-slate-500',
  },
};

export const SEVERITY_ORDER: Severity[] = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'UNKNOWN'];

export function normalizeSeverity(input: unknown): Severity {
  const v = String(input ?? '').trim().toUpperCase();
  if (v === 'CRITICAL' || v === 'SEVERE') return 'CRITICAL';
  if (v === 'HIGH') return 'HIGH';
  if (v === 'MEDIUM' || v === 'MODERATE' || v === 'WARNING' || v === 'WARN') return 'MEDIUM';
  if (v === 'LOW' || v === 'NORMAL' || v === 'OK') return 'LOW';
  return 'UNKNOWN';
}

export function severity(input: unknown): SeverityStyle {
  return STYLES[normalizeSeverity(input)];
}

/** Does this severity need a person to look at it? */
export function needsAttention(input: unknown): boolean {
  const k = normalizeSeverity(input);
  return k === 'CRITICAL' || k === 'HIGH' || k === 'MEDIUM';
}

/** Rank for sorting an inbox: worst first. */
export function severityRank(input: unknown): number {
  return SEVERITY_ORDER.indexOf(normalizeSeverity(input));
}
