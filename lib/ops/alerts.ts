import { asOpsStatus, asOutcome, type AlertState, type Outcome } from '@/lib/ops/workflow';
import { normalizeSeverity, type Severity } from '@/lib/ops/severity';

export type OpsAlert = {
  id: string;
  region: string;
  hazard: 'flood';
  severity: Severity;
  score: number | null;
  issued_at: string;
  message: string | null;
  ops_status: AlertState;
  pipeline_status: string | null;
  acknowledged_at: string | null;
  acknowledged_by: string | number | null;
  closed_at: string | null;
  closed_by: string | number | null;
  outcome: Outcome | null;
};

type RawAlert = Record<string, unknown>;

function str(v: unknown): string | null {
  return typeof v === 'string' && v.trim() ? v : null;
}
function num(v: unknown): number | null {
  return typeof v === 'number' && Number.isFinite(v) ? v : null;
}

const PIPELINE = new Set(['open', 'acked', 'resolved', 'closed']);

export function titleCase(s: string): string {
  return s
    .split(/\s+/)
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1).toLowerCase() : w))
    .join(' ');
}

function byline(v: unknown): string | number | null {
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  if (typeof v === 'string' && v.trim()) return v.trim();
  return null;
}

export function toOpsAlert(r: RawAlert): OpsAlert | null {
  const region = str(r.region) ?? str(r.location);
  if (!region) return null;
  const display = titleCase(region);
  if (display.toLowerCase() === 'odisha') return null;

  const issued = str(r.triggered_at) ?? str(r.timestamp) ?? str(r.last_observed_at) ?? str(r.created_at);
  if (!issued) return null;

  const id = r.id !== undefined && r.id !== null ? String(r.id) : null;
  if (!id) return null;

  const pipeline = str(r.pipeline_status);
  const statusRaw = str(r.ops_status) ?? str(r.status);
  const statusIsPipeline = statusRaw ? PIPELINE.has(statusRaw.toLowerCase()) : false;

  return {
    id,
    region: display,
    hazard: 'flood',
    severity: normalizeSeverity(r.severity),
    score: num(r.rule_score) ?? num(r.risk_score),
    issued_at: issued,
    message: str(r.message),
    ops_status: asOpsStatus(statusIsPipeline ? 'new' : statusRaw),
    pipeline_status: pipeline ?? (statusIsPipeline ? statusRaw : null),
    acknowledged_at: str(r.acknowledged_at),
    acknowledged_by: byline(r.acknowledged_by),
    closed_at: str(r.closed_at),
    closed_by: byline(r.closed_by),
    outcome: asOutcome(r.outcome),
  };
}

export function toOpsAlerts(raw: unknown): OpsAlert[] {
  const rows: RawAlert[] = Array.isArray(raw)
    ? (raw as RawAlert[])
    : ((raw as Record<string, unknown>)?.alerts as RawAlert[]) ?? [];

  return rows
    .map((r) => toOpsAlert(r))
    .filter((a): a is OpsAlert => a !== null)
    .sort((a, b) => b.issued_at.localeCompare(a.issued_at));
}

export function toActionEntries(raw: unknown, alertId: string) {
  const rows = Array.isArray(raw) ? raw : [];
  return rows
    .map((row) => {
      const r = row as Record<string, unknown>;
      const id = r.id !== undefined && r.id !== null ? String(r.id) : '';
      const created = typeof r.created_at === 'string' ? r.created_at : '';
      if (!id || !created) return null;
      return {
        id,
        alert_id: alertId,
        action_type: String(r.action_type ?? ''),
        note: typeof r.note === 'string' && r.note.trim() ? r.note : null,
        user_id: typeof r.user_id === 'number' ? r.user_id : null,
        created_at: created,
      };
    })
    .filter((e): e is NonNullable<typeof e> => e !== null);
}
