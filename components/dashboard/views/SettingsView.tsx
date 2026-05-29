'use client';

import { useState } from 'react';
import { useQueries } from '@tanstack/react-query';
import { Check, Copy, RefreshCw, ShieldAlert, ShieldCheck } from 'lucide-react';
import { api } from '@/lib/api/endpoints';
import { LOCATIONS, MAPBOX_TOKEN, POLLING_INTERVALS, STALE_THRESHOLDS_MS, withJitter } from '@/lib/config';
import { useMission } from '@/components/dashboard/MissionContext';
import HudFrame from '@/components/dashboard/HudFrame';
import StatusLed from '@/components/dashboard/StatusLed';
import AlertDeliverySettings from '@/components/dashboard/alerts/AlertDeliverySettings';
import { PageTitle, Telemetry } from '@/components/dashboard/Atoms';
import { formatScalar } from '@/lib/api/payload';

const ENDPOINTS = [
  { id: 'health', label: 'Health', path: '/health' },
  { id: 'risk-map', label: 'Risk Map', path: '/risk/map' },
  { id: 'alerts', label: 'Alerts', path: '/alerts' },
  { id: 'rainfall-stats', label: 'Rainfall Stats', path: '/rainfall/stats' },
] as const;

export default function SettingsView() {
  const { location, setLocation, activeOnly, setActiveOnly, latencyMs } = useMission();

  // Reuse the shell's cache keys so the diagnostics panel does not double-fire
  // these endpoints. This page only adds `rainfall-stats` on top of what the
  // shell already polls.
  const queries = useQueries({
    queries: [
      { queryKey: ['health'], queryFn: () => api.health(), refetchInterval: () => withJitter(POLLING_INTERVALS.health) },
      { queryKey: ['risk-map'], queryFn: () => api.riskMap(), refetchInterval: () => withJitter(POLLING_INTERVALS.map) },
      { queryKey: ['alerts', true], queryFn: () => api.alerts(true, 20), refetchInterval: () => withJitter(POLLING_INTERVALS.alerts) },
      { queryKey: ['rainfall-stats'], queryFn: () => api.rainfallStats(), refetchInterval: () => withJitter(POLLING_INTERVALS.rainfall) },
    ],
  });

  const [copied, setCopied] = useState<string | null>(null);
  const apiBaseClient = '/api/proxy/* (browser-side, set via NEXT_PUBLIC_API_BASE_URL or default)';
  const proxyTimeout = process.env.NEXT_PUBLIC_API_TIMEOUT ?? 'inherits API_UPSTREAM_TIMEOUT_MS (45s default)';

  const copy = async (key: string, value: string) => {
    if (typeof navigator === 'undefined' || !navigator.clipboard) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopied(key);
      setTimeout(() => setCopied((k) => (k === key ? null : k)), 1200);
    } catch {
      // ignored: clipboard may be blocked
    }
  };

  const mapboxOk = Boolean(MAPBOX_TOKEN && MAPBOX_TOKEN.length > 10);
  const maskedMapbox = MAPBOX_TOKEN ? `${MAPBOX_TOKEN.slice(0, 8)}…${MAPBOX_TOKEN.slice(-6)}` : 'not set';

  return (
    <div className="space-y-3 p-3">
      <PageTitle eyebrow="Settings" title="Configuration & Diagnostics">
        <button
          type="button"
          onClick={() => queries.forEach((q) => void q.refetch())}
          className="flex items-center gap-1.5 rounded-sm border border-cyan-400/40 bg-cyan-500/10 px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-cyan-200 hover:bg-cyan-500/20"
        >
          <RefreshCw size={11} /> RUN DIAGNOSTICS
        </button>
      </PageTitle>

      <AlertDeliverySettings />

      <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
        <HudFrame label="OPERATOR PREFERENCES" subtitle="local · persisted to localStorage" status="info" statusText="LIVE">
          <div className="space-y-3">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-widest text-slate-400">DEFAULT REGION</p>
              <div className="mt-1.5 flex flex-wrap gap-1">
                {LOCATIONS.map((loc) => (
                  <button
                    key={loc}
                    type="button"
                    onClick={() => setLocation(loc)}
                    className={`rounded-sm px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest transition ${
                      location === loc
                        ? 'bg-cyan-500/20 text-cyan-100 shadow-[inset_0_0_0_1px_rgba(34,211,238,0.45)]'
                        : 'border border-cyan-400/15 bg-black/40 text-slate-400 hover:text-cyan-200'
                    }`}
                  >
                    {loc}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="font-mono text-[10px] uppercase tracking-widest text-slate-400">ALERTS FILTER</p>
              <div className="mt-1.5 flex gap-1">
                <button
                  type="button"
                  onClick={() => setActiveOnly(true)}
                  className={`rounded-sm px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest transition ${
                    activeOnly ? 'bg-cyan-500/20 text-cyan-100 shadow-[inset_0_0_0_1px_rgba(34,211,238,0.45)]' : 'border border-cyan-400/15 bg-black/40 text-slate-400'
                  }`}
                >
                  ACTIVE ONLY
                </button>
                <button
                  type="button"
                  onClick={() => setActiveOnly(false)}
                  className={`rounded-sm px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest transition ${
                    !activeOnly ? 'bg-cyan-500/20 text-cyan-100 shadow-[inset_0_0_0_1px_rgba(34,211,238,0.45)]' : 'border border-cyan-400/15 bg-black/40 text-slate-400'
                  }`}
                >
                  ALL
                </button>
              </div>
            </div>

            <p className="rounded-sm border border-white/5 bg-slate-950/50 p-2 font-mono text-[10px] uppercase tracking-widest text-slate-500">
              These preferences persist in localStorage as <span className="text-cyan-200">modelearth:location</span> and <span className="text-cyan-200">modelearth:active-only</span>.
            </p>
          </div>
        </HudFrame>

        <HudFrame label="ENVIRONMENT" subtitle="public configuration · secrets masked" status={mapboxOk ? 'nominal' : 'warning'} statusText={mapboxOk ? 'OK' : 'CHECK'}>
          <div className="space-y-2">
            <EnvRow
              label="MAPBOX TOKEN"
              value={maskedMapbox}
              ok={mapboxOk}
              copied={copied === 'mapbox'}
              onCopy={() => copy('mapbox', MAPBOX_TOKEN)}
              hint={mapboxOk ? 'NEXT_PUBLIC_MAPBOX_TOKEN' : 'set NEXT_PUBLIC_MAPBOX_TOKEN in .env.local'}
            />
            <EnvRow
              label="API BASE (BROWSER)"
              value={apiBaseClient}
              ok
              copied={copied === 'apiBrowser'}
              onCopy={() => copy('apiBrowser', '/api/proxy')}
              hint="all browser requests are proxied via Next.js"
            />
            <EnvRow
              label="API BASE (SERVER)"
              value="API_BASE_URL (server-side, see runtime env)"
              ok
              copied={copied === 'apiServer'}
              onCopy={() => copy('apiServer', 'API_BASE_URL')}
              hint="defaults to https://api.modelearth.in"
            />
            <EnvRow
              label="UPSTREAM TIMEOUT"
              value={String(proxyTimeout)}
              ok
              copied={copied === 'timeout'}
              onCopy={() => copy('timeout', String(proxyTimeout))}
              hint="API_UPSTREAM_TIMEOUT_MS"
            />
          </div>
        </HudFrame>

        <HudFrame label="POLLING INTERVALS" subtitle="ms · per channel" status="info" statusText="ACTIVE">
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(POLLING_INTERVALS).map(([k, v]) => (
              <Telemetry key={k} label={k} value={v ? `${v / 1000}s` : 'on-demand'} />
            ))}
          </div>
          <p className="mt-3 font-mono text-[9px] uppercase tracking-widest text-slate-500">
            Static, ship-time defaults. Tune in <span className="text-cyan-200">lib/config.ts → POLLING_INTERVALS</span>.
          </p>
        </HudFrame>

        <HudFrame label="STALE THRESHOLDS" subtitle="ms · staleness alerts" status="info" statusText="ACTIVE">
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(STALE_THRESHOLDS_MS).map(([k, v]) => (
              <Telemetry key={k} label={k} value={`${(v / 60_000).toFixed(0)}m`} />
            ))}
          </div>
        </HudFrame>

        <HudFrame label="ENDPOINT DIAGNOSTICS" subtitle="health probe · live" status="info" statusText={`${queries.filter((q) => !q.isError).length}/${queries.length}`}>
          <div className="space-y-1.5 font-mono text-[11px]">
            {ENDPOINTS.map((ep, i) => {
              const q = queries[i];
              const tone = q.isError ? 'critical' : q.isLoading ? 'warning' : 'nominal';
              const updatedAt = q.dataUpdatedAt ? new Date(q.dataUpdatedAt).toLocaleTimeString() : 'n/a';
              const status = formatScalar((q.data as Record<string, unknown> | undefined)?.status);
              return (
                <div key={ep.id} className="grid grid-cols-[18px_1fr_1fr_auto] items-center gap-2 rounded-sm border border-white/5 bg-slate-950/50 px-2 py-1.5">
                  <StatusLed tone={tone} size={6} pulse={q.isLoading} />
                  <span className="text-cyan-200">{ep.label}</span>
                  <span className="truncate text-slate-400">{ep.path}</span>
                  <span className="text-[10px] uppercase tracking-widest text-slate-500">{q.isError ? 'fault' : status !== 'unknown' ? status : updatedAt}</span>
                </div>
              );
            })}
          </div>
        </HudFrame>

        <HudFrame label="SESSION TELEMETRY" subtitle="this browser · session" status="info" statusText="LIVE">
          <div className="grid grid-cols-2 gap-2">
            <Telemetry label="ACTIVE REGION" value={location} />
            <Telemetry label="ACTIVE FILTER" value={activeOnly ? 'open only' : 'all'} />
            <Telemetry
              label="API LATENCY"
              value={`${latencyMs} ms`}
              tone={latencyMs > 800 ? 'critical' : latencyMs > 300 ? 'warning' : 'nominal'}
            />
            <Telemetry
              label="USER AGENT"
              value={typeof navigator !== 'undefined' ? navigator.userAgent.slice(0, 40) : 'n/a'}
            />
            <Telemetry
              label="VIEWPORT"
              value={typeof window !== 'undefined' ? `${window.innerWidth}×${window.innerHeight}` : 'n/a'}
            />
            <Telemetry label="THEME" value="mission-control · dark" />
          </div>
        </HudFrame>
      </div>
    </div>
  );
}

function EnvRow({
  label,
  value,
  ok,
  copied,
  onCopy,
  hint,
}: {
  label: string;
  value: string;
  ok: boolean;
  copied: boolean;
  onCopy: () => void;
  hint?: string;
}) {
  return (
    <div className="rounded-sm border border-white/5 bg-slate-950/50 p-2">
      <div className="flex items-center justify-between gap-3">
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-slate-500">{label}</p>
        <div className="flex items-center gap-1.5">
          {ok ? <ShieldCheck size={12} className="text-emerald-400" /> : <ShieldAlert size={12} className="text-amber-300" />}
          <button
            type="button"
            onClick={onCopy}
            className="flex items-center gap-1 rounded-sm border border-white/10 bg-black/40 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-widest text-slate-300 hover:border-cyan-400/30 hover:text-cyan-200"
          >
            {copied ? <Check size={10} /> : <Copy size={10} />}
            {copied ? 'COPIED' : 'COPY'}
          </button>
        </div>
      </div>
      <p className="mt-1 truncate font-mono text-[11px] text-cyan-100/90">{value}</p>
      {hint ? <p className="mt-1 font-mono text-[9px] uppercase tracking-widest text-slate-600">{hint}</p> : null}
    </div>
  );
}
