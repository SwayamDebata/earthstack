import { ZodSchema } from 'zod';
import { API_BASE_URL } from '@/lib/config';
import { clearOpsSession, getAccessToken, refreshOpsSession } from '@/lib/ops/session';

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
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH';
  body?: unknown;
  /** Flood Ops only. Mission Control must never set this — a token on /alerts
      switches that route from pipeline OPEN/RESOLVED to per-org ops_status. */
  auth?: boolean;
  accept?: string;
  _retried?: boolean;
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

function parseErrorMessage(status: number, errText: string): { msg: string; details: unknown } {
  let details: unknown = errText.length > 800 ? `${errText.slice(0, 800)}…` : errText;
  let msg = `Request failed: ${status}`;
  try {
    const j = JSON.parse(errText) as Record<string, unknown>;
    if (j && typeof j === 'object' && j.error === 'UPSTREAM_UNAVAILABLE') {
      const code = j.code !== undefined ? ` [${String(j.code)}]` : '';
      const hint = j.hint !== undefined ? ` - ${String(j.hint)}` : '';
      msg = `Proxy could not reach API${code}: ${String(j.message ?? 'fetch failed')}. Target: ${String(j.target ?? 'unknown')}${hint}`;
      details = j;
    } else if (j.detail !== undefined) {
      if (typeof j.detail === 'string') {
        msg =
          j.detail === 'invalid_credentials'
            ? 'Email or password is wrong.'
            : j.detail === 'token_expired' || j.detail === 'invalid_token' || j.detail === 'invalid_refresh'
              ? 'Session expired. Sign in again.'
              : j.detail === 'alert_not_found'
                ? 'That alert is not in this office’s district.'
                : j.detail === 'acknowledge_first'
                  ? 'Acknowledge the alert before recording an action or closing it.'
                  : j.detail === 'already_closed'
                    ? 'This alert is already closed.'
                    : j.detail === 'insufficient_role'
                      ? 'This account cannot do that.'
                      : j.detail;
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
  return { msg, details };
}

async function rawFetch(endpoint: string, options: RequestOptions = {}): Promise<Response> {
  const base = getRuntimeApiBase();
  const url = `${base}${endpoint}`;
  const headers: Record<string, string> = {
    Accept: options.accept ?? 'application/json',
  };
  if (options.body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }
  if (options.auth) {
    const token = getAccessToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    method: options.method ?? 'GET',
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    signal: options.signal,
    cache: options.cache,
    next: options.next,
  });

  if (response.status === 401 && options.auth && !options._retried && typeof window !== 'undefined') {
    const ok = await refreshOpsSession();
    if (ok) return rawFetch(endpoint, { ...options, _retried: true });
    clearOpsSession();
  }

  return response;
}

export async function apiRequest<T>(
  endpoint: string,
  schema: ZodSchema<T>,
  options: RequestOptions = {},
): Promise<T> {
  const startedAt = performance.now();

  try {
    const response = await rawFetch(endpoint, options);
    const latency = performance.now() - startedAt;

    if (!response.ok) {
      const errText = await response.text();
      const { msg, details } = parseErrorMessage(response.status, errText);
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

export async function apiBlob(endpoint: string, options: RequestOptions = {}): Promise<Blob> {
  const response = await rawFetch(endpoint, { ...options, accept: options.accept ?? '*/*' });
  if (!response.ok) {
    const errText = await response.text();
    const { msg, details } = parseErrorMessage(response.status, errText);
    throw new ApiError(msg, response.status, endpoint, details);
  }
  return response.blob();
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
