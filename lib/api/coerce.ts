/** Pulls a numeric time-series from API arrays that may be numbers or objects. */
export function extractNumericSeries(value: unknown): number[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((x) => {
      if (typeof x === 'number' && Number.isFinite(x)) return x;
      if (typeof x === 'string') {
        const n = Number(x);
        return Number.isFinite(n) ? n : Number.NaN;
      }
      if (x && typeof x === 'object') {
        const o = x as Record<string, unknown>;
        for (const k of ['value', 'v', 'amount', 'rainfall', 'mm', 'y', 'precip', 'total']) {
          const raw = o[k];
          const n = typeof raw === 'number' ? raw : typeof raw === 'string' ? Number(raw) : Number.NaN;
          if (Number.isFinite(n)) return n;
        }
      }
      return Number.NaN;
    })
    .filter((n) => Number.isFinite(n));
}
