'use client';

import { useMemo } from 'react';
import { useQueries, useQuery } from '@tanstack/react-query';
import { CartesianGrid, Legend as ReLegend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { RefreshCw } from 'lucide-react';
import { api } from '@/lib/api/endpoints';
import { LOCATIONS, POLLING_INTERVALS, withJitter } from '@/lib/config';
import { useMission } from '@/components/dashboard/MissionContext';
import HudFrame from '@/components/dashboard/HudFrame';
import StatusLed from '@/components/dashboard/StatusLed';
import RegionChips from '@/components/dashboard/RegionChips';
import { PageTitle, ErrorBlock, EmptyBlock, Telemetry } from '@/components/dashboard/Atoms';
import { useStagger } from '@/components/dashboard/useStagger';
import { extractNumericSeries } from '@/lib/api/coerce';

const PALETTE = ['#22d3ee', '#a78bfa', '#f59e0b', '#34d399', '#f472b6'];

export default function ForecastView() {
  const { location } = useMission();

  const focusQ = useQuery({
    queryKey: ['forecast', location, 'focus'],
    queryFn: () => api.forecast(location),
    refetchInterval: () => withJitter(POLLING_INTERVALS.forecast),
  });

  const enabled = useStagger(LOCATIONS.length, 400);
  const peerQueries = useQueries({
    queries: LOCATIONS.map((loc, i) => ({
      queryKey: ['forecast', loc],
      queryFn: () => api.forecast(loc),
      enabled: enabled[i],
      refetchInterval: () => withJitter(POLLING_INTERVALS.forecast),
    })),
  });

  const focusSeries = extractNumericSeries((focusQ.data as Record<string, unknown> | undefined)?.rainfall);

  const horizon = peerQueries.reduce((max, q) => {
    const s = extractNumericSeries((q.data as Record<string, unknown> | undefined)?.rainfall);
    return Math.max(max, s.length);
  }, 0);

  const compareData = useMemo(
    () =>
      Array.from({ length: horizon }).map((_, i) => {
        const row: Record<string, number | null | string> = { t: i + 1 };
        peerQueries.forEach((q, idx) => {
          const s = extractNumericSeries((q.data as Record<string, unknown> | undefined)?.rainfall);
          row[LOCATIONS[idx]] = s[i] ?? null;
        });
        return row;
      }),
    [peerQueries, horizon],
  );

  const peerSummaries = useMemo(
    () =>
      LOCATIONS.map((loc, i) => {
        const data = peerQueries[i].data as Record<string, unknown> | undefined;
        const s = extractNumericSeries(data?.rainfall);
        const max = s.length ? Math.max(...s) : null;
        const avg = s.length ? s.reduce((a, b) => a + b, 0) / s.length : null;
        const total = s.length ? s.reduce((a, b) => a + b, 0) : null;
        return {
          location: loc,
          isError: peerQueries[i].isError,
          isLoading: peerQueries[i].isLoading,
          max,
          avg,
          total,
          horizon: s.length,
        };
      }),
    [peerQueries],
  );

  return (
    <div className="space-y-3 p-3">
      <PageTitle eyebrow="Forecast" title="Multi-Region Predictive Horizon">
        <RegionChips />
        <button
          type="button"
          onClick={() => {
            void focusQ.refetch();
            peerQueries.forEach((q) => void q.refetch());
          }}
          className="flex items-center gap-1.5 rounded-sm border border-cyan-400/40 bg-cyan-500/10 px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-cyan-200 hover:bg-cyan-500/20"
        >
          <RefreshCw size={11} /> RESYNC
        </button>
      </PageTitle>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <SumTile label="HORIZON" value={horizon ? `${horizon}u` : '—'} tone="info" />
        <SumTile label="REGIONS" value={String(LOCATIONS.length)} tone="info" />
        <SumTile label="FOCUS" value={location.toUpperCase()} tone="info" />
        <SumTile label="POLL" value={`${POLLING_INTERVALS.forecast / 1000}s`} tone="info" />
      </div>

      <HudFrame
        label="REGION COMPARISON · FORECAST WAVEFORMS"
        subtitle="overlay across all tracked regions"
        status="info"
        statusText={`${horizon}u`}
      >
        {horizon === 0 ? (
          <EmptyBlock message="no forecast data yet" />
        ) : (
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={compareData} margin={{ top: 6, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="2 4" stroke="#1e293b" />
                <XAxis dataKey="t" stroke="#475569" tick={{ fontSize: 10, fontFamily: 'monospace' }} />
                <YAxis stroke="#475569" tick={{ fontSize: 10, fontFamily: 'monospace' }} width={32} />
                <Tooltip
                  contentStyle={{ background: '#020617', border: '1px solid #22d3ee55', fontFamily: 'monospace', fontSize: 11 }}
                  labelStyle={{ color: '#67e8f9' }}
                />
                <ReLegend wrapperStyle={{ fontSize: 10, fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: 1 }} />
                {LOCATIONS.map((loc, idx) => (
                  <Line
                    key={loc}
                    type="monotone"
                    dataKey={loc}
                    stroke={PALETTE[idx % PALETTE.length]}
                    strokeWidth={loc === location ? 2 : 1.2}
                    strokeOpacity={loc === location ? 1 : 0.6}
                    dot={false}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </HudFrame>

      <HudFrame
        label={`FOCUS WAVEFORM · ${location.toUpperCase()}`}
        subtitle={`/forecast/${location}`}
        status={focusQ.isError ? 'critical' : 'info'}
        statusText={focusQ.isLoading ? 'SYNC' : 'LIVE'}
      >
        {focusQ.isError ? (
          <ErrorBlock onRetry={() => void focusQ.refetch()} message="forecast endpoint failed" />
        ) : focusSeries.length === 0 ? (
          <EmptyBlock message="no forecast samples" />
        ) : (
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={focusSeries.map((v, i) => ({ t: i + 1, forecast: v }))} margin={{ top: 6, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="2 4" stroke="#1e293b" />
                <XAxis dataKey="t" stroke="#475569" tick={{ fontSize: 10, fontFamily: 'monospace' }} />
                <YAxis stroke="#475569" tick={{ fontSize: 10, fontFamily: 'monospace' }} width={32} />
                <Tooltip
                  contentStyle={{ background: '#020617', border: '1px solid #22d3ee55', fontFamily: 'monospace', fontSize: 11 }}
                  labelStyle={{ color: '#67e8f9' }}
                />
                <Line type="monotone" dataKey="forecast" stroke="#22d3ee" strokeWidth={1.6} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </HudFrame>

      <HudFrame label="REGION SUMMARY" subtitle="per-region forecast stats" status="info" statusText={`${LOCATIONS.length}`}>
        <div className="grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-3">
          {peerSummaries.map((p, idx) => {
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
                    <StatusLed tone="info" size={7} />
                    <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-100">{p.location}</p>
                  </div>
                  <span
                    className="inline-block h-2 w-6 rounded-sm"
                    style={{ background: PALETTE[idx % PALETTE.length] }}
                  />
                </div>
                {p.isError ? (
                  <div className="mt-3 rounded-sm border border-red-500/30 bg-red-500/5 px-2 py-1.5 font-mono text-[10px] uppercase tracking-widest text-red-200">
                    forecast unavailable
                  </div>
                ) : (
                  <div className="mt-3 grid grid-cols-2 gap-1.5">
                    <Telemetry label="HORIZON" value={p.horizon ? `${p.horizon}u` : '—'} />
                    <Telemetry label="MAX" value={p.max !== null ? `${p.max.toFixed(1)} mm` : '—'} />
                    <Telemetry label="AVG" value={p.avg !== null ? `${p.avg.toFixed(1)} mm` : '—'} />
                    <Telemetry label="TOTAL" value={p.total !== null ? `${p.total.toFixed(0)} mm` : '—'} />
                  </div>
                )}
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
