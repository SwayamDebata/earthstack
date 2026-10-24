'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { opsApi } from '@/lib/ops/api';
import { ago } from '@/lib/ops/language';
import { isRiverWatch } from '@/lib/ops/alerts';
import { SeverityChip, StatusLabel, Loading, Unreachable } from '@/components/ops/Bits';
import Evidence from '@/components/ops/Evidence';
import ExternalFeeds from '@/components/ops/ExternalFeeds';
import WeakPoints from '@/components/ops/WeakPoints';
import { useOpsUser } from '@/components/ops/OpsShell';
import { signalSourceOf } from '@/lib/api/risk-status';

export default function PlaceView({ name }: { name: string }) {
  const user = useOpsUser();
  const key = name.toLowerCase();
  const inDistrict =
    user.role === 'admin' || user.jurisdiction.some((n) => n.trim().toLowerCase() === key);
  const isPilot = user.pilot_jurisdiction.some((n) => n.trim().toLowerCase() === key);

  const riskQ = useQuery({
    queryKey: ['ops-risk', name],
    queryFn: () => opsApi.risk(name),
    enabled: inDistrict,
  });
  const explainQ = useQuery({
    queryKey: ['ops-explain', name],
    queryFn: () => opsApi.riskExplain(name),
    enabled: inDistrict,
  });

  const payload = (riskQ.data ?? {}) as Record<string, unknown>;
  const raw = useMemo<Record<string, unknown>>(() => {
    const fromRisk = (payload.raw_data ?? {}) as Record<string, unknown>;
    const fromExplain = ((explainQ.data as Record<string, unknown> | undefined)?.evidence ??
      {}) as Record<string, unknown>;
    return { ...fromExplain, ...fromRisk, location: name };
  }, [payload, explainQ.data, name]);

  const severity = String(payload.severity ?? (explainQ.data as { severity?: string } | undefined)?.severity ?? '');
  const score =
    typeof payload.rule_score === 'number'
      ? payload.rule_score
      : typeof (explainQ.data as { risk_score?: number } | undefined)?.risk_score === 'number'
        ? (explainQ.data as { risk_score: number }).risk_score
        : null;
  const signal = signalSourceOf({ ...payload, ...raw });

  if (!inDistrict) {
    return (
      <div className="ops-panel" style={{ padding: 20 }}>
        <p>{name} is not in this office’s district.</p>
        <Link href="/ops" className="ops-btn" style={{ marginTop: 12, display: 'inline-flex' }}>
          All alerts
        </Link>
      </div>
    );
  }

  if (riskQ.isLoading && explainQ.isLoading) return <Loading label="Loading location" />;
  if (riskQ.isError && explainQ.isError)
    return <Unreachable lastGood={null} onRetry={() => void riskQ.refetch()} />;

  return (
    <div className="ops-stack">
      <Link href="/ops" className="ops-lede ops-no-print" style={{ textDecoration: 'underline' }}>
        All alerts
      </Link>

      <div className="ops-panel" style={{ padding: 16 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
          <h1 className="ops-h1">{name}</h1>
          <SeverityChip
            value={severity}
            showAction
            riverWatch={isRiverWatch({
              tier: isPilot ? 'pilot' : 'live',
              severity,
              signal_source: signal,
              river_ratio: typeof raw.river_ratio === 'number' ? raw.river_ratio : null,
            })}
          />
          {isPilot ? (
            <StatusLabel kind="PILOT" />
          ) : user.role === 'admin' && !user.jurisdiction.some((n) => n.trim().toLowerCase() === key) ? (
            <StatusLabel kind="SHADOW" />
          ) : null}
        </div>
        <p className="ops-lede">
          {riskQ.isSuccess ? `Conditions as of ${ago(riskQ.dataUpdatedAt)}.` : 'Checking conditions.'}
        </p>
        {score !== null ? (
          <p className="ops-mono" style={{ fontSize: 24, fontWeight: 600, margin: '8px 0 0' }}>
            {score.toFixed(2)}{' '}
            <span style={{ fontSize: 12, fontWeight: 400, color: 'var(--ops-muted)' }}>flood score</span>
          </p>
        ) : null}
      </div>

      <div className="ops-panel" style={{ padding: 16 }}>
        <h2 className="ops-h2">Why this reading</h2>
        <div style={{ marginTop: 10 }}>
          <Evidence raw={raw} />
        </div>
      </div>

      <div className="ops-panel" style={{ padding: 16 }}>
        <h2 className="ops-h2">What others are saying</h2>
        <div style={{ marginTop: 10 }}>
          <ExternalFeeds location={name} />
        </div>
      </div>

      <div className="ops-panel" style={{ padding: 16 }}>
        <h2 className="ops-h2">Weak points</h2>
        <div style={{ marginTop: 10 }}>
          <WeakPoints location={name} />
        </div>
      </div>
    </div>
  );
}
