'use client';

import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { useQueries } from '@tanstack/react-query';
import { Wifi, WifiOff } from 'lucide-react';
import { api } from '@/lib/api/endpoints';
import { isAlertOpen } from '@/lib/api/alerts';
import { POLLING_INTERVALS, withJitter } from '@/lib/config';
import { formatScalar } from '@/lib/api/payload';
import StatusLed from '@/components/dashboard/StatusLed';
import MissionClock from '@/components/dashboard/MissionClock';
import MissionNav from '@/components/dashboard/MissionNav';
import LiveTicker, { type TickItem } from '@/components/dashboard/LiveTicker';
import { useMission } from '@/components/dashboard/MissionContext';

const num = (v: unknown) => (typeof v === 'number' ? v : typeof v === 'string' ? Number(v) : Number.NaN);

const toArray = <T,>(payload: unknown): T[] => {
  if (Array.isArray(payload)) return payload as T[];
  if (payload && typeof payload === 'object') {
    const obj = payload as Record<string, unknown>;
    if (Array.isArray(obj.data)) return obj.data as T[];
    if (Array.isArray(obj.alerts)) return obj.alerts as T[];
    if (Array.isArray(obj.results)) return obj.results as T[];
    if (Array.isArray(obj.items)) return obj.items as T[];
  }
  return [];
};

function severityToTone(s: unknown): 'critical' | 'warning' | 'nominal' | 'info' {
  const v = String(s ?? '').toLowerCase();
  if (v === 'critical' || v === 'high') return 'critical';
  if (v === 'medium' || v === 'warning' || v === 'warn') return 'warning';
  if (v === 'low' || v === 'normal' || v === 'ok') return 'nominal';
  return 'info';
}

type Tone = 'nominal' | 'warning' | 'critical' | 'info' | 'idle';

/**
 * Shell that wraps every /dashboard/* page.
 * Renders the top command strip, left mission nav, content slot, and bottom telemetry ticker.
 * Holds the chrome-level queries (health, risk-map, alerts) and feeds the ticker.
 */
