'use client';

import { useMemo } from 'react';
import { useMutation, useQueries } from '@tanstack/react-query';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Play, RefreshCw } from 'lucide-react';
import { api } from '@/lib/api/endpoints';
import { getAlertId, getAlertRegion, isAlertOpen } from '@/lib/api/alerts';
import { extractNumericSeries } from '@/lib/api/coerce';
import { formatScalar } from '@/lib/api/payload';
import { POLLING_INTERVALS, withJitter } from '@/lib/config';
import HudFrame from '@/components/dashboard/HudFrame';
import StatusLed from '@/components/dashboard/StatusLed';
import KpiRibbon, { type Kpi } from '@/components/dashboard/KpiRibbon';
import RiskMapPanel from '@/components/dashboard/RiskMapPanel';
import RegionChips from '@/components/dashboard/RegionChips';
import SendAlertButton from '@/components/dashboard/alerts/SendAlertButton';
import { useMission } from '@/components/dashboard/MissionContext';
import { ScoreBar, Telemetry, Legend, ErrorBlock, EmptyBlock } from '@/components/dashboard/Atoms';
import { numOrNull, num, severityToTone, relTime, toArray } from '@/components/dashboard/util';

export default function OverviewView() {
  const { location, latencyMs, activeOnly, setActiveOnly } = useMission();

  const [risk, riskMap, alerts, rainfall, rainfallStats, forecast, replay, mlLogs] = useQueries({
    queries: [
      { queryKey: ['risk', location], queryFn: () => api.risk(location), refetchInterval: () => withJitter(POLLING_INTERVALS.risk) },
      { queryKey: ['risk-map'], queryFn: () => api.riskMap(), refetchInterval: () => withJitter(POLLING_INTERVALS.map) },
      { queryKey: ['alerts', activeOnly], queryFn: () => api.alerts(activeOnly, 20), refetchInterval: () => withJitter(POLLING_INTERVALS.alerts) },
      { queryKey: ['rainfall', location], queryFn: () => api.rainfallLocation(location), refetchInterval: () => withJitter(POLLING_INTERVALS.rainfall) },
      { queryKey: ['rainfall-stats'], queryFn: () => api.rainfallStats(), refetchInterval: () => withJitter(POLLING_INTERVALS.rainfall) },
      { queryKey: ['forecast', location], queryFn: () => api.forecast(location), refetchInterval: () => withJitter(POLLING_INTERVALS.forecast) },
      { queryKey: ['replay', location], queryFn: () => api.replay(location), refetchInterval: false },
      { queryKey: ['ml-logs', location], queryFn: () => api.mlInferenceLogs(location, 20), refetchInterval: () => withJitter(POLLING_INTERVALS.mlLogs) },
    ],
  });

  const replayRun = useMutation({ mutationFn: () => api.replayRun(location), mutationKey: ['replay-run', location] });

  const riskMapList = toArray<Record<string, unknown>>(riskMap.data);
  const alertsList = useMemo(
    () => toArray<Record<string, unknown>>(alerts.data).sort((a, b) => Number(isAlertOpen(b)) - Number(isAlertOpen(a))),
    [alerts.data],
  );
  const mlList = toArray<Record<string, unknown>>(mlLogs.data);

  const rainfallForecast = extractNumericSeries((rainfall.data as Record<string, unknown> | undefined)?.forecast);
  const rainfallObserved = extractNumericSeries((rainfall.data as Record<string, unknown> | undefined)?.observed);
  const rainfallBaseline = num((rainfallStats.data as Record<string, unknown> | undefined)?.baseline);
  const forecastSeries = extractNumericSeries((forecast.data as Record<string, unknown> | undefined)?.rainfall);

  const riskScores = riskMapList.map((item) => num(item.final_score ?? item.risk_score)).filter(Number.isFinite);
  const avgRiskScore = riskScores.length ? riskScores.reduce((a, b) => a + b, 0) / riskScores.length : null;

  const highRiskCount = riskMapList.filter((r) => {
    const sev = String(r.severity ?? r.level ?? '').toLowerCase();
    return sev === 'high' || sev === 'critical';
  }).length;
  const activeAlerts = alertsList.filter((a) => isAlertOpen(a)).length;

  const mlLastFinal = numOrNull(mlList[0]?.final_score);
  const mlLastRule = numOrNull(mlList[0]?.rule_score);
  const mlLastMl = numOrNull(mlList[0]?.ml_score);

  const replayStatus = formatScalar((replay.data as Record<string, unknown> | undefined)?.status);

  const currentRisk = risk.data as Record<string, unknown> | undefined;
  const riskFinalScore = numOrNull(currentRisk?.final_score);
  const riskRuleScore = numOrNull(currentRisk?.rule_score);
  const riskMlScore = numOrNull(currentRisk?.ml_score);
  const riskSeverity = String(currentRisk?.severity ?? 'unknown');
  const riskTrend = String(currentRisk?.trend ?? 'n/a');

  const kpis: Kpi[] = useMemo(
    () => [
      {
        label: 'AVG RISK',
        value: avgRiskScore !== null ? avgRiskScore.toFixed(2) : 'n/a',
        unit: 'score',
        tone: avgRiskScore === null ? 'idle' : avgRiskScore >= 0.7 ? 'critical' : avgRiskScore >= 0.4 ? 'warning' : 'nominal',
        spark: riskScores.slice(-12),
        hint: `${riskMapList.length} regions`,
      },
      {
        label: 'ACTIVE ALERTS',
        value: String(activeAlerts),
        unit: 'open',
        tone: activeAlerts > 5 ? 'critical' : activeAlerts > 0 ? 'warning' : 'nominal',
        hint: `${alertsList.length} total`,
      },
      {
        label: 'HIGH-RISK ZONES',
        value: String(highRiskCount),
        unit: 'reg',
        tone: highRiskCount > 0 ? 'critical' : 'nominal',
        hint: 'severity ≥ high',
      },
      {
        label: 'ML FINAL',
        value: mlLastFinal !== null ? mlLastFinal.toFixed(2) : 'n/a',
        unit: 'score',
        tone: mlLastFinal === null ? 'idle' : mlLastFinal >= 0.7 ? 'critical' : mlLastFinal >= 0.4 ? 'warning' : 'nominal',
        spark: mlList.slice(0, 12).map((l) => num(l.final_score)).filter(Number.isFinite).reverse(),
        hint: 'latest inference',
      },
      {
        label: 'API LATENCY',
        value: latencyMs.toString(),
        unit: 'ms',
        tone: latencyMs > 800 ? 'critical' : latencyMs > 300 ? 'warning' : 'nominal',
        hint: 'rolling',
      },
      {
        label: 'BASELINE',
        value: Number.isFinite(rainfallBaseline) ? rainfallBaseline.toFixed(1) : 'n/a',
        unit: 'mm',
        tone: 'info',
        hint: '/rainfall/stats',
      },
    ],
    [avgRiskScore, riskScores, riskMapList.length, activeAlerts, alertsList.length, highRiskCount, mlLastFinal, mlList, latencyMs, rainfallBaseline],
  );

  return (
    <div className="space-y-3 p-3">
      {/* Operating params */}
      <HudFrame
        label="OPERATING PARAMETERS"
        subtitle="region · filters · replay"
        status="info"
        statusText="LIVE"
        meta={[
          { label: 'REGION', value: location.toUpperCase() },
          { label: 'POLL', value: `${POLLING_INTERVALS.risk / 1000}s` },
        ]}
      >
        <div className="flex flex-wrap items-center gap-2">
          <RegionChips />
          <label className="flex cursor-pointer items-center gap-2 rounded-sm border border-cyan-400/20 bg-black/40 px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest text-slate-300 hover:text-cyan-200">
            <input type="checkbox" checked={activeOnly} onChange={() => setActiveOnly(!activeOnly)} className="h-3 w-3 accent-cyan-400" />
            ACTIVE ALERTS ONLY
          </label>
          <button
            type="button"
            onClick={() => {
              void risk.refetch();
              void riskMap.refetch();
              void alerts.refetch();
              void rainfall.refetch();
              void forecast.refetch();
              void mlLogs.refetch();
            }}
            className="flex items-center gap-1.5 rounded-sm border border-cyan-400/30 bg-cyan-500/10 px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest text-cyan-200 hover:bg-cyan-500/15"
          >
            <RefreshCw size={10} />
            RESYNC ALL
          </button>
          <button
            type="button"
            onClick={() => replayRun.mutate()}
            disabled={replayRun.isPending}
            className="flex items-center gap-1.5 rounded-sm border border-emerald-400/40 bg-emerald-500/10 px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest text-emerald-200 transition hover:bg-emerald-500/20 disabled:opacity-50"
          >
            <Play size={10} />
            {replayRun.isPending ? 'REPLAYING…' : `RUN REPLAY · ${location.toUpperCase()}`}
          </button>
        </div>
      </HudFrame>

      <KpiRibbon kpis={kpis} />

      <div className="grid grid-cols-1 gap-3 xl:grid-cols-12">
        {/* GEOSPATIAL THEATRE */}
        <div className="xl:col-span-8">
          <HudFrame
            label="GEOSPATIAL THEATRE"
            subtitle="risk/map · mapbox dark-v11"
            status={riskMap.isError ? 'critical' : 'nominal'}
            statusText={riskMap.isLoading ? 'SYNC' : 'LIVE'}
            meta={[{ label: 'POINTS', value: String(riskMapList.length) }, { label: 'PITCH', value: '48°' }]}
            noPad
            bodyClassName="h-[440px]"
          >
            <RiskMapPanel rows={riskMapList} isLoading={riskMap.isLoading} isError={riskMap.isError} onRetry={() => void riskMap.refetch()} activeLocation={location} />
          </HudFrame>
        </div>

        {/* RISK TELEMETRY */}
        <div className="xl:col-span-4">
          <HudFrame
            label="RISK TELEMETRY"
            subtitle={`/risk · ${location}`}
            status={severityToTone(riskSeverity)}
            statusText={String(riskSeverity).toUpperCase()}
            meta={[{ label: 'TREND', value: riskTrend }]}
          >
            {risk.isError ? (
              <ErrorBlock onRetry={() => void risk.refetch()} message="risk endpoint failed" />
            ) : (
              <div className="space-y-3">
                <ScoreBar label="FINAL" value={riskFinalScore} max={1} highlight />
                <ScoreBar label="RULE" value={riskRuleScore} max={1} />
                <ScoreBar label="ML" value={riskMlScore} max={1} />
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <Telemetry label="LOCATION" value={String(currentRisk?.location ?? location)} />
                  <Telemetry label="SEVERITY" value={riskSeverity} tone={severityToTone(riskSeverity)} />
                  <Telemetry label="TREND" value={riskTrend} />
                  <Telemetry label="UPDATED" value={relTime(currentRisk?.timestamp)} />
                </div>
              </div>
            )}
          </HudFrame>
        </div>

        {/* RAINFALL OSCILLOSCOPE */}
        <div className="xl:col-span-6">
          <HudFrame
            label="RAINFALL OSCILLOSCOPE"
            subtitle={`/rainfall/${location}`}
            status={rainfall.isError ? 'critical' : 'info'}
            statusText={rainfall.isLoading ? 'SYNC' : 'LIVE'}
            meta={[{ label: 'OBS', value: String(rainfallObserved.length) }, { label: 'FCST', value: String(rainfallForecast.length) }]}
          >
            {rainfall.isError ? (
              <ErrorBlock onRetry={() => void rainfall.refetch()} message="rainfall endpoint failed" />
            ) : (
              <div className="h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={Array.from({ length: Math.max(rainfallObserved.length, rainfallForecast.length) }).map((_, i) => ({
                      t: i + 1,
                      observed: rainfallObserved[i] ?? null,
                      forecast: rainfallForecast[i] ?? null,
                      baseline: Number.isFinite(rainfallBaseline) ? rainfallBaseline : null,
                    }))}
                    margin={{ top: 6, right: 8, left: -16, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="rainObserved" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.5} />
                        <stop offset="100%" stopColor="#22d3ee" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="rainForecast" x1="0" x2="0" y1="0" y2="1">
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
                    <Area type="monotone" dataKey="observed" stroke="#22d3ee" strokeWidth={1.5} fill="url(#rainObserved)" />
                    <Area type="monotone" dataKey="forecast" stroke="#a78bfa" strokeWidth={1.5} strokeDasharray="3 3" fill="url(#rainForecast)" />
                    <Line type="monotone" dataKey="baseline" stroke="#f59e0b" strokeDasharray="4 4" strokeWidth={1} dot={false} />
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
        </div>

        {/* FORECAST WAVEFORM */}
        <div className="xl:col-span-6">
          <HudFrame
            label="FORECAST WAVEFORM"
            subtitle={`/forecast/${location}`}
            status={forecast.isError ? 'critical' : 'info'}
            statusText={forecast.isLoading ? 'SYNC' : 'LIVE'}
            meta={[{ label: 'POINTS', value: String(forecastSeries.length) }, { label: 'HORIZON', value: forecastSeries.length ? `${forecastSeries.length}u` : 'n/a' }]}
          >
            {forecast.isError ? (
              <ErrorBlock onRetry={() => void forecast.refetch()} message="forecast endpoint failed" />
            ) : (
              <div className="h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={forecastSeries.map((v, i) => ({ t: i + 1, forecast: v }))} margin={{ top: 6, right: 8, left: -16, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="2 4" stroke="#1e293b" />
                    <XAxis dataKey="t" stroke="#475569" tick={{ fontSize: 10, fontFamily: 'monospace' }} />
                    <YAxis stroke="#475569" tick={{ fontSize: 10, fontFamily: 'monospace' }} width={32} />
                    <Tooltip
                      contentStyle={{ background: '#020617', border: '1px solid #22d3ee55', fontFamily: 'monospace', fontSize: 11 }}
                      labelStyle={{ color: '#67e8f9' }}
                    />
                    <Line type="monotone" dataKey="forecast" stroke="#22d3ee" strokeWidth={1.5} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </HudFrame>
        </div>

        {/* INCIDENT STREAM */}
        <div className="xl:col-span-7">
          <HudFrame
            label="INCIDENT STREAM"
            subtitle={`/alerts · ${activeOnly ? 'active only' : 'all'}`}
            status={alerts.isError ? 'critical' : activeAlerts > 0 ? 'warning' : 'nominal'}
            statusText={alerts.isLoading ? 'SYNC' : `${alertsList.length}`}
          >
            {alerts.isError ? (
              <ErrorBlock onRetry={() => void alerts.refetch()} message="alerts endpoint failed" />
            ) : alertsList.length === 0 ? (
              <EmptyBlock message="no incidents in current filter" />
            ) : (
              <div className="max-h-72 space-y-1 overflow-auto pr-1">
                {alertsList.map((item, idx) => {
                  const tone = severityToTone(item.severity);
                  const sev = String(item.severity ?? 'unknown');
                  const alertId = getAlertId(item);
                  const open = isAlertOpen(item);
                  return (
                    <div key={String(item.id ?? idx)} className="grid grid-cols-[18px_1fr_auto_auto_auto] items-center gap-2 rounded-sm border border-white/5 bg-slate-950/50 px-2 py-1.5 transition hover:border-cyan-400/25 hover:bg-cyan-500/[0.04]">
                      <StatusLed tone={tone} size={6} pulse={tone === 'critical'} />
                      <div className="min-w-0">
                        <p className="truncate text-xs text-slate-100">{String(item.message ?? item.title ?? 'Untitled')}</p>
                        <p className="truncate font-mono text-[10px] uppercase tracking-widest text-slate-500">
                          {getAlertRegion(item)} · {relTime(item.timestamp ?? item.created_at)}
                        </p>
                      </div>
                      <span
                        className={`shrink-0 rounded-sm px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-widest ${
                          tone === 'critical'
                            ? 'bg-red-500/15 text-red-200 ring-1 ring-red-500/30'
                            : tone === 'warning'
                              ? 'bg-amber-500/15 text-amber-200 ring-1 ring-amber-500/30'
                              : 'bg-cyan-500/15 text-cyan-200 ring-1 ring-cyan-500/30'
                        }`}
                      >
                        {sev}
                      </span>
                      <span className="shrink-0 font-mono text-[9px] uppercase tracking-widest text-slate-500">
                        {typeof item.status === 'string' ? String(item.status).toUpperCase() : open ? 'OPEN' : 'CLOSED'}
                      </span>
                      {alertId !== null && open ? (
                        <SendAlertButton alertId={alertId} compact />
                      ) : (
                        <span className="w-12 shrink-0" />
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </HudFrame>
        </div>

        {/* ML OBSERVABILITY */}
        <div className="xl:col-span-5">
          <HudFrame
            label="ML OBSERVABILITY"
            subtitle="/ml/inference/logs · shadow-mode"
            status={mlLogs.isError ? 'critical' : 'info'}
            statusText={mlLogs.isLoading ? 'SYNC' : `${mlList.length}`}
            meta={[
              { label: 'RULE', value: mlLastRule !== null ? mlLastRule.toFixed(2) : 'n/a' },
              { label: 'ML', value: mlLastMl !== null ? mlLastMl.toFixed(2) : 'n/a' },
              { label: 'FINAL', value: mlLastFinal !== null ? mlLastFinal.toFixed(2) : 'n/a' },
            ]}
          >
            {mlLogs.isError ? (
              <ErrorBlock onRetry={() => void mlLogs.refetch()} message="ml logs endpoint failed" />
            ) : mlList.length === 0 ? (
              <EmptyBlock message="no inference logs yet" />
            ) : (
              <div className="max-h-72 space-y-1 overflow-auto pr-1 font-mono text-[10px]">
                {mlList.slice(0, 12).map((log, idx) => {
                  const rule = numOrNull(log.rule_score);
                  const ml = numOrNull(log.ml_score);
                  const final = numOrNull(log.final_score);
                  const shadow = Boolean(log.shadow_mode);
                  return (
                    <div key={String(log.id ?? idx)} className="grid grid-cols-[44px_1fr_auto] items-center gap-2 rounded-sm border border-white/5 bg-slate-950/50 px-2 py-1">
                      <span className="text-slate-500">#{String(idx + 1).padStart(3, '0')}</span>
                      <div className="flex flex-wrap items-center gap-2 text-cyan-100/80">
                        <span><span className="text-slate-500">rule</span>={rule !== null ? rule.toFixed(2) : 'n/a'}</span>
                        <span><span className="text-slate-500">ml</span>={ml !== null ? ml.toFixed(2) : 'n/a'}</span>
                        <span><span className="text-slate-500">final</span>={final !== null ? final.toFixed(2) : 'n/a'}</span>
                      </div>
                      <span className={`shrink-0 rounded-sm px-1 py-0.5 text-[9px] uppercase tracking-widest ${shadow ? 'bg-violet-500/15 text-violet-200 ring-1 ring-violet-500/30' : 'bg-cyan-500/15 text-cyan-200 ring-1 ring-cyan-500/30'}`}>
                        {shadow ? 'shadow' : 'live'}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </HudFrame>
        </div>

        {/* REPLAY DECK */}
        <div className="xl:col-span-12">
          <HudFrame
            label="REPLAY DECK"
            subtitle={`/replay/${location} · /replay/run`}
            status={replay.isError ? 'critical' : 'info'}
            statusText={replayRun.isPending ? 'RUNNING' : replayStatus !== 'unknown' ? replayStatus.toUpperCase() : 'IDLE'}
            meta={[{ label: 'TARGET', value: location.toUpperCase() }]}
          >
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <Telemetry label="STATUS" value={replayStatus !== 'unknown' ? replayStatus : 'idle'} />
              <Telemetry
                label="LAST EVENT"
                value={formatScalar((replay.data as Record<string, unknown> | undefined)?.event ?? (replay.data as Record<string, unknown> | undefined)?.last_event)}
              />
              <Telemetry label="TIMESTAMP" value={relTime((replay.data as Record<string, unknown> | undefined)?.timestamp)} />
            </div>
          </HudFrame>
        </div>
      </div>
    </div>
  );
}
