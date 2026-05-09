'use client';

import { useEffect, useState } from 'react';
import { useQueries } from '@tanstack/react-query';
import { api } from '@/lib/api/endpoints';
import { getTimestampCandidate } from '@/lib/api/client';
import { LOCATIONS, POLLING_INTERVALS, STALE_THRESHOLDS_MS } from '@/lib/config';
import DataState from '@/components/system/DataState';
import StatusBadge from '@/components/system/StatusBadge';

type Initial = {
  healthStatus?: string;
  freshestTimestamp?: string | null;
};

function toAlertsArray(payload: unknown): Array<Record<string, unknown>> {
  if (Array.isArray(payload)) return payload as Array<Record<string, unknown>>;
  if (payload && typeof payload === 'object') {
    const obj = payload as Record<string, unknown>;
    if (Array.isArray(obj.alerts)) return obj.alerts as Array<Record<string, unknown>>;
    if (Array.isArray(obj.data)) return obj.data as Array<Record<string, unknown>>;
  }
  return [];
}

function toRiskMapArray(payload: unknown): Array<Record<string, unknown>> {
  if (Array.isArray(payload)) return payload as Array<Record<string, unknown>>;
  if (payload && typeof payload === 'object') {
    const obj = payload as Record<string, unknown>;
    if (Array.isArray(obj.data)) return obj.data as Array<Record<string, unknown>>;
  }
  return [];
}

const toNum = (value: unknown): number => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') return Number(value);
  return Number.NaN;
};

export default function MarketingLive({ initial }: { initial?: Initial }) {
  const [nowMs, setNowMs] = useState<number>(new Date().getTime());
  const [health, alerts, riskMap] = useQueries({
    queries: [
      { queryKey: ['health'], queryFn: () => api.health(), refetchInterval: POLLING_INTERVALS.health },
      { queryKey: ['alerts', true], queryFn: () => api.alerts(true, 20), refetchInterval: POLLING_INTERVALS.alerts },
      { queryKey: ['risk-map'], queryFn: () => api.riskMap(), refetchInterval: POLLING_INTERVALS.map },
    ],
  });

  useEffect(() => {
    const timer = window.setInterval(() => setNowMs(new Date().getTime()), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  if (health.isLoading && alerts.isLoading && riskMap.isLoading) {
    return <DataState state="loading" title="Bootstrapping live systems" description="Connecting to EarthStack intelligence APIs." />;
  }

  const hasError = [health, alerts, riskMap].some((q) => q.isError);
  if (hasError) {
    return (
      <DataState
        state="error"
        title="Partial data outage"
        description="Some intelligence services are unavailable. Retry to rehydrate live modules."
        onRetry={() => {
          void health.refetch();
          void alerts.refetch();
          void riskMap.refetch();
        }}
      />
    );
  }

  const alertsList = toAlertsArray(alerts.data);
  const riskMapList = toRiskMapArray(riskMap.data);

  const activeAlerts = alertsList.filter((a) => a.active !== false).length;
  const riskScores = riskMapList.map((item) => toNum(item.final_score ?? item.risk_score)).filter((n) => Number.isFinite(n));

  const avgRisk = riskScores.length > 0 ? riskScores.reduce((a, b) => a + b, 0) / riskScores.length : null;
  const mediumHigh = riskMapList.filter((item) => {
    const sev = String(item.severity ?? '').toLowerCase();
    return sev === 'medium' || sev === 'high' || sev === 'critical';
  }).length;

  const keyDistricts = LOCATIONS.map((location) => {
    const match = riskMapList.find((item) => String(item.location ?? '').toLowerCase() === location.toLowerCase());
    return {
      location,
      severity: String(match?.severity ?? 'unknown'),
      score: toNum(match?.final_score ?? match?.risk_score),
    };
  });

  const fromEndpoints = [health.data, alerts.data, riskMap.data]
    .map((item) => getTimestampCandidate(item))
    .filter(Boolean) as string[];
  const freshestTimestamp = fromEndpoints[0] ?? initial?.freshestTimestamp ?? null;

  const healthStatus = String((health.data as { status?: string } | undefined)?.status ?? initial?.healthStatus ?? 'unknown');
  const stale = freshestTimestamp ? nowMs - new Date(freshestTimestamp).getTime() > STALE_THRESHOLDS_MS.risk : true;

  return (
    <section className="space-y-6" aria-label="Live system intelligence">
      <div className="flex flex-wrap items-center gap-3">
        <StatusBadge label={`System ${healthStatus}`} tone={healthStatus.toLowerCase() === 'ok' ? 'success' : 'warning'} />
        <StatusBadge label={stale ? 'Data stale' : 'Data fresh'} tone={stale ? 'warning' : 'success'} />
        <p className="text-sm text-slate-300">Last refresh: {freshestTimestamp ? new Date(freshestTimestamp).toLocaleString() : 'Unavailable'}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <article className="rounded-xl border border-white/10 bg-slate-900/70 p-4"><p className="text-xs text-slate-400">Active alerts</p><p className="text-2xl font-semibold mt-1">{activeAlerts}</p></article>
        <article className="rounded-xl border border-white/10 bg-slate-900/70 p-4"><p className="text-xs text-slate-400">Avg risk snapshot</p><p className="text-2xl font-semibold mt-1">{avgRisk === null ? 'N/A' : avgRisk.toFixed(1)}</p></article>
        <article className="rounded-xl border border-white/10 bg-slate-900/70 p-4"><p className="text-xs text-slate-400">Medium/High regions</p><p className="text-2xl font-semibold mt-1">{mediumHigh}</p></article>
        <article className="rounded-xl border border-white/10 bg-slate-900/70 p-4"><p className="text-xs text-slate-400">Monitored districts</p><p className="text-2xl font-semibold mt-1">{LOCATIONS.length}</p></article>
      </div>

      <div className="rounded-xl border border-white/10 bg-slate-900/50 p-4">
        <h3 className="text-sm font-semibold">Key district risk</h3>
        <div className="mt-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {keyDistricts.map((district) => (
            <div key={district.location} className="rounded-lg border border-white/10 p-3">
              <p className="text-sm text-slate-200">{district.location}</p>
              <p className="text-xs text-slate-400 mt-1">Severity: {district.severity}</p>
              <p className="text-xs text-slate-400">Score: {Number.isFinite(district.score) ? district.score.toFixed(1) : 'N/A'}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
