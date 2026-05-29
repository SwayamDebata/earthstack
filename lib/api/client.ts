import { ZodSchema } from 'zod';
import { API_BASE_URL } from '@/lib/config';

export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public endpoint?: string,
    public details?: unknown,
  ) {
    super(message);
  }
}

export type RequestOptions = {
  signal?: AbortSignal;
  cache?: RequestCache;
  next?: NextFetchRequestConfig;
  method?: 'GET' | 'POST';
  body?: unknown;
};

function getRuntimeApiBase() {
  return typeof window === 'undefined' ? API_BASE_URL : '/api/proxy';
}

export function logApiError(error: unknown, context: { endpoint: string; widget?: string }) {
  const message = error instanceof Error ? error.message : 'Unknown API error';
  const payload: Record<string, unknown> = { ...context, message };
  if (error instanceof ApiError && error.details !== undefined) {
    payload.details = error.details;
  }
  console.error('[EarthStack API Error]', payload);
}

export async function apiRequest<T>(
  endpoint: string,
  schema: ZodSchema<T>,
  options: RequestOptions = {},
): Promise<T> {
  const base = getRuntimeApiBase();
  const url = `${base}${endpoint}`;
  const startedAt = performance.now();

  try {
    const headers: Record<string, string> = { Accept: 'application/json' };
    if (options.body !== undefined) {
      headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(url, {
      method: options.method ?? 'GET',
      headers,
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
      signal: options.signal,
      cache: options.cache,
      next: options.next,
    });

    const latency = performance.now() - startedAt;

    if (!response.ok) {
      const errText = await response.text();
      let details: unknown = errText.length > 800 ? `${errText.slice(0, 800)}…` : errText;
      let msg = `Request failed: ${response.status}`;
      try {
        const j = JSON.parse(errText) as Record<string, unknown>;
        if (j && typeof j === 'object' && j.error === 'UPSTREAM_UNAVAILABLE') {
          const code = j.code !== undefined ? ` [${String(j.code)}]` : '';
          const hint = j.hint !== undefined ? ` - ${String(j.hint)}` : '';
          msg = `Proxy could not reach API${code}: ${String(j.message ?? 'fetch failed')}. Target: ${String(j.target ?? 'unknown')}${hint}`;
          details = j;
        } else if (j.detail !== undefined) {
          if (typeof j.detail === 'string') {
            msg = j.detail;
          } else if (Array.isArray(j.detail)) {
            msg =
              j.detail
                .map((item: unknown) => {
                  if (!item || typeof item !== 'object' || !('msg' in item)) return null;
                  const row = item as { loc?: unknown[]; msg?: unknown };
                  const path = Array.isArray(row.loc) ? row.loc.join('.') : '';
                  return path ? `${path}: ${String(row.msg)}` : String(row.msg);
                })
                .filter(Boolean)
                .join(' · ') || 'Validation failed';
          } else {
            msg = JSON.stringify(j.detail);
          }
          details = j;
        }
      } catch {
        /* not JSON */
      }
      throw new ApiError(msg, response.status, endpoint, details);
    }

    const text = await response.text();
    let raw: unknown;
    try {
      raw = text.length ? JSON.parse(text) : {};
    } catch {
      throw new ApiError('Response is not valid JSON', response.status, endpoint, text.slice(0, 300));
    }

    const parsed = schema.safeParse(raw);

    if (!parsed.success) {
      throw new ApiError('Invalid API response shape', response.status, endpoint, parsed.error.flatten());
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('earthstack:latency', { detail: { endpoint, latency } }));
    }

    return parsed.data;
  } catch (error) {
    logApiError(error, { endpoint });
    throw error;
  }
}

export function getTimestampCandidate(payload: unknown): string | null {
  if (!payload || typeof payload !== 'object') return null;
  const item = payload as Record<string, unknown>;

  const candidates = [
    item.timestamp,
    item.updated_at,
    item.created_at,
    item.last_updated,
    item.time,
  ];

  for (const candidate of candidates) {
    if (typeof candidate === 'string') return candidate;
    if (typeof candidate === 'number') return new Date(candidate).toISOString();
  }

  return null;
}
