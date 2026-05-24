'use client';

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { RefreshCw, Search } from 'lucide-react';
import { api } from '@/lib/api/endpoints';
import { getAlertDeliveryStatus, getAlertId, getAlertRegion, isAlertOpen } from '@/lib/api/alerts';
import { POLLING_INTERVALS, withJitter } from '@/lib/config';
import { useMission } from '@/components/dashboard/MissionContext';
import HudFrame from '@/components/dashboard/HudFrame';
import StatusLed from '@/components/dashboard/StatusLed';
import SendAlertButton from '@/components/dashboard/alerts/SendAlertButton';
import AlertContactsPanel from '@/components/dashboard/alerts/AlertContactsPanel';
import { PageTitle, ErrorBlock, EmptyBlock } from '@/components/dashboard/Atoms';
import { numOrNull, relTime, severityToTone, toArray } from '@/components/dashboard/util';
import { formatScalar } from '@/lib/api/payload';

type Severity = 'all' | 'critical' | 'high' | 'medium' | 'low';
type Status = 'all' | 'open' | 'closed';

export default function AlertsView() {
  const { activeOnly, setActiveOnly } = useMission();
  const [severity, setSeverity] = useState<Severity>('all');
  const [status, setStatus] = useState<Status>('all');
  const [region, setRegion] = useState<string>('all');
  const [query, setQuery] = useState('');

  const alertsQ = useQuery({
    queryKey: ['alerts', activeOnly, 'all'],
    queryFn: () => api.alerts(activeOnly, 100),
    refetchInterval: () => withJitter(POLLING_INTERVALS.alerts),
  });

  const alerts = useMemo(() => toArray<Record<string, unknown>>(alertsQ.data), [alertsQ.data]);

  const regions = useMemo(() => {
    const set = new Set<string>();
    alerts.forEach((a) => {
      const loc = getAlertRegion(a);
      if (loc && loc !== '—') set.add(loc);
    });
    return Array.from(set).sort();
  }, [alerts]);

  const filtered = useMemo(() => {
    return alerts.filter((a) => {
      const alertRegion = getAlertRegion(a);
      if (region !== 'all' && alertRegion.toLowerCase() !== region.toLowerCase()) return false;
      const sev = String(a.severity ?? '').toLowerCase();
      if (severity !== 'all' && sev !== severity) return false;
      const open = isAlertOpen(a);
      if (status === 'open' && !open) return false;
      if (status === 'closed' && open) return false;
      if (query.trim()) {
        const haystack = `${formatScalar(a.title)} ${formatScalar(a.message)} ${alertRegion}`.toLowerCase();
        if (!haystack.includes(query.trim().toLowerCase())) return false;
      }
      return true;
    });
  }, [alerts, region, severity, status, query]);

  const counts = useMemo(() => {
    const c = { critical: 0, high: 0, medium: 0, low: 0, open: 0, closed: 0, pending: 0 };
    alerts.forEach((a) => {
      const sev = String(a.severity ?? '').toLowerCase();
      if (sev === 'critical') c.critical += 1;
      else if (sev === 'high') c.high += 1;
      else if (sev === 'medium') c.medium += 1;
      else if (sev === 'low') c.low += 1;
      if (isAlertOpen(a)) c.open += 1;
      else c.closed += 1;
      const ds = getAlertDeliveryStatus(a).toLowerCase();
      if (ds === 'pending') c.pending += 1;
    });
    return c;
  }, [alerts]);

  return (
    <div className="space-y-3 p-3">
      <PageTitle eyebrow="Incident Bus" title="Alerts & Notifications">
        <button
          type="button"
          onClick={() => void alertsQ.refetch()}
          className="flex items-center gap-1.5 rounded-sm border border-cyan-400/40 bg-cyan-500/10 px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-cyan-200 hover:bg-cyan-500/20"
        >
          <RefreshCw size={11} /> RESYNC
        </button>
      </PageTitle>

      <div className="grid grid-cols-3 gap-2 sm:grid-cols-7">
        <SevTile label="CRITICAL" count={counts.critical} tone="critical" />
        <SevTile label="HIGH" count={counts.high} tone="critical" />
        <SevTile label="MEDIUM" count={counts.medium} tone="warning" />
        <SevTile label="LOW" count={counts.low} tone="nominal" />
        <SevTile label="OPEN" count={counts.open} tone={counts.open > 0 ? 'warning' : 'nominal'} />
        <SevTile label="CLOSED" count={counts.closed} tone="info" />
        <SevTile label="PENDING" count={counts.pending} tone={counts.pending > 0 ? 'warning' : 'idle'} />
      </div>

      <AlertContactsPanel />

      <HudFrame label="FILTER MATRIX" subtitle="severity · region · query" status="info" statusText={`${filtered.length} / ${alerts.length}`}>
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-[2fr_1fr_1fr_1fr_auto]">
          <div className="relative">
            <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search message, region…"
              className="input-hud w-full py-1.5 pl-7 pr-2"
            />
          </div>
          <Select value={severity} onChange={(v) => setSeverity(v as Severity)} label="SEVERITY"
            options={[
              { value: 'all', label: 'all' },
              { value: 'critical', label: 'critical' },
              { value: 'high', label: 'high' },
              { value: 'medium', label: 'medium' },
              { value: 'low', label: 'low' },
            ]}
          />
          <Select value={status} onChange={(v) => setStatus(v as Status)} label="STATUS"
            options={[
              { value: 'all', label: 'all' },
              { value: 'open', label: 'open' },
              { value: 'closed', label: 'closed' },
            ]}
          />
          <Select value={region} onChange={setRegion} label="REGION"
            options={[{ value: 'all', label: 'all' }, ...regions.map((r) => ({ value: r, label: r }))]}
          />
          <label className="flex cursor-pointer items-center gap-2 rounded-sm border border-cyan-400/20 bg-black/40 px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-widest text-slate-300">
            <input type="checkbox" checked={activeOnly} onChange={() => setActiveOnly(!activeOnly)} className="h-3 w-3 accent-cyan-400" />
            FETCH ACTIVE ONLY
          </label>
        </div>
      </HudFrame>

      <HudFrame label="INCIDENT TABLE" subtitle="/alerts · notify via WhatsApp" status={alertsQ.isError ? 'critical' : 'info'} statusText={alertsQ.isLoading ? 'SYNC' : 'LIVE'}>
        {alertsQ.isError ? (
          <ErrorBlock onRetry={() => void alertsQ.refetch()} message="alerts endpoint failed" />
        ) : filtered.length === 0 ? (
          <EmptyBlock message={alerts.length === 0 ? 'no alerts available' : 'no rows match current filters'} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-separate border-spacing-y-1 font-mono text-[11px]">
              <thead>
                <tr className="text-left font-mono text-[9px] uppercase tracking-[0.22em] text-slate-500">
                  <th className="px-2">·</th>
                  <th className="px-2">MESSAGE</th>
                  <th className="px-2">REGION</th>
                  <th className="px-2">SEV</th>
                  <th className="px-2">RISK</th>
                  <th className="px-2">STATUS</th>
                  <th className="px-2">DELIVERY</th>
                  <th className="px-2 text-right">TIME</th>
                  <th className="px-2 text-right">NOTIFY</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((a, idx) => {
                  const tone = severityToTone(a.severity);
                  const open = isAlertOpen(a);
                  const alertId = getAlertId(a);
                  const risk = numOrNull(a.risk_score);
                  const delivery = getAlertDeliveryStatus(a);
                  const deliveryTone =
                    delivery.toLowerCase() === 'sent'
                      ? 'text-emerald-200'
                      : delivery.toLowerCase() === 'pending'
                        ? 'text-amber-200'
                        : delivery.toLowerCase() === 'failed'
                          ? 'text-red-200'
                          : 'text-slate-400';

                  return (
                    <tr key={String(a.id ?? idx)} className="bg-slate-950/50 transition hover:bg-cyan-500/[0.04]">
                      <td className="rounded-l-sm border-y border-l border-white/5 px-2 py-1.5">
                        <StatusLed tone={tone} size={6} pulse={tone === 'critical'} />
                      </td>
                      <td className="max-w-[220px] border-y border-white/5 px-2 py-1.5">
                        <p className="truncate text-cyan-100">{formatScalar(a.message ?? a.title ?? '—')}</p>
                        <p className="truncate text-[10px] text-slate-600">#{alertId ?? '—'}</p>
                      </td>
                      <td className="border-y border-white/5 px-2 py-1.5 text-cyan-200">{getAlertRegion(a)}</td>
                      <td className="border-y border-white/5 px-2 py-1.5">
                        <span
                          className={`rounded-sm px-1.5 py-0.5 text-[9px] uppercase tracking-widest ${
                            tone === 'critical'
                              ? 'bg-red-500/15 text-red-200 ring-1 ring-red-500/30'
                              : tone === 'warning'
                                ? 'bg-amber-500/15 text-amber-200 ring-1 ring-amber-500/30'
                                : 'bg-cyan-500/15 text-cyan-200 ring-1 ring-cyan-500/30'
                          }`}
                        >
                          {formatScalar(a.severity)}
                        </span>
                      </td>
                      <td className="border-y border-white/5 px-2 py-1.5 text-cyan-100/80">
                        {risk !== null ? risk.toFixed(1) : '—'}
                      </td>
                      <td className="border-y border-white/5 px-2 py-1.5">
                        <span className={open ? 'text-amber-200' : 'text-slate-500'}>
                          {typeof a.status === 'string' ? String(a.status).toUpperCase() : open ? 'OPEN' : 'CLOSED'}
                        </span>
                      </td>
                      <td className={`border-y border-white/5 px-2 py-1.5 uppercase ${deliveryTone}`}>{delivery}</td>
                      <td className="border-y border-white/5 px-2 py-1.5 text-right text-slate-400">
                        {relTime(a.timestamp ?? a.created_at)}
                      </td>
                      <td className="rounded-r-sm border-y border-r border-white/5 px-2 py-1.5 text-right">
                        {alertId !== null && open ? (
                          <SendAlertButton alertId={alertId} compact />
                        ) : (
                          <span className="font-mono text-[9px] uppercase tracking-widest text-slate-600">—</span>
                        )}
                      </td>
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

function SevTile({ label, count, tone }: { label: string; count: number; tone: 'nominal' | 'warning' | 'critical' | 'info' | 'idle' }) {
  return (
    <div className="relative overflow-hidden rounded-md border border-cyan-400/15 bg-gradient-to-b from-[#0b1325]/95 to-[#070d1b]/95 p-2.5">
      <span className="hud-bracket hud-bracket-tl" />
      <span className="hud-bracket hud-bracket-br" />
      <div className="flex items-center justify-between">
        <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-slate-500">{label}</p>
        <StatusLed tone={tone} size={6} />
      </div>
      <p className="mt-1 font-mono text-2xl font-semibold tabular-nums text-cyan-100">{count}</p>
    </div>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="font-mono text-[9px] uppercase tracking-widest text-slate-500">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-sm border border-cyan-400/20 bg-black/50 px-2 py-1.5 font-mono text-[11px] uppercase tracking-widest text-cyan-100 focus:border-cyan-400/60 focus:outline-none"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value} className="bg-slate-950 text-cyan-100">
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
