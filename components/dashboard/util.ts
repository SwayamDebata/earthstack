export const toArray = <T,>(payload: unknown): T[] => {
  if (Array.isArray(payload)) return payload as T[];
  if (payload && typeof payload === 'object') {
    const obj = payload as Record<string, unknown>;
    if (Array.isArray(obj.data)) return obj.data as T[];
    if (Array.isArray(obj.alerts)) return obj.alerts as T[];
    if (Array.isArray(obj.logs)) return obj.logs as T[];
    if (Array.isArray(obj.results)) return obj.results as T[];
    if (Array.isArray(obj.items)) return obj.items as T[];
  }
  return [];
};

export const num = (v: unknown) => (typeof v === 'number' ? v : typeof v === 'string' ? Number(v) : Number.NaN);
export const numOrNull = (v: unknown): number | null => {
  const n = num(v);
  return Number.isFinite(n) ? n : null;
};

export type SeverityTone = 'critical' | 'warning' | 'nominal' | 'info';

export function severityToTone(s: unknown): SeverityTone {
  const v = String(s ?? '').toLowerCase();
  if (v === 'critical' || v === 'high') return 'critical';
  if (v === 'medium' || v === 'warning' || v === 'warn') return 'warning';
  if (v === 'low' || v === 'normal' || v === 'ok') return 'nominal';
  return 'info';
}

export function relTime(ts: unknown): string {
  const d = ts ? new Date(String(ts)) : null;
  if (!d || Number.isNaN(d.getTime())) return 'n/a';
  const diff = Date.now() - d.getTime();
  if (diff < 0) return 'now';
  const s = Math.floor(diff / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const days = Math.floor(h / 24);
  return `${days}d ago`;
}
