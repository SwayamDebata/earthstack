'use client';

import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQueries } from '@tanstack/react-query';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { api } from '@/lib/api/endpoints';
import { extractNumericSeries } from '@/lib/api/coerce';
import { formatScalar } from '@/lib/api/payload';
import { LOCATIONS, POLLING_INTERVALS } from '@/lib/config';
import DataState from '@/components/system/DataState';
import StatusBadge from '@/components/system/StatusBadge';
import RiskMapPanel from '@/components/dashboard/RiskMapPanel';

const toArray = <T,>(payload: unknown): T[] => {
  if (Array.isArray(payload)) return payload as T[];
  if (payload && typeof payload === 'object') {
    const obj = payload as Record<string, unknown>;
    if (Array.isArray(obj.data)) return obj.data as T[];
    if (Array.isArray(obj.alerts)) return obj.alerts as T[];
    if (Array.isArray(obj.logs)) return obj.logs as T[];
  }
  return [];
};

const num = (v: unknown) => (typeof v === 'number' ? v : typeof v === 'string' ? Number(v) : Number.NaN);

const panelClass =
  'rounded-xl border border-cyan-400/20 bg-slate-950/70 backdrop-blur-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_0_24px_rgba(34,211,238,0.08)]';

export default function CommandCenter() {
  const [location, setLocation] = useState<string>(LOCATIONS[0]);
  const [activeOnly, setActiveOnly] = useState(true);
  const [latencyMs, setLatencyMs] = useState(0);

  const [health, risk, riskMap, alerts, rainfall, rainfallStats, forecast, replay, mlLogs] = useQueries({
    queries: [
      { queryKey: ['health'], queryFn: () => api.health(), refetchInterval: POLLING_INTERVALS.health },
      { queryKey: ['risk', location], queryFn: () => api.risk(location), refetchInterval: POLLING_INTERVALS.risk },
      { queryKey: ['risk-map'], queryFn: () => api.riskMap(), refetchInterval: POLLING_INTERVALS.map },
      { queryKey: ['alerts', activeOnly], queryFn: () => api.alerts(activeOnly, 20), refetchInterval: POLLING_INTERVALS.alerts },
      { queryKey: ['rainfall', location], queryFn: () => api.rainfallLocation(location), refetchInterval: POLLING_INTERVALS.rainfall },
      { queryKey: ['rainfall-stats'], queryFn: () => api.rainfallStats(), refetchInterval: POLLING_INTERVALS.rainfall },
      { queryKey: ['forecast', location], queryFn: () => api.forecast(location), refetchInterval: POLLING_INTERVALS.forecast },
      { queryKey: ['replay', location], queryFn: () => api.replay(location), refetchInterval: false },
      { queryKey: ['ml-logs', location], queryFn: () => api.mlInferenceLogs(location, 20), refetchInterval: POLLING_INTERVALS.mlLogs },
    ],
  });

  const replayRun = useMutation({ mutationFn: () => api.replayRun(location), mutationKey: ['replay-run', location] });

  useEffect(() => {
    const listener = (event: Event) => {
      const detail = (event as CustomEvent<{ latency: number }>).detail;
      setLatencyMs(Math.round(detail.latency));
    };
    window.addEventListener('earthstack:latency', listener);
    return () => window.removeEventListener('earthstack:latency', listener);
  }, []);

  /** Core telemetry only. Empty alerts is valid, not a degraded signal. */
  const criticalErrors = [health, risk, riskMap].filter((q) => q.isError).length;

  const riskMapList = toArray<Record<string, unknown>>(riskMap.data);
  const alertsList = useMemo(
    () => toArray<Record<string, unknown>>(alerts.data).sort((a, b) => Number(Boolean(b.active)) - Number(Boolean(a.active))),
    [alerts.data],
  );

  const rainfallForecast = extractNumericSeries((rainfall.data as Record<string, unknown> | undefined)?.forecast);
  const rainfallBaseline = num((rainfallStats.data as Record<string, unknown> | undefined)?.baseline);
  const forecastSeries = extractNumericSeries((forecast.data as Record<string, unknown> | undefined)?.rainfall);
  const mlList = toArray<Record<string, unknown>>(mlLogs.data);

  const avgRisk = riskMapList.map((item) => num(item.final_score ?? item.risk_score)).filter(Number.isFinite);
  const avgRiskScore = avgRisk.length ? (avgRisk.reduce((a, b) => a + b, 0) / avgRisk.length).toFixed(1) : 'N/A';

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_120%_80%_at_50%_-20%,#0c4a6e_0%,#020617_42%,#020617_100%)] text-slate-100 p-4 md:p-6">
      {criticalErrors > 0 ? (
        <div className="mb-4 rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-sm text-amber-100">
          Degraded mode: one or more of <span className="font-mono">/health</span>, <span className="font-mono">/risk</span>, or{' '}
          <span className="font-mono">/risk/map</span> failed. Other widgets still run. If local, confirm{' '}
          <span className="font-mono">/api/proxy/*</span> returns 200 (avoids browser CORS to the origin API).
        </div>
      ) : null}

      <header className={`${panelClass} p-4 md:p-5 mb-4 flex flex-wrap items-center justify-between gap-3`}>
        <div>
          <p className="text-[11px] uppercase tracking-[0.24em] text-cyan-300/90">ModelEarth Operations</p>
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Climate Mission Control</h1>
          <p className="text-sm text-slate-400">Real-time flood intelligence, decision telemetry, and model behavior</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge
            label={`Health ${health.isError ? 'unknown' : formatScalar((health.data as Record<string, unknown> | undefined)?.status)}`}
            tone={health.isError ? 'critical' : 'success'}
          />
          <StatusBadge label={`Latency ${latencyMs}ms`} tone="info" />
          <StatusBadge label={`Avg risk ${avgRiskScore}`} tone="warning" />
        </div>
      </header>

      <section className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        <aside className={`xl:col-span-3 ${panelClass} p-4 space-y-4 h-fit`}>
          <h2 className="text-sm font-semibold tracking-wide">Control Rail</h2>
          <div className="space-y-2">
            <p className="text-xs text-slate-400">Region</p>
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full rounded-md border border-cyan-400/30 bg-slate-900/80 px-3 py-2 text-sm"
            >
              {LOCATIONS.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <p className="text-xs text-slate-400">Layers</p>
            <button className="w-full rounded-md border border-cyan-400/20 px-3 py-2 text-left text-sm hover:bg-cyan-500/10">Rainfall</button>
            <button className="w-full rounded-md border border-cyan-400/20 px-3 py-2 text-left text-sm hover:bg-cyan-500/10">River Levels</button>
            <button className="w-full rounded-md border border-cyan-400/20 px-3 py-2 text-left text-sm hover:bg-cyan-500/10">Flood Zones</button>
            <button className="w-full rounded-md border border-cyan-400/20 px-3 py-2 text-left text-sm hover:bg-cyan-500/10">Satellite</button>
          </div>

          <label className="flex items-center justify-between rounded-md border border-white/10 px-3 py-2 text-sm">
            Active alerts only
            <input type="checkbox" checked={activeOnly} onChange={() => setActiveOnly((v) => !v)} />
          </label>

          <div className="rounded-md border border-white/10 p-3">
            <p className="text-xs text-slate-400">Replay</p>
            <p className="text-sm mt-1">Status: {String((replay.data as Record<string, unknown> | undefined)?.status ?? 'N/A')}</p>
            <button
              onClick={() => replayRun.mutate()}
              disabled={replayRun.isPending}
              className="mt-2 w-full rounded-md bg-cyan-400/90 hover:bg-cyan-300 text-slate-950 px-3 py-2 text-sm font-medium"
            >
              {replayRun.isPending ? 'Running replay...' : 'Run Replay'}
            </button>
          </div>
        </aside>

        <main className="xl:col-span-9 grid grid-cols-1 md:grid-cols-2 gap-4">
          <article className={`${panelClass} p-3 md:col-span-2`}>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold tracking-wide">Geospatial Risk Theater (Mapbox)</h3>
              <p className="text-xs text-slate-400">Live source: /risk/map</p>
            </div>
            <RiskMapPanel rows={riskMapList} isLoading={riskMap.isLoading} isError={riskMap.isError} onRetry={() => void riskMap.refetch()} />
          </article>

          <article className={`${panelClass} p-4`}>
            <h3 className="text-sm font-semibold mb-3">Live Risk Panel</h3>
            {risk.isLoading ? (
              <DataState state="loading" title="Loading risk" description="Fetching location risk intelligence." />
            ) : risk.isError ? (
              <DataState state="error" title="Risk unavailable" description="Risk endpoint failed." onRetry={() => void risk.refetch()} />
            ) : (
              <div className="grid grid-cols-2 gap-2 text-sm font-mono text-cyan-100/90">
                <p>risk_score: {String((risk.data as Record<string, unknown>)?.risk_score ?? 'N/A')}</p>
                <p>rule_score: {String((risk.data as Record<string, unknown>)?.rule_score ?? 'N/A')}</p>
                <p>ml_score: {String((risk.data as Record<string, unknown>)?.ml_score ?? 'N/A')}</p>
                <p>final_score: {String((risk.data as Record<string, unknown>)?.final_score ?? 'N/A')}</p>
                <p>trend: {String((risk.data as Record<string, unknown>)?.trend ?? 'N/A')}</p>
                <p>severity: {String((risk.data as Record<string, unknown>)?.severity ?? 'N/A')}</p>
              </div>
            )}
          </article>

          <article className={`${panelClass} p-4`}>
            <h3 className="text-sm font-semibold mb-3">Rainfall Intelligence</h3>
            {rainfall.isError ? (
              <DataState state="error" title="Rainfall unavailable" description="Rainfall endpoint failed." onRetry={() => void rainfall.refetch()} />
            ) : (
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={rainfallForecast.map((v, i) => ({
                      t: i + 1,
                      forecast: v,
                      baseline: Number.isFinite(rainfallBaseline) ? rainfallBaseline : null,
                    }))}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="t" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip />
                    <Area type="monotone" dataKey="forecast" stroke="#22d3ee" fill="#22d3ee33" />
                    <Area type="monotone" dataKey="baseline" stroke="#f59e0b" fill="#f59e0b22" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </article>

          <article className={`${panelClass} p-4 md:col-span-2`}>
            <h3 className="text-sm font-semibold mb-3">Alerts Feed</h3>
            {alerts.isLoading ? (
              <DataState state="loading" title="Loading alerts" description="Fetching incident stream." />
            ) : alertsList.length === 0 ? (
              <DataState state="empty" title="No alerts" description="No alerts returned for current filter." />
            ) : (
              <div className="space-y-2 max-h-56 overflow-auto pr-1">
                {alertsList.map((item, idx) => (
                  <div key={String(item.id ?? idx)} className="rounded-md border border-cyan-400/20 bg-slate-900/60 p-2">
                    <p className="text-sm">{String(item.title ?? item.message ?? 'Untitled alert')}</p>
                    <p className="text-xs text-slate-400">
                      severity={String(item.severity ?? 'unknown')} | active={String(item.active ?? false)} | location={String(item.location ?? 'N/A')}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </article>

          <article className={`${panelClass} p-4`}>
            <h3 className="text-sm font-semibold mb-3">Forecast</h3>
            <p className="text-sm text-slate-300">Points: {forecastSeries.length}</p>
          </article>

          <article className={`${panelClass} p-4`}>
            <h3 className="text-sm font-semibold mb-3">ML Observability</h3>
            <div className="space-y-1">
              {mlList.slice(0, 6).map((log, idx) => (
                <p key={String(log.id ?? idx)} className="text-xs font-mono text-cyan-100/80">
                  rule={String(log.rule_score ?? 'N/A')} ml={String(log.ml_score ?? 'N/A')} final={String(log.final_score ?? 'N/A')} shadow={String(log.shadow_mode ?? false)}
                </p>
              ))}
              {mlList.length === 0 ? <p className="text-xs text-slate-400">No ML logs available.</p> : null}
            </div>
          </article>
        </main>
      </section>
    </div>
  );
}
