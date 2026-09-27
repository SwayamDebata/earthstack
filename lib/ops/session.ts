/** Browser token store for Flood Ops. MCC never reads these keys. */

const ACCESS_KEY = 'modelearth:ops:access';
const REFRESH_KEY = 'modelearth:ops:refresh';

export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage.getItem(ACCESS_KEY);
  } catch {
    return null;
  }
}

export function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage.getItem(REFRESH_KEY);
  } catch {
    return null;
  }
}

export function setOpsTokens(access: string, refresh: string) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(ACCESS_KEY, access);
  window.localStorage.setItem(REFRESH_KEY, refresh);
}

export function clearOpsSession() {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(ACCESS_KEY);
    window.localStorage.removeItem(REFRESH_KEY);
  } catch {
    /* private mode */
  }
  window.dispatchEvent(new CustomEvent('modelearth:ops:unauthorized'));
}

type TokenPair = {
  access_token: string;
  refresh_token: string;
};

async function postAuth(path: string, body: unknown): Promise<TokenPair> {
  const response = await fetch(`/api/proxy${path}`, {
    method: 'POST',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    cache: 'no-store',
  });
  const text = await response.text();
  let json: Record<string, unknown> = {};
  try {
    json = text ? (JSON.parse(text) as Record<string, unknown>) : {};
  } catch {
    /* not json */
  }
  if (!response.ok) {
    const detail = json.detail;
    const msg =
      typeof detail === 'string'
        ? detail
        : response.status === 401
          ? 'Email or password is wrong.'
          : `Sign-in failed (${response.status})`;
    throw new Error(msg);
  }
  const access = typeof json.access_token === 'string' ? json.access_token : '';
  const refresh = typeof json.refresh_token === 'string' ? json.refresh_token : '';
  if (!access || !refresh) throw new Error('Sign-in did not return tokens.');
  setOpsTokens(access, refresh);
  return { access_token: access, refresh_token: refresh };
}

export async function loginOps(email: string, password: string): Promise<void> {
  await postAuth('/auth/login', { email: email.trim(), password });
}

let refreshInFlight: Promise<boolean> | null = null;

export async function refreshOpsSession(): Promise<boolean> {
  if (refreshInFlight) return refreshInFlight;
  refreshInFlight = (async () => {
    const refresh = getRefreshToken();
    if (!refresh) return false;
    try {
      await postAuth('/auth/refresh', { refresh_token: refresh });
      return true;
    } catch {
      clearOpsSession();
      return false;
    }
  })();
  try {
    return await refreshInFlight;
  } finally {
    refreshInFlight = null;
  }
}
