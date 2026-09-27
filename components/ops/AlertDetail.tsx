'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { opsApi } from '@/lib/ops/api';
import { toActionEntries, toOpsAlert } from '@/lib/ops/alerts';
import { ago, dateTime, elapsed } from '@/lib/ops/language';
import {
  actionLabel,
  CAN,
  LOGGABLE_ACTIONS,
  OUTCOME_LABELS,
  STATE_LABELS,
  type ActionType,
  type Outcome,
} from '@/lib/ops/workflow';
import { useOpsUser } from '@/components/ops/OpsShell';
import { SeverityChip, Loading, Unreachable } from '@/components/ops/Bits';
import Evidence from '@/components/ops/Evidence';
import { ApiError } from '@/lib/api/client';

export default function AlertDetail({ alertId }: { alertId: string }) {
  const user = useOpsUser();
  const qc = useQueryClient();
  const [noteType, setNoteType] = useState<ActionType>('field_team_sent');
  const [note, setNote] = useState('');
  const [outcome, setOutcome] = useState<Outcome>('no_flood');
  const [closing, setClosing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const alertQ = useQuery({
    queryKey: ['ops-alert', alertId],
    queryFn: () => opsApi.alert(alertId),
  });
  const actionsQ = useQuery({
    queryKey: ['ops-alert-actions', alertId],
    queryFn: () => opsApi.actions(alertId),
  });

  const alert = useMemo(
    () => (alertQ.data ? toOpsAlert(alertQ.data as Record<string, unknown>) : null),
    [alertQ.data],
  );

  const riskQ = useQuery({
    queryKey: ['ops-risk', alert?.region],
    queryFn: () => opsApi.risk(alert!.region),
    enabled: Boolean(alert?.region),
  });

  const log = useMemo(
    () => toActionEntries(actionsQ.data, alertId),
    [actionsQ.data, alertId],
  );

  const can = CAN[user.role];

  const run = async (fn: () => Promise<unknown>) => {
    setBusy(true);
    setError(null);
    try {
      await fn();
      await Promise.all([
        qc.invalidateQueries({ queryKey: ['ops-alert', alertId] }),
        qc.invalidateQueries({ queryKey: ['ops-alert-actions', alertId] }),
        qc.invalidateQueries({ queryKey: ['ops-alerts'] }),
        qc.invalidateQueries({ queryKey: ['ops-record'] }),
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save.');
    } finally {
      setBusy(false);
    }
  };

  if (alertQ.isLoading) return <Loading label="Loading alert" />;
  if (alertQ.isError) {
    const notHere = alertQ.error instanceof ApiError && alertQ.error.status === 404;
    if (notHere) {
      return (
        <div className="ops-panel" style={{ padding: 20 }}>
          <p>That alert is not in this office’s district.</p>
          <Link href="/ops" className="ops-btn" style={{ marginTop: 12, display: 'inline-flex' }}>
            All alerts
          </Link>
        </div>
      );
    }
    return <Unreachable lastGood={alertQ.dataUpdatedAt || null} onRetry={() => void alertQ.refetch()} />;
  }
  if (!alert) {
    return (
      <div className="ops-panel" style={{ padding: 20 }}>
        <p>That alert is not in the current list.</p>
        <Link href="/ops" className="ops-btn" style={{ marginTop: 12, display: 'inline-flex' }}>
          All alerts
        </Link>
      </div>
    );
  }

  const raw = ((riskQ.data as Record<string, unknown> | undefined)?.raw_data ?? {}) as Record<
    string,
    unknown
  >;
  const who =
    alert.acknowledged_by === user.id
      ? user.full_name
      : alert.acknowledged_by
        ? 'a colleague'
        : null;

  return (
    <div className="ops-stack">
      <Link href="/ops" className="ops-lede ops-no-print" style={{ textDecoration: 'underline' }}>
        All alerts
      </Link>

      <div className="ops-panel" style={{ padding: 16 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'flex-start' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
              <h1 className="ops-h1" style={{ fontSize: 24 }}>
                {alert.region}
              </h1>
              <SeverityChip value={alert.severity} showAction />
            </div>
            <p className="ops-lede">
              Alerted {dateTime(alert.issued_at)} · {elapsed(alert.issued_at)} ago
            </p>
            <p style={{ margin: '4px 0 0', fontWeight: 550 }}>
              {STATE_LABELS[alert.ops_status]}
              {who ? ` · ${who}` : ''}
              {alert.outcome ? ` · ${OUTCOME_LABELS[alert.outcome]}` : ''}
            </p>
          </div>
          {alert.score !== null ? (
            <div style={{ textAlign: 'right' }}>
              <div className="ops-mono" style={{ fontSize: 28, fontWeight: 600 }}>
                {alert.score.toFixed(2)}
              </div>
              <div className="ops-lede">flood score</div>
            </div>
          ) : null}
        </div>
      </div>

      <div className="ops-panel" style={{ padding: 16 }}>
        <h2 className="ops-h2">Why this alert</h2>
        <p className="ops-lede" style={{ marginBottom: 12 }}>
          {riskQ.isLoading
            ? 'Loading conditions.'
            : riskQ.isError
              ? 'Could not load current conditions.'
              : `Conditions as of ${ago(riskQ.dataUpdatedAt)}.`}
        </p>
        {riskQ.isSuccess ? (
          <Evidence raw={raw} />
        ) : riskQ.isLoading ? (
          <Loading label="Loading conditions" />
        ) : (
          <p className="ops-lede">Nothing shown rather than stale numbers.</p>
        )}
        <p className="ops-note" style={{ marginTop: 16 }}>
          These are conditions now, not a snapshot of what the engine saw when this alert fired{' '}
          {ago(alert.issued_at)}. Conditions have changed since.
        </p>
      </div>

      <div className="ops-panel" style={{ padding: 16 }}>
        <h2 className="ops-h2">What you did</h2>
        {error ? <p className="ops-warn">{error}</p> : null}
        {!can.acknowledge ? (
          <p className="ops-lede">This account can read alerts but not record actions.</p>
        ) : (
          <div className="ops-sticky-act">
            <div className="ops-actions">
              {alert.ops_status === 'new' ? (
                <button
                  type="button"
                  className="ops-btn ops-btn-solid"
                  disabled={busy}
                  onClick={() => void run(() => opsApi.acknowledge(alertId))}
                >
                  Acknowledge
                </button>
              ) : null}

              {alert.ops_status !== 'closed' && alert.ops_status !== 'new' ? (
                <>
                  <select
                    className="ops-select"
                    value={noteType}
                    onChange={(e) => setNoteType(e.target.value as ActionType)}
                    aria-label="Action type"
                  >
                    {LOGGABLE_ACTIONS.map((a) => (
                      <option key={a} value={a}>
                        {actionLabel(a)}
                      </option>
                    ))}
                  </select>
                  <textarea
                    className="ops-textarea"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Anything worth recording"
                  />
                  <button
                    type="button"
                    className="ops-btn"
                    disabled={busy}
                    onClick={() =>
                      void run(async () => {
                        await opsApi.addAction(alertId, noteType, note);
                        setNote('');
                      })
                    }
                  >
                    Save action
                  </button>
                </>
              ) : null}

              {alert.ops_status !== 'closed' && alert.ops_status !== 'new' && can.close ? (
                closing ? (
                  <div className="ops-note">
                    <p style={{ fontWeight: 650, margin: '0 0 8px' }}>What actually happened?</p>
                    {(Object.keys(OUTCOME_LABELS) as Outcome[]).map((o) => (
                      <label key={o} style={{ display: 'flex', gap: 8, marginBottom: 6, fontSize: 14 }}>
                        <input
                          type="radio"
                          name="outcome"
                          checked={outcome === o}
                          onChange={() => setOutcome(o)}
                        />
                        {OUTCOME_LABELS[o]}
                      </label>
                    ))}
                    <div className="ops-btn-row" style={{ marginTop: 8 }}>
                      <button
                        type="button"
                        className="ops-btn ops-btn-solid"
                        disabled={busy}
                        onClick={() =>
                          void run(async () => {
                            await opsApi.close(alertId, outcome);
                            setClosing(false);
                          })
                        }
                      >
                        Close alert
                      </button>
                      <button type="button" className="ops-btn" onClick={() => setClosing(false)}>
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button type="button" className="ops-btn" onClick={() => setClosing(true)}>
                    Close with outcome
                  </button>
                )
              ) : null}

              {alert.ops_status === 'new' ? (
                <p className="ops-lede">Acknowledge first. Then you can log an action or close with an outcome.</p>
              ) : null}
            </div>
          </div>
        )}
      </div>

      <div className="ops-panel" style={{ padding: 16 }}>
        <h2 className="ops-h2">Record</h2>
        {actionsQ.isLoading ? (
          <Loading label="Loading record" />
        ) : log.length === 0 ? (
          <p className="ops-lede">Nobody has logged an action on this alert yet.</p>
        ) : (
          <ol className="ops-tl">
            {log.map((e) => (
              <li key={e.id}>
                <div style={{ fontWeight: 650 }}>{actionLabel(e.action_type)}</div>
                <div className="ops-lede">
                  {e.user_id === user.id ? user.full_name : 'A colleague'} · {dateTime(e.created_at)}
                </div>
                {e.note ? <div style={{ marginTop: 4 }}>{e.note}</div> : null}
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}
