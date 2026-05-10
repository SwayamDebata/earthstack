'use client';

import { useMemo } from 'react';
import { useQueries, useQuery } from '@tanstack/react-query';
import { Area, AreaChart, CartesianGrid, Line, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { RefreshCw } from 'lucide-react';
import { api } from '@/lib/api/endpoints';
import { LOCATIONS, POLLING_INTERVALS, withJitter } from '@/lib/config';
import { useMission } from '@/components/dashboard/MissionContext';
import HudFrame from '@/components/dashboard/HudFrame';
import StatusLed from '@/components/dashboard/StatusLed';
import RegionChips from '@/components/dashboard/RegionChips';
import { PageTitle, ErrorBlock, EmptyBlock, Telemetry, Legend } from '@/components/dashboard/Atoms';
import { useStagger } from '@/components/dashboard/useStagger';
import { extractNumericSeries } from '@/lib/api/coerce';
import { num } from '@/components/dashboard/util';

export default function RainfallView() {
  const { location } = useMission();

  const statsQ = useQuery({ queryKey: ['rainfall-stats'], queryFn: () => api.rainfallStats(), refetchInterval: () => withJitter(POLLING_INTERVALS.rainfall) });
  const focusQ = useQuery({ queryKey: ['rainfall', location], queryFn: () => api.rainfallLocation(location), refetchInterval: () => withJitter(POLLING_INTERVALS.rainfall) });

  const enabled = useStagger(LOCATIONS.length, 350);
  const peerQueries = useQueries({
    queries: LOCATIONS.map((loc, i) => ({
      queryKey: ['rainfall', loc],
      queryFn: () => api.rainfallLocation(loc),
      enabled: enabled[i],
      refetchInterval: () => withJitter(POLLING_INTERVALS.rainfall),
    })),
  });

  const baseline = num((statsQ.data as Record<string, unknown> | undefined)?.baseline);

  const observed = extractNumericSeries((focusQ.data as Record<string, unknown> | undefined)?.observed);
  const forecast = extractNumericSeries((focusQ.data as Record<string, unknown> | undefined)?.forecast);

  const focusChart = useMemo(
    () =>
      Array.from({ length: Math.max(observed.length, forecast.length) }).map((_, i) => ({
        t: i + 1,
        observed: observed[i] ?? null,
        forecast: forecast[i] ?? null,
        baseline: Number.isFinite(baseline) ? baseline : null,
      })),
    [observed, forecast, baseline],
  );

  const peerSummaries = useMemo(
    () =>
      LOCATIONS.map((loc, i) => {
        const data = peerQueries[i].data as Record<string, unknown> | undefined;
        const obs = extractNumericSeries(data?.observed);
        const fcst = extractNumericSeries(data?.forecast);
        const obsAvg = obs.length ? obs.reduce((a, b) => a + b, 0) / obs.length : null;
        const obsMax = obs.length ? Math.max(...obs) : null;
        const fcstAvg = fcst.length ? fcst.reduce((a, b) => a + b, 0) / fcst.length : null;
        const fcstMax = fcst.length ? Math.max(...fcst) : null;
        const above = Number.isFinite(baseline) && obsAvg !== null ? obsAvg - baseline : null;
        return {
          location: loc,
          isLoading: peerQueries[i].isLoading,
          isError: peerQueries[i].isError,
          obsAvg,
          obsMax,
          fcstAvg,
          fcstMax,
          above,
          spark: obs.slice(-12),
        };
      }),
    [peerQueries, baseline],
  );

  return (
    <div className="space-y-3 p-3">
      <PageTitle eyebrow="Hydrology" title="Rainfall Intelligence">
        <RegionChips />
        <button
          type="button"
          onClick={() => {
            void statsQ.refetch();
            void focusQ.refetch();
            peerQueries.forEach((q) => void q.refetch());
          }}
          className="flex items-center gap-1.5 rounded-sm border border-cyan-400/40 bg-cyan-500/10 px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-cyan-200 hover:bg-cyan-500/20"
        >
          <RefreshCw size={11} /> RESYNC
        </button>
      </PageTitle>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <SumTile label="BASELINE" value={Number.isFinite(baseline) ? `${baseline.toFixed(1)} mm` : '—'} tone="info" />
        <SumTile label="REGIONS" value={String(LOCATIONS.length)} tone="info" />
        <SumTile label="OBS POINTS" value={String(observed.length)} tone="info" />
        <SumTile label="FCST POINTS" value={String(forecast.length)} tone="info" />
      </div>

      <HudFrame
        label={`OSCILLOSCOPE · ${location.toUpperCase()}`}
        subtitle="observed vs forecast vs baseline"
        status={focusQ.isError ? 'critical' : 'info'}
        statusText={focusQ.isLoading ? 'SYNC' : 'LIVE'}
      >
        {focusQ.isError ? (
          <ErrorBlock onRetry={() => void focusQ.refetch()} message="rainfall endpoint failed" />
        ) : focusChart.length === 0 ? (
          <EmptyBlock message="no rainfall samples" />
        ) : (
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={focusChart} margin={{ top: 6, right: 8, left: -16, bottom: 0 }}>
                <defs>
                  <linearGradient id="rfObs" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="#22d3ee" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="rfFcst" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#a78bfa" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#a78bfa" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="2 4" stroke="#1e293b" />
                <XAxis dataKey="t" stroke="#475569" tick={{ fontSize: 10, fontFamily: 'monospace' }} />
                <YAxis stroke="#475569" tick={{ fontSize: 10, fontFamily: 'monospace' }} width={32} />
                <Tooltip
                  contentStyle={{ background: '#020617', border: '1px solid #22d3ee55', fontFamily: 'monospace', fontSize: 11 }}
                  labelStyle={{ color: '#67e8f9' }}
                />
                {Number.isFinite(baseline) ? <ReferenceLine y={baseline} stroke="#f59e0b" strokeDasharray="4 4" /> : null}
                <Area type="monotone" dataKey="observed" stroke="#22d3ee" strokeWidth={1.5} fill="url(#rfObs)" />
                <Area type="monotone" dataKey="forecast" stroke="#a78bfa" strokeWidth={1.5} strokeDasharray="3 3" fill="url(#rfFcst)" />
                <Line type="monotone" dataKey="baseline" stroke="transparent" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
        <Legend
          items={[
            { color: '#22d3ee', label: 'OBSERVED' },
            { color: '#a78bfa', label: 'FORECAST' },
            { color: '#f59e0b', label: 'BASELINE' },
          ]}
        />
      </HudFrame>

      <HudFrame label="REGIONAL ROLLUP" subtitle="/rainfall/<location> per region" status="info" statusText={`${LOCATIONS.length}`}>
        <div className="grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-3">
          {peerSummaries.map((p) => {
            const aboveTone = p.above !== null && p.above > 0 ? 'warning' : p.above !== null ? 'nominal' : 'info';
            const isCurrent = p.location === location;
            return (
              <div
                key={p.location}
                className={`relative overflow-hidden rounded-md border p-3 transition ${
                  isCurrent ? 'border-cyan-400/50 bg-cyan-500/5 shadow-[0_0_16px_rgba(34,211,238,0.08)]' : 'border-cyan-400/15 bg-[#060b18]/95'
                }`}
              >
                <span className="hud-bracket hud-bracket-tl" />
                <span className="hud-bracket hud-bracket-br" />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <StatusLed tone={aboveTone} size={7} />
                    <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-100">{p.location}</p>
                  </div>
                  {isCurrent ? <span className="rounded-sm border border-cyan-400/30 bg-black/40 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-widest text-cyan-200">FOCUS</span> : null}
                </div>
                <div className="mt-3 grid grid-cols-2 gap-1.5">
                  <Telemetry label="OBS AVG" value={p.obsAvg !== null ? `${p.obsAvg.toFixed(1)} mm` : '—'} />
                  <Telemetry label="OBS MAX" value={p.obsMax !== null ? `${p.obsMax.toFixed(1)} mm` : '—'} />
                  <Telemetry label="FCST AVG" value={p.fcstAvg !== null ? `${p.fcstAvg.toFixed(1)} mm` : '—'} />
                  <Telemetry label="FCST MAX" value={p.fcstMax !== null ? `${p.fcstMax.toFixed(1)} mm` : '—'} />
                </div>
                <div className="mt-2">
                  <Telemetry
                    label="VS BASELINE"
                    value={p.above !== null ? `${p.above >= 0 ? '+' : ''}${p.above.toFixed(1)} mm` : 'baseline unavailable'}
                    tone={aboveTone}
                  />
                </div>
                {p.spark.length > 1 ? (
                  <div className="mt-2 h-8 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={p.spark.map((v, i) => ({ t: i, v }))} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                        <Area type="monotone" dataKey="v" stroke="#22d3ee" strokeWidth={1.2} fill="#22d3ee22" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
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
