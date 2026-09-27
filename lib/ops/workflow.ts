/* ==========================================================================
   The accountability loop — types and role gates.

   State lives on the server (`alert_state`, `action_log`, `audit_log`).
   These helpers only name the machine the API already enforces.
   Jurisdiction is never filtered here.
   ========================================================================== */

export type AlertState = 'new' | 'acknowledged' | 'actioned' | 'closed';

export type ActionType =
  | 'field_team_sent'
  | 'public_warning_issued'
  | 'shelter_opened'
  | 'monitoring_increased'
  | 'other';

export type Outcome = 'flooded' | 'no_flood' | 'unknown';

export type Role = 'viewer' | 'operator' | 'supervisor' | 'admin';

export type ActionEntry = {
  id: string;
  alert_id: string;
  action_type: string;
  note: string | null;
  user_id: number | null;
  created_at: string;
};

export type AlertWorkState = {
  alert_id: string;
  state: AlertState;
  acknowledged_by: string | number | null;
  acknowledged_at: string | null;
  closed_by: string | number | null;
  closed_at: string | null;
  outcome: Outcome | null;
};

export const CAN: Record<Role, { acknowledge: boolean; logAction: boolean; close: boolean }> = {
  viewer: { acknowledge: false, logAction: false, close: false },
  operator: { acknowledge: true, logAction: true, close: false },
  supervisor: { acknowledge: true, logAction: true, close: true },
  admin: { acknowledge: true, logAction: true, close: true },
};

export const ACTION_LABELS: Record<ActionType, string> = {
  field_team_sent: 'Field team sent',
  public_warning_issued: 'Public warning issued',
  shelter_opened: 'Shelter opened',
  monitoring_increased: 'Monitoring increased',
  other: 'Other',
};

export const LOGGABLE_ACTIONS: ActionType[] = [
  'field_team_sent',
  'public_warning_issued',
  'shelter_opened',
  'monitoring_increased',
  'other',
];

export const OUTCOME_LABELS: Record<Outcome, string> = {
  flooded: 'It flooded',
  no_flood: 'It did not flood',
  unknown: 'Could not determine',
};

export const STATE_LABELS: Record<AlertState, string> = {
  new: 'Not yet acknowledged',
  acknowledged: 'Acknowledged',
  actioned: 'Action logged',
  closed: 'Closed',
};

export function asRole(raw: unknown): Role {
  const v = String(raw ?? '').toLowerCase();
  if (v === 'viewer' || v === 'operator' || v === 'supervisor' || v === 'admin') return v;
  return 'viewer';
}

export function asOpsStatus(raw: unknown): AlertState {
  const v = String(raw ?? '').toLowerCase();
  if (v === 'new' || v === 'acknowledged' || v === 'actioned' || v === 'closed') return v;
  return 'new';
}

export function asOutcome(raw: unknown): Outcome | null {
  const v = String(raw ?? '').toLowerCase();
  if (v === 'flooded' || v === 'no_flood' || v === 'unknown') return v;
  return null;
}

export function actionLabel(type: string): string {
  if (type in ACTION_LABELS) return ACTION_LABELS[type as ActionType];
  if (type === 'acknowledged') return 'Acknowledged';
  return type.replace(/_/g, ' ');
}
