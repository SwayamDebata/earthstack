'use client';

import { useMemo } from 'react';
import { useQueries, useQuery } from '@tanstack/react-query';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { RefreshCw } from 'lucide-react';
import { api } from '@/lib/api/endpoints';
import { LOCATIONS, POLLING_INTERVALS, withJitter } from '@/lib/config';
import HudFrame from '@/components/dashboard/HudFrame';
import StatusLed from '@/components/dashboard/StatusLed';
import StatTile from '@/components/dashboard/StatTile';
import { PageTitle, ScoreBar, Telemetry, ErrorBlock } from '@/components/dashboard/Atoms';
import { useDashboardUiMode } from '@/lib/ui/use-dashboard-ui-mode';
import {
  btnSecondary,
  chartAxisStroke,
  chartGridStroke,
  chartTooltip,
  panelCard,
  severityBadge,
  showHudChrome,
  tableCell,
  tableRow,
} from '@/lib/ui/standard-surface';
import { useStagger } from '@/components/dashboard/useStagger';
import { num, numOrNull, severityToTone, toArray } from '@/components/dashboard/util';

export default function RiskView() {
  const mode = useDashboardUiMode();
  const std = mode === 'standard';
  const riskMapQ = useQuery({ queryKey: ['risk-map'], queryFn: () => api.riskMap(), refetchInterval: () => withJitter(POLLING_INTERVALS.map) });

  // Stagger the initial mount fetches and rely on jittered polling thereafter
  // so we never spike 5 simultaneous DB-bound requests against the upstream.
  const enabled = useStagger(LOCATIONS.length, 300);
  const perRegion = useQueries({
    queries: LOCATIONS.map((loc, i) => ({
      queryKey: ['risk', loc],
      queryFn: () => api.risk(loc),
      enabled: enabled[i],
      refetchInterval: () => withJitter(POLLING_INTERVALS.risk),
    })),
  });

  const riskMap = useMemo(() => toArray<Record<string, unknown>>(riskMapQ.data), [riskMapQ.data]);

  const matrix = useMemo(
    () =>
      LOCATIONS.map((loc, i) => {
        const data = perRegion[i].data as Record<string, unknown> | undefined;
        return {
          location: loc,
          isLoading: perRegion[i].isLoading,
          isError: perRegion[i].isError,
          rule: numOrNull(data?.rule_score),
          ml: numOrNull(data?.ml_score),
          final: numOrNull(data?.final_score),
          severity: String(data?.severity ?? 'n/a'),
          trend: String(data?.trend ?? 'n/a'),
        };
      }),
    [perRegion],
  );

  const chartData = matrix.map((m) => ({
    name: m.location,
    rule: m.rule ?? 0,
    ml: m.ml ?? 0,
    final: m.final ?? 0,
  }));

  const overallScores = riskMap.map((r) => num(r.final_score ?? r.risk_score)).filter(Number.isFinite);
  const avg = overallScores.length ? overallScores.reduce((a, b) => a + b, 0) / overallScores.length : null;
  const max = overallScores.length ? Math.max(...overallScores) : null;
  const high = riskMap.filter((r) => {
    const s = String(r.severity ?? '').toLowerCase();
    return s === 'high' || s === 'critical';
  }).length;

  return (
    <div className="space-y-3 p-3">
      <PageTitle eyebrow="Risk Matrix" title="Multi-Region Risk Analytics">
        <button
          type="button"
          onClick={() => {
            void riskMapQ.refetch();
            perRegion.forEach((q) => void q.refetch());
          }}
          className={btnSecondary(mode)}
        >
          <RefreshCw size={11} /> RESYNC ALL
        </button>
      </PageTitle>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <StatTile label="REGIONS TRACKED" value={String(riskMap.length)} tone="info" size="sm" />
        <StatTile label="AVG FINAL" value={avg !== null ? avg.toFixed(2) : 'n/a'} tone={avg !== null && avg >= 0.7 ? 'critical' : avg !== null && avg >= 0.4 ? 'warning' : 'nominal'} size="sm" />
        <StatTile label="MAX FINAL" value={max !== null ? max.toFixed(2) : 'n/a'} tone={max !== null && max >= 0.7 ? 'critical' : max !== null && max >= 0.4 ? 'warning' : 'nominal'} size="sm" />
        <StatTile label="HIGH-RISK ZONES" value={String(high)} tone={high > 0 ? 'critical' : 'nominal'} size="sm" />
      </div>

      <HudFrame
        label="REGION SCORE COMPARISON"
        subtitle="rule · ml · final per region"
        status="info"
        statusText="LIVE"
      >
        {chartData.length === 0 ? null : (
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 6, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="2 4" stroke={chartGridStroke(mode)} />
                <XAxis dataKey="name" stroke={chartAxisStroke(mode)} tick={{ fontSize: 10, fontFamily: std ? 'inherit' : 'monospace' }} />
                <YAxis stroke={chartAxisStroke(mode)} tick={{ fontSize: 10, fontFamily: std ? 'inherit' : 'monospace' }} width={32} domain={[0, 1]} />
                <Tooltip {...chartTooltip(mode)} />
                <Bar dataKey="rule" fill="#22d3ee" radius={[2, 2, 0, 0]} />
                <Bar dataKey="ml" fill="#a78bfa" radius={[2, 2, 0, 0]} />
                <Bar dataKey="final" fill="#f59e0b" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </HudFrame>

      <HudFrame label="REGION RISK MATRIX" subtitle="/risk · per region" status="info" statusText={`${LOCATIONS.length}`}>
        <div className="grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-3">
          {matrix.map((m) => {
            const tone = severityToTone(m.severity);
            return (
              <div key={m.location} className={panelCard(mode)}>
                {showHudChrome(mode) ? (
                  <>
                    <span className="hud-bracket hud-bracket-tl" />
                    <span className="hud-bracket hud-bracket-br" />
                  </>
                ) : null}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <StatusLed tone={tone} size={7} pulse={!std && tone === 'critical'} />
                    <p className={std ? 'text-sm font-semibold text-slate-900' : 'font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-100'}>
                      {m.location}
                    </p>
                  </div>
                  <span className={severityBadge(tone, mode)}>{m.severity}</span>
                </div>

                {m.isError ? (
                  <div className="mt-3">
                    <ErrorBlock onRetry={() => void perRegion[LOCATIONS.indexOf(m.location)].refetch()} message="risk fetch failed" />
                  </div>
                ) : (
                  <div className="mt-3 space-y-2">
                    <ScoreBar label="FINAL" value={m.final} max={1} highlight />
                    <ScoreBar label="RULE" value={m.rule} max={1} />
                    <ScoreBar label="ML" value={m.ml} max={1} />
                  </div>
                )}

                <div className="mt-3 grid grid-cols-2 gap-1.5">
                  <Telemetry label="TREND" value={m.trend} />
                  <Telemetry label="SEVERITY" value={m.severity} tone={tone} />
                </div>
              </div>
            );
          })}
        </div>
      </HudFrame>

      <HudFrame label="GLOBAL ROLLUP · /risk/map" subtitle="all geocoded regions" status={riskMapQ.isError ? 'critical' : 'info'} statusText={`${riskMap.length}`}>
        {riskMapQ.isError ? (
          <ErrorBlock onRetry={() => void riskMapQ.refetch()} message="risk-map endpoint failed" />
        ) : riskMap.length === 0 ? (
          <p className={std ? 'rounded-lg border border-dashed border-slate-300 bg-slate-50 p-3 text-sm text-slate-600' : 'rounded-sm border border-white/5 bg-slate-950/40 p-3 font-mono text-[10px] uppercase tracking-widest text-slate-500'}>
            {std ? 'No regions returned' : 'NO REGIONS RETURNED'}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className={`w-full border-separate border-spacing-y-1 ${std ? 'text-sm' : 'font-mono text-[11px]'}`}>
              <thead>
                <tr className={std ? 'text-left text-xs font-semibold uppercase tracking-wide text-slate-500' : 'text-left font-mono text-[9px] uppercase tracking-[0.22em] text-slate-500'}>
                  <th className="px-2">REGION</th>
                  <th className="px-2">SEV</th>
                  <th className="px-2 text-right">RULE</th>
                  <th className="px-2 text-right">ML</th>
                  <th className="px-2 text-right">FINAL</th>
                  <th className="px-2 text-right">LAT</th>
                  <th className="px-2 text-right">LNG</th>
                </tr>
              </thead>
              <tbody>
                {riskMap.map((r, idx) => {
                  const sev = String(r.severity ?? r.level ?? 'n/a');
                  const tone = severityToTone(sev);
                  const rule = numOrNull(r.rule_score);
                  const ml = numOrNull(r.ml_score);
                  const final = numOrNull(r.final_score ?? r.risk_score);
                  const lat = numOrNull(r.lat ?? r.latitude);
                  const lng = numOrNull(r.lng ?? r.lon ?? r.longitude);
                  return (
                    <tr key={String(r.location ?? r.id ?? idx)} className={tableRow(mode)}>
                      <td className={`rounded-l-md border-y border-l px-2 py-1.5 ${tableCell(mode)} ${std ? 'font-medium' : 'text-cyan-200'}`}>
                        {String(r.location ?? r.district ?? r.name ?? 'n/a')}
                      </td>
                      <td className={`border-y px-2 py-1.5 ${tableCell(mode)}`}>
                        <span className={severityBadge(tone, mode)}>{sev}</span>
                      </td>
                      <td className={`border-y px-2 py-1.5 text-right tabular-nums ${tableCell(mode)}`}>{rule !== null ? rule.toFixed(2) : 'n/a'}</td>
                      <td className={`border-y px-2 py-1.5 text-right tabular-nums ${tableCell(mode)}`}>{ml !== null ? ml.toFixed(2) : 'n/a'}</td>
                      <td className={`border-y px-2 py-1.5 text-right font-semibold tabular-nums ${tableCell(mode)}`}>{final !== null ? final.toFixed(2) : 'n/a'}</td>
                      <td className={`border-y px-2 py-1.5 text-right tabular-nums ${std ? 'text-slate-500' : 'text-slate-400'}`}>{lat !== null ? lat.toFixed(2) : 'n/a'}</td>
                      <td className={`rounded-r-md border-y border-r px-2 py-1.5 text-right tabular-nums ${std ? 'text-slate-500' : 'text-slate-400'}`}>{lng !== null ? lng.toFixed(2) : 'n/a'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </HudFrame>
    </div>
  );
}
