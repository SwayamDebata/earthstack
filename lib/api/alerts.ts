/** Normalize alert fields across API shape variants. */

export function getAlertId(alert: Record<string, unknown>): number | null {
  const id = alert.id;
  if (typeof id === 'number' && Number.isFinite(id)) return id;
  if (typeof id === 'string') {
    const n = Number(id);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

export function getAlertRegion(alert: Record<string, unknown>): string {
  const raw = alert.region ?? alert.location;
  return raw !== undefined && raw !== null ? String(raw) : 'n/a';
}

export function isAlertOpen(alert: Record<string, unknown>): boolean {
  if (typeof alert.status === 'string') return alert.status.toUpperCase() === 'OPEN';
  if (typeof alert.active === 'boolean') return alert.active;
  return false;
}

export function getAlertDeliveryStatus(alert: Record<string, unknown>): string {
  if (alert.delivery_status !== undefined && alert.delivery_status !== null) {
    return String(alert.delivery_status);
  }
  if (typeof alert.sent === 'boolean') return alert.sent ? 'sent' : 'pending';
  return 'n/a';
}

export type NotifyProvider = 'twilio_whatsapp' | 'telegram' | 'simulation';

export type AlertContactChannel = 'whatsapp' | 'telegram';

export type CreateAlertContactPayload = {
  name: string;
  phone_e164: string;
  channel: AlertContactChannel;
  role?: string;
  locations?: string[];
  enabled?: boolean;
};

export type NotifyAlertPayload = {
  contact_ids?: number[];
  provider?: NotifyProvider;
};

export type TestWhatsAppPayload = {
  phone_e164: string;
  region?: string;
  severity?: string;
  risk_score?: number;
  details?: string;
};

export function parseApiErrorMessage(error: unknown): string {
  const formatDetail = (detail: unknown): string | null => {
    if (typeof detail === 'string') return detail;
    if (Array.isArray(detail)) {
      const parts = detail
        .map((item) => {
          if (!item || typeof item !== 'object' || !('msg' in item)) return null;
          const row = item as { loc?: unknown[]; msg?: unknown };
          const path = Array.isArray(row.loc) ? row.loc.join('.') : '';
          return path ? `${path}: ${String(row.msg)}` : String(row.msg);
        })
        .filter(Boolean);
      return parts.length ? parts.join(' · ') : null;
    }
    return null;
  };

  if (error instanceof Error) {
    if ('details' in error && error.details && typeof error.details === 'object') {
      const formatted = formatDetail((error.details as Record<string, unknown>).detail);
      if (formatted) return formatted;
    }
    try {
      const parsed = JSON.parse(error.message) as unknown;
      const formatted = formatDetail(parsed);
      if (formatted) return formatted;
    } catch {
      /* not JSON */
    }
    return error.message;
  }
  return 'Request failed';
}
