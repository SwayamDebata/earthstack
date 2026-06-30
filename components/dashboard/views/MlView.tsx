'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CartesianGrid, Legend as ReLegend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { RefreshCw } from 'lucide-react';
import { api } from '@/lib/api/endpoints';
import { POLLING_INTERVALS, withJitter } from '@/lib/config';
import { useMission } from '@/components/dashboard/MissionContext';
import HudFrame from '@/components/dashboard/HudFrame';
import StatusLed from '@/components/dashboard/StatusLed';
import RegionChips from '@/components/dashboard/RegionChips';
import BacktestCard from '@/components/dashboard/ml/BacktestCard';
import StatTile from '@/components/dashboard/StatTile';
import { PageTitle, ErrorBlock, EmptyBlock, Telemetry, Legend } from '@/components/dashboard/Atoms';
import { useDashboardUiMode } from '@/lib/ui/use-dashboard-ui-mode';
import { btnSecondary, chartAxisStroke, chartGridStroke, chartTooltip, listRow, severityBadge } from '@/lib/ui/standard-surface';
import { num, numOrNull, relTime, toArray } from '@/components/dashboard/util';

export default function MlView() {
  const { location } = useMission();
  const mode = useDashboardUiMode();
  const std = mode === 'standard';

  const logsQ = useQuery({
    queryKey: ['ml-logs', location, 100],
    queryFn: () => api.mlInferenceLogs(location, 100),
    refetchInterval: () => withJitter(POLLING_INTERVALS.mlLogs),
  });
  const debugQ = useQuery({
    queryKey: ['debug-risk', location],
    queryFn: () => api.debugRisk(location),
    refetchInterval: () => withJitter(POLLING_INTERVALS.risk),
  });

  const logs = useMemo(() => toArray<Record<string, unknown>>(logsQ.data), [logsQ.data]);

  const series = useMemo(
    () =>
      logs
        .slice(0, 60)
        .map((l, i) => ({
          t: i + 1,
          rule: numOrNull(l.rule_score),
          ml: numOrNull(l.ml_score),
          final: numOrNull(l.final_score),
        }))
        .reverse(),
    [logs],
  );

  const summary = useMemo(() => {
    const scores = { rule: 0, ml: 0, final: 0, n: 0, agree: 0, divergent: 0, shadow: 0 };
    logs.forEach((l) => {
      const r = num(l.rule_score);
      const m = num(l.ml_score);
      const f = num(l.final_score);
      if (Number.isFinite(r) && Number.isFinite(m) && Number.isFinite(f)) {
        scores.n += 1;
        scores.rule += r;
        scores.ml += m;
        scores.final += f;
        if (Math.abs(r - m) < 0.1) scores.agree += 1;
        else scores.divergent += 1;
      }
      if (l.shadow_mode) scores.shadow += 1;
    });
    return {
      rule: scores.n ? scores.rule / scores.n : null,
      ml: scores.n ? scores.ml / scores.n : null,
      final: scores.n ? scores.final / scores.n : null,
      agree: scores.agree,
      divergent: scores.divergent,
      shadow: scores.shadow,
      total: logs.length,
    };
  }, [logs]);

  return (
    <div className="space-y-3 p-3">
      <PageTitle eyebrow="ML Observability" title="Model Telemetry & Shadow-Mode Audit">
        <RegionChips />
        <button
          type="button"
          onClick={() => {
            void logsQ.refetch();
            void debugQ.refetch();
          }}
          className={btnSecondary(mode)}
        >
          <RefreshCw size={11} /> RESYNC
        </button>
      </PageTitle>

      <BacktestCard />

      {/* Summary tiles */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
        <StatTile label="LOGS" value={String(summary.total)} tone="info" size="sm" valueSize="lg" />
        <StatTile label="AVG RULE" value={summary.rule !== null ? summary.rule.toFixed(2) : 'n/a'} tone="info" size="sm" valueSize="lg" />
        <StatTile label="AVG ML" value={summary.ml !== null ? summary.ml.toFixed(2) : 'n/a'} tone="info" size="sm" valueSize="lg" />
        <StatTile label="AVG FINAL" value={summary.final !== null ? summary.final.toFixed(2) : 'n/a'} tone="info" size="sm" valueSize="lg" />
        <StatTile label="AGREE" value={String(summary.agree)} tone="nominal" size="sm" valueSize="lg" />
        <StatTile label="DIVERGENT" value={String(summary.divergent)} tone={summary.divergent > 0 ? 'warning' : 'idle'} size="sm" valueSize="lg" />
        <StatTile label="SHADOW" value={String(summary.shadow)} tone="info" size="sm" valueSize="lg" />
      </div>

      {/* Inference timeline */}
      <HudFrame
        label="INFERENCE TIMELINE"
        subtitle={`/ml/inference/logs · ${location}`}
        status={logsQ.isError ? 'critical' : 'info'}
        statusText={logsQ.isLoading ? 'SYNC' : `${series.length}`}
      >
        {logsQ.isError ? (
          <ErrorBlock onRetry={() => void logsQ.refetch()} message="ml logs endpoint failed" />
        ) : series.length === 0 ? (
          <EmptyBlock message="no inference data yet" />
        ) : (
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={series} margin={{ top: 6, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="2 4" stroke={chartGridStroke(mode)} />
                <XAxis dataKey="t" stroke={chartAxisStroke(mode)} tick={{ fontSize: 10, fontFamily: std ? 'inherit' : 'monospace' }} />
                <YAxis stroke={chartAxisStroke(mode)} tick={{ fontSize: 10, fontFamily: std ? 'inherit' : 'monospace' }} width={32} />
                <Tooltip {...chartTooltip(mode)} />
                <ReLegend wrapperStyle={{ fontSize: 10, fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: 1 }} />
                <Line type="monotone" dataKey="rule" stroke="#22d3ee" strokeWidth={1.4} dot={false} />
                <Line type="monotone" dataKey="ml" stroke="#a78bfa" strokeWidth={1.4} dot={false} />
                <Line type="monotone" dataKey="final" stroke="#f59e0b" strokeWidth={1.6} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
        <Legend
          items={[
            { color: '#22d3ee', label: 'RULE' },
            { color: '#a78bfa', label: 'ML' },
            { color: '#f59e0b', label: 'FINAL' },
          ]}
        />
      </HudFrame>

      {/* Logs feed + debug */}
      <div className="grid grid-cols-1 gap-3 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <HudFrame label="INFERENCE LOG" subtitle="/ml/inference/logs" status="info" statusText={`${logs.length}`}>
            {logs.length === 0 ? (
              <EmptyBlock message="no inference logs in window" />
            ) : (
              <div className="max-h-[420px] space-y-1 overflow-auto pr-1 font-mono text-[10px]">
                {logs.map((l, idx) => {
                  const r = numOrNull(l.rule_score);
                  const m = numOrNull(l.ml_score);
                  const f = numOrNull(l.final_score);
                  const divergent = r !== null && m !== null && Math.abs(r - m) >= 0.1;
                  const shadow = Boolean(l.shadow_mode);
                  return (
                    <div key={String(l.id ?? idx)} className={`grid grid-cols-[44px_1fr_auto_auto] items-center gap-2 ${listRow(mode)}`}>
                      <span className={std ? 'text-xs text-slate-500' : 'text-slate-500'}>#{String(idx + 1).padStart(3, '0')}</span>
                      <div className={`flex flex-wrap items-center gap-2 ${std ? 'text-sm text-slate-800' : 'text-cyan-100/80'}`}>
                        <span><span className="text-slate-500">rule</span>={r !== null ? r.toFixed(2) : 'n/a'}</span>
                        <span><span className="text-slate-500">ml</span>={m !== null ? m.toFixed(2) : 'n/a'}</span>
                        <span><span className="text-slate-500">final</span>={f !== null ? f.toFixed(2) : 'n/a'}</span>
                        <span className="text-slate-500">{relTime(l.timestamp ?? l.created_at)}</span>
                      </div>
                      {divergent ? (
                        <span className={severityBadge('warning', mode)}>divergent</span>
                      ) : (
                        <span />
                      )}
                      <span className={severityBadge(shadow ? 'info' : 'nominal', mode)}>{shadow ? 'shadow' : 'live'}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </HudFrame>
        </div>

        <HudFrame label="DEBUG · RISK INTERNALS" subtitle={`/debug/risk · ${location}`} status={debugQ.isError ? 'critical' : 'info'} statusText={debugQ.isLoading ? 'SYNC' : 'LIVE'}>
          {debugQ.isError ? (
            <ErrorBlock onRetry={() => void debugQ.refetch()} message="debug endpoint failed" />
          ) : !debugQ.data ? (
            <EmptyBlock message="no debug payload" />
          ) : (
            <div className="grid grid-cols-1 gap-2">
              {Object.entries(debugQ.data as Record<string, unknown>).slice(0, 12).map(([key, val]) => (
                <Telemetry key={key} label={key} value={typeof val === 'object' ? JSON.stringify(val).slice(0, 80) : String(val)} />
              ))}
            </div>
          )}
        </HudFrame>
      </div>
    </div>
  );
}
