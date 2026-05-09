/**
 * Normalizes common API envelope shapes to a plain array for list endpoints.
 * Backend may return [], { data: [] }, { results: [] }, nested { data: { items: [] } }, etc.
 */
export function extractListPayload(payload: unknown): unknown[] {
  if (Array.isArray(payload)) return payload;
  if (!payload || typeof payload !== 'object') return [];

  const keys = [
    'data',
    'results',
    'items',
    'regions',
    'records',
    'rows',
    'map',
    'features',
    'alerts',
    'risks',
    'values',
    'list',
    'payload',
    'body',
    'content',
    'elements',
    'entries',
  ];

  const o = payload as Record<string, unknown>;
  for (const key of keys) {
    const v = o[key];
    if (Array.isArray(v)) return v;
  }

  const nested = o.data;
  if (nested && typeof nested === 'object' && !Array.isArray(nested)) {
    const inner = nested as Record<string, unknown>;
    for (const key of keys) {
      const v = inner[key];
      if (Array.isArray(v)) return v;
    }
  }

  return [];
}

export function formatScalar(value: unknown): string {
  if (value === null || value === undefined) return 'unknown';
  if (typeof value === 'boolean') return value ? 'ok' : 'degraded';
  return String(value);
}