export default function MissionShell({ children }: { children: ReactNode }) {
  const { latencyMs } = useMission();
  const [online, setOnline] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    setOnline(window.navigator.onLine);
    const onUp = () => setOnline(true);
    const onDown = () => setOnline(false);
    window.addEventListener('online', onUp);
    window.addEventListener('offline', onDown);
    return () => {
      window.removeEventListener('online', onUp);
      window.removeEventListener('offline', onDown);
    };
  }, []);

  const [health, riskMap, alerts] = useQueries({
    queries: [
      { queryKey: ['health'], queryFn: () => api.health(), refetchInterval: () => withJitter(POLLING_INTERVALS.health) },
      { queryKey: ['risk-map'], queryFn: () => api.riskMap(), refetchInterval: () => withJitter(POLLING_INTERVALS.map) },
      { queryKey: ['alerts', true], queryFn: () => api.alerts(true, 20), refetchInterval: () => withJitter(POLLING_INTERVALS.alerts) },
    ],
  });

  const riskMapList = toArray<Record<string, unknown>>(riskMap.data);
  const alertsList = toArray<Record<string, unknown>>(alerts.data);

  const highRiskCount = riskMapList.filter((r) => {
    const sev = String(r.severity ?? r.level ?? '').toLowerCase();
    return sev === 'high' || sev === 'critical';
  }).length;
  const activeAlerts = alertsList.filter((a) => isAlertOpen(a)).length;

  const healthStatus = formatScalar((health.data as Record<string, unknown> | undefined)?.status);
  const healthTone: Tone = health.isError ? 'critical' : 'nominal';
  const criticalErrors = [health, riskMap].filter((q) => q.isError).length;

  const ticker: TickItem[] = useMemo(() => {
    const items: TickItem[] = [];
    if (health.data) items.push({ channel: 'HEALTH', text: healthStatus, tone: healthTone });
    if (highRiskCount > 0) items.push({ channel: 'ZONES', text: `${highRiskCount} high-risk regions`, tone: 'critical' });
    if (activeAlerts > 0) items.push({ channel: 'ALERTS', text: `${activeAlerts} active in queue`, tone: 'warning' });
    alertsList.slice(0, 5).forEach((a) => {
      items.push({
        channel: 'INC',
        text: `${String(a.message ?? a.title ?? 'event')} · ${String(a.region ?? a.location ?? '')}`,
        tone: severityToTone(a.severity),
      });
    });
    riskMapList.slice(0, 4).forEach((r) => {
      const score = num(r.final_score ?? r.risk_score);
      const loc = String(r.location ?? r.district ?? r.name ?? '');
      if (loc) {
        items.push({
          channel: 'RISK',
          text: `${loc.toUpperCase()} · ${Number.isFinite(score) ? score.toFixed(2) : 'n/a'}`,
          tone: severityToTone(r.severity),
        });
      }
    });
    return items.length ? items : [{ channel: 'SYS', text: 'awaiting upstream telemetry', tone: 'idle' }];
  }, [health.data, healthStatus, healthTone, highRiskCount, activeAlerts, alertsList, riskMapList]);

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-[#03070f] text-slate-100">
      {/* TOP COMMAND STRIP */}
      <header className="relative z-30 flex h-14 shrink-0 items-center justify-between gap-4 border-b border-cyan-400/15 bg-gradient-to-b from-[#0a1224] to-[#04080f] px-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-sm border border-cyan-400/40 bg-cyan-500/10 font-mono text-[10px] font-bold tracking-widest text-cyan-300">
              ME
            </div>
            <div className="leading-none">
              <p className="text-sm font-semibold tracking-wide text-white">ModelEarth · MCC</p>
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-cyan-400/70">Mission Control · v1.0</p>
            </div>
          </div>
          <div className="hidden h-6 w-px bg-white/10 md:block" />
          <div className="hidden md:block">
            <MissionClock />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em]">
          <Indicator label="HEALTH" value={health.isError ? 'unknown' : healthStatus} tone={healthTone} />
          <Indicator label="LAT" value={`${latencyMs}ms`} tone={latencyMs > 800 ? 'critical' : latencyMs > 300 ? 'warning' : 'nominal'} />
          <Indicator
            label="LINK"
            value={online ? 'online' : 'offline'}
            tone={online ? 'nominal' : 'critical'}
            icon={online ? Wifi : WifiOff}
          />
          <Indicator label="ZONES" value={`${highRiskCount} hi`} tone={highRiskCount > 0 ? 'critical' : 'nominal'} />
          <Indicator label="ALERTS" value={`${activeAlerts} act`} tone={activeAlerts > 0 ? 'warning' : 'nominal'} />
        </div>
      </header>

      {criticalErrors > 0 ? (
        <div className="z-30 border-b border-amber-500/40 bg-amber-500/10 px-4 py-1.5 font-mono text-[10px] uppercase tracking-widest text-amber-100">
          DEGRADED MODE · {criticalErrors} core endpoint(s) failing · widgets remain isolated
        </div>
      ) : null}

      <div className="flex min-h-0 flex-1">
        <div className="hidden h-full w-12 shrink-0 md:block">
          <MissionNav />
        </div>
        <main className="min-w-0 flex-1 overflow-auto">{children}</main>
      </div>

      <LiveTicker items={ticker} />
    </div>
  );
}

function Indicator({
  label,
  value,
  tone,
  icon: Icon,
}: {
  label: string;
  value: string;
  tone: Tone;
  icon?: React.ComponentType<{ size?: number; strokeWidth?: number }>;
}) {
  const color =
    tone === 'critical'
      ? 'text-red-300 border-red-500/40 bg-red-500/10'
      : tone === 'warning'
        ? 'text-amber-200 border-amber-500/40 bg-amber-500/10'
        : tone === 'nominal'
          ? 'text-emerald-200 border-emerald-500/40 bg-emerald-500/10'
          : tone === 'idle'
            ? 'text-slate-300 border-white/10 bg-white/5'
            : 'text-cyan-200 border-cyan-500/30 bg-cyan-500/10';
  return (
    <span className={`flex items-center gap-1.5 rounded-sm border px-2 py-1 ${color}`}>
      {Icon ? <Icon size={11} strokeWidth={1.6} /> : <StatusLed tone={tone === 'idle' ? 'idle' : tone} size={6} />}
      <span className="text-slate-400">{label}</span>
      <span>{value}</span>
    </span>
  );
}
