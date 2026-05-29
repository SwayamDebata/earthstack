'use client';

import { useMemo } from 'react';
import { useQueries, useQuery } from '@tanstack/react-query';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { RefreshCw } from 'lucide-react';
import { api } from '@/lib/api/endpoints';
import { LOCATIONS, POLLING_INTERVALS, withJitter } from '@/lib/config';
import HudFrame from '@/components/dashboard/HudFrame';
import StatusLed from '@/components/dashboard/StatusLed';
import { PageTitle, ScoreBar, Telemetry, ErrorBlock } from '@/components/dashboard/Atoms';
import { useStagger } from '@/components/dashboard/useStagger';
import { num, numOrNull, severityToTone, toArray } from '@/components/dashboard/util';

export default function RiskView() {
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
          className="flex items-center gap-1.5 rounded-sm border border-cyan-400/40 bg-cyan-500/10 px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-cyan-200 hover:bg-cyan-500/20"
        >
          <RefreshCw size={11} /> RESYNC ALL
        </button>
      </PageTitle>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <SumTile label="REGIONS TRACKED" value={String(riskMap.length)} tone="info" />
        <SumTile label="AVG FINAL" value={avg !== null ? avg.toFixed(2) : 'n/a'} tone={avg !== null && avg >= 0.7 ? 'critical' : avg !== null && avg >= 0.4 ? 'warning' : 'nominal'} />
        <SumTile label="MAX FINAL" value={max !== null ? max.toFixed(2) : 'n/a'} tone={max !== null && max >= 0.7 ? 'critical' : max !== null && max >= 0.4 ? 'warning' : 'nominal'} />
        <SumTile label="HIGH-RISK ZONES" value={String(high)} tone={high > 0 ? 'critical' : 'nominal'} />
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
                <CartesianGrid strokeDasharray="2 4" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#475569" tick={{ fontSize: 10, fontFamily: 'monospace' }} />
                <YAxis stroke="#475569" tick={{ fontSize: 10, fontFamily: 'monospace' }} width={32} domain={[0, 1]} />
                <Tooltip
                  contentStyle={{ background: '#020617', border: '1px solid #22d3ee55', fontFamily: 'monospace', fontSize: 11 }}
                  labelStyle={{ color: '#67e8f9' }}
                />
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
              <div key={m.location} className="relative overflow-hidden rounded-md border border-cyan-400/15 bg-[#060b18]/95 p-3">
                <span className="hud-bracket hud-bracket-tl" />
                <span className="hud-bracket hud-bracket-br" />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <StatusLed tone={tone} size={7} pulse={tone === 'critical'} />
                    <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-100">{m.location}</p>
                  </div>
                  <span
                    className={`rounded-sm px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-widest ${
                      tone === 'critical'
                        ? 'bg-red-500/15 text-red-200 ring-1 ring-red-500/30'
                        : tone === 'warning'
                          ? 'bg-amber-500/15 text-amber-200 ring-1 ring-amber-500/30'
                          : 'bg-emerald-500/15 text-emerald-200 ring-1 ring-emerald-500/30'
                    }`}
                  >
                    {m.severity}
                  </span>
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
          <p className="rounded-sm border border-white/5 bg-slate-950/40 p-3 font-mono text-[10px] uppercase tracking-widest text-slate-500">
            NO REGIONS RETURNED
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-separate border-spacing-y-1 font-mono text-[11px]">
              <thead>
                <tr className="text-left font-mono text-[9px] uppercase tracking-[0.22em] text-slate-500">
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
                    <tr key={String(r.location ?? r.id ?? idx)} className="bg-slate-950/50">
                      <td className="rounded-l-sm border-y border-l border-white/5 px-2 py-1.5 text-cyan-200">{String(r.location ?? r.district ?? r.name ?? 'n/a')}</td>
                      <td className="border-y border-white/5 px-2 py-1.5">
                        <span
                          className={`rounded-sm px-1.5 py-0.5 text-[9px] uppercase tracking-widest ${
                            tone === 'critical'
                              ? 'bg-red-500/15 text-red-200 ring-1 ring-red-500/30'
                              : tone === 'warning'
                                ? 'bg-amber-500/15 text-amber-200 ring-1 ring-amber-500/30'
                                : 'bg-emerald-500/15 text-emerald-200 ring-1 ring-emerald-500/30'
                          }`}
                        >
                          {sev}
                        </span>
                      </td>
                      <td className="border-y border-white/5 px-2 py-1.5 text-right text-cyan-100/80">{rule !== null ? rule.toFixed(2) : 'n/a'}</td>
                      <td className="border-y border-white/5 px-2 py-1.5 text-right text-cyan-100/80">{ml !== null ? ml.toFixed(2) : 'n/a'}</td>
                      <td className="border-y border-white/5 px-2 py-1.5 text-right font-semibold text-cyan-100">{final !== null ? final.toFixed(2) : 'n/a'}</td>
                      <td className="border-y border-white/5 px-2 py-1.5 text-right text-slate-400">{lat !== null ? lat.toFixed(2) : 'n/a'}</td>
                      <td className="rounded-r-sm border-y border-r border-white/5 px-2 py-1.5 text-right text-slate-400">{lng !== null ? lng.toFixed(2) : 'n/a'}</td>
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

function SumTile({ label, value, tone }: { label: string; value: string; tone: 'nominal' | 'warning' | 'critical' | 'info' }) {
  return (
    <div className="relative overflow-hidden rounded-md border border-cyan-400/15 bg-gradient-to-b from-[#0b1325]/95 to-[#070d1b]/95 p-3">
      <span className="hud-bracket hud-bracket-tl" />
      <span className="hud-bracket hud-bracket-br" />
      <div className="flex items-center justify-between">
        <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-slate-500">{label}</p>
        <StatusLed tone={tone} size={6} />
      </div>
      <p className="mt-1.5 font-mono text-2xl font-semibold tabular-nums text-cyan-100">{value}</p>
    </div>
  );
}
