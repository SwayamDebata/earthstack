export const PILOT_ACCESS_KEY = 'modelearth:pilot-access';
export const PILOT_REQUEST_KEY = 'modelearth:pilot-request';
export const WELCOME_SEEN_KEY = 'modelearth:preview-welcome-seen';
export const ENGAGEMENT_PROMPT_KEY = 'modelearth:engagement-prompt-seen';

export type PilotRequestPayload = {
  name: string;
  organization: string;
  email: string;
  region: string;
  useCase: string;
  submittedAt: string;
};

export type AccessTier = 'preview' | 'pilot';

/** Routes open in public preview (operational trust surface). */
export const PREVIEW_ALLOWED_PREFIXES = ['/dashboard/ops'] as const;

/** Routes that require pilot access. */
export const PILOT_ONLY_PREFIXES = [
  '/dashboard/settings',
  '/dashboard/ml',
  '/dashboard/replay',
  '/dashboard/risk',
  '/dashboard/rainfall',
  '/dashboard/forecast',
  '/dashboard/climate',
  '/dashboard/predict',
] as const;

export function isPilotOnlyPath(pathname: string): boolean {
  if (pathname === '/dashboard') return true;
  return PILOT_ONLY_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

export function isPreviewAllowedPath(pathname: string): boolean {
  if (pathname.startsWith('/dashboard/ops')) return true;
  if (pathname === '/dashboard/alerts') return true;
  return false;
}

export function readPilotAccess(): boolean {
  if (typeof window === 'undefined') return false;
  if (process.env.NEXT_PUBLIC_PILOT_DEV_UNLOCK === 'true') return true;
  return window.localStorage.getItem(PILOT_ACCESS_KEY) === '1';
}

export function grantPilotAccess(): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(PILOT_ACCESS_KEY, '1');
}

export function savePilotRequest(payload: Omit<PilotRequestPayload, 'submittedAt'>): PilotRequestPayload {
  const record: PilotRequestPayload = { ...payload, submittedAt: new Date().toISOString() };
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(PILOT_REQUEST_KEY, JSON.stringify(record));
  }
  return record;
}

export function readPilotRequest(): PilotRequestPayload | null {
  if (typeof window === 'undefined') return null;
  const raw = window.localStorage.getItem(PILOT_REQUEST_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as PilotRequestPayload;
  } catch {
    return null;
  }
}

export function verifyUnlockCode(code: string): boolean {
  const expected = process.env.NEXT_PUBLIC_PILOT_UNLOCK_CODE?.trim();
  if (!expected) return false;
  return code.trim() === expected;
}
