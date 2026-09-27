'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { opsApi } from '@/lib/ops/api';
import { toOpsAlerts, type OpsAlert } from '@/lib/ops/alerts';
import { dateTime } from '@/lib/ops/language';
import { OUTCOME_LABELS, type Outcome } from '@/lib/ops/workflow';
import { useOpsUser } from '@/components/ops/OpsShell';
import { SeverityChip, Empty, Loading, Unreachable } from '@/components/ops/Bits';

const MIN_N_FOR_RATE = 10;

export default function OpsRecord() {
  const user = useOpsUser();

  const recordQ = useQuery({
    queryKey: ['ops-record'],
    queryFn: () => opsApi.record(50),
    refetchInterval: 120_000,
  });

  const rows = useMemo(() => {
    const alerts = toOpsAlerts(recordQ.data);
    return alerts
      .filter((a) => a.ops_status === 'closed')
      .sort((a, b) => (b.closed_at ?? '').localeCompare(a.closed_at ?? ''));
  }, [recordQ.data]);

  const n = rows.length;
  const flooded = rows.filter((r) => r.outcome === 'flooded').length;
  const noFlood = rows.filter((r) => r.outcome === 'no_flood').length;
  const undetermined = n - flooded - noFlood;

  return (
    <div className="ops-stack">
      <div>
        <h1 className="ops-h1">What {user.org_name} did</h1>
        <p className="ops-lede">Closed alerts, what was done, and what actually happened.</p>
      </div>

      <div className="ops-panel" style={{ padding: 16 }}>
        <h2 className="ops-h2">Closed alerts</h2>
        {recordQ.isLoading ? (
          <Loading label="Loading the record" />
        ) : recordQ.isError ? (
          <Unreachable lastGood={recordQ.dataUpdatedAt || null} onRetry={() => void recordQ.refetch()} />
        ) : n === 0 ? (
          <p className="ops-lede">
            No alert has been closed yet. Closing records what actually happened, which is what makes
            this page worth reading later.
          </p>
        ) : (
          <>
            <div className="ops-statrow">
              <div>
                <strong>{n}</strong>
                <span>closed</span>
              </div>
              <div>
                <strong>{flooded}</strong>
                <span>did flood</span>
              </div>
              <div>
                <strong>{noFlood}</strong>
                <span>did not flood</span>
              </div>
              {undetermined > 0 ? (
                <div>
                  <strong>{undetermined}</strong>
                  <span>could not determine</span>
                </div>
              ) : null}
            </div>
            <p className="ops-lede" style={{ marginTop: 12 }}>
              {n < MIN_N_FOR_RATE
                ? `Counts, not a rate. With n = ${n} there are not enough closings to quote a percentage.`
                : `Based on n = ${n} closed alerts recorded by this office.`}
            </p>
          </>
        )}
      </div>

      <div className="ops-panel">
        <div className="ops-toolbar">
          <span className="ops-h2" style={{ margin: 0 }}>
            Closed, most recent first
          </span>
        </div>
        {rows.length === 0 ? (
          <Empty title="Nothing has been closed yet." lastChecked={recordQ.dataUpdatedAt} />
        ) : (
          <ul className="ops-list">
            {rows.map((alert: OpsAlert) => (
              <li key={alert.id} style={{ padding: '12px 14px' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
                  <Link href={`/ops/alerts/${encodeURIComponent(alert.id)}`} className="ops-item-name">
                    {alert.region}
                  </Link>
                  <SeverityChip value={alert.severity} size="sm" />
                  <span className="ops-status">
                    {alert.outcome ? OUTCOME_LABELS[alert.outcome as Outcome] : 'No outcome'}
                  </span>
                </div>
                <p className="ops-lede">
                  Alerted {dateTime(alert.issued_at)}.{' '}
                  {alert.closed_at ? `Closed ${dateTime(alert.closed_at)}` : 'Closed'}.
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
