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
import StatTile from '@/components/dashboard/StatTile';
import { PageTitle, ErrorBlock, EmptyBlock } from '@/components/dashboard/Atoms';
import { useDashboardUiMode } from '@/lib/ui/use-dashboard-ui-mode';
import { btnSecondary, fieldLabel, selectField, severityBadge, tableCell, tableRow } from '@/lib/ui/standard-surface';
import { numOrNull, relTime, severityToTone, toArray } from '@/components/dashboard/util';
import { formatScalar } from '@/lib/api/payload';

type Severity = 'all' | 'critical' | 'high' | 'medium' | 'low';
type Status = 'all' | 'open' | 'closed';

export default function AlertsView() {
  const { activeOnly, setActiveOnly } = useMission();
  const mode = useDashboardUiMode();
  const std = mode === 'standard';
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
      if (loc && loc !== 'n/a') set.add(loc);
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
          className={btnSecondary(mode)}
        >
          <RefreshCw size={11} /> RESYNC
        </button>
      </PageTitle>

      <div className="grid grid-cols-3 gap-2 sm:grid-cols-7">
        <StatTile label="CRITICAL" value={String(counts.critical)} tone="critical" size="sm" valueSize="lg" />
        <StatTile label="HIGH" value={String(counts.high)} tone="critical" size="sm" valueSize="lg" />
        <StatTile label="MEDIUM" value={String(counts.medium)} tone="warning" size="sm" valueSize="lg" />
        <StatTile label="LOW" value={String(counts.low)} tone="nominal" size="sm" valueSize="lg" />
        <StatTile label="OPEN" value={String(counts.open)} tone={counts.open > 0 ? 'warning' : 'nominal'} size="sm" valueSize="lg" />
        <StatTile label="CLOSED" value={String(counts.closed)} tone="info" size="sm" valueSize="lg" />
        <StatTile label="PENDING" value={String(counts.pending)} tone={counts.pending > 0 ? 'warning' : 'idle'} size="sm" valueSize="lg" />
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
          <Select mode={mode} value={severity} onChange={(v) => setSeverity(v as Severity)} label="SEVERITY"
            options={[
              { value: 'all', label: 'all' },
              { value: 'critical', label: 'critical' },
              { value: 'high', label: 'high' },
              { value: 'medium', label: 'medium' },
              { value: 'low', label: 'low' },
            ]}
          />
          <Select mode={mode} value={status} onChange={(v) => setStatus(v as Status)} label="STATUS"
            options={[
              { value: 'all', label: 'all' },
              { value: 'open', label: 'open' },
              { value: 'closed', label: 'closed' },
            ]}
          />
          <Select mode={mode} value={region} onChange={setRegion} label="REGION"
            options={[{ value: 'all', label: 'all' }, ...regions.map((r) => ({ value: r, label: r }))]}
          />
          <label className={`flex cursor-pointer items-center gap-2 rounded-md px-2.5 py-1.5 ${std ? 'border border-slate-300 bg-white text-xs font-medium text-slate-700' : 'rounded-sm border border-cyan-400/20 bg-black/40 font-mono text-[10px] uppercase tracking-widest text-slate-300'}`}>
            <input type="checkbox" checked={activeOnly} onChange={() => setActiveOnly(!activeOnly)} className="h-3 w-3 accent-blue-600" />
            {std ? 'Active only' : 'FETCH ACTIVE ONLY'}
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
            <table className={`w-full border-separate border-spacing-y-1 ${std ? 'text-sm' : 'font-mono text-[11px]'}`}>
              <thead>
                <tr className={std ? 'text-left text-xs font-semibold uppercase tracking-wide text-slate-500' : 'text-left font-mono text-[9px] uppercase tracking-[0.22em] text-slate-500'}>
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
                  const deliveryTone = std
                    ? delivery.toLowerCase() === 'sent'
                      ? 'text-emerald-700 font-medium'
                      : delivery.toLowerCase() === 'pending'
                        ? 'text-amber-700 font-medium'
                        : delivery.toLowerCase() === 'failed'
                          ? 'text-red-700 font-medium'
                          : 'text-slate-500'
                    : delivery.toLowerCase() === 'sent'
                      ? 'text-emerald-200'
                      : delivery.toLowerCase() === 'pending'
                        ? 'text-amber-200'
                        : delivery.toLowerCase() === 'failed'
                          ? 'text-red-200'
                          : 'text-slate-400';

                  return (
                    <tr key={String(a.id ?? idx)} className={tableRow(mode)}>
                      <td className={`rounded-l-md border-y border-l px-2 py-1.5 ${tableCell(mode)}`}>
                        <StatusLed tone={tone} size={6} pulse={!std && tone === 'critical'} />
                      </td>
                      <td className={`max-w-[220px] border-y px-2 py-1.5 ${tableCell(mode)}`}>
                        <p className={`truncate ${std ? 'font-medium text-slate-900' : 'text-cyan-100'}`}>{formatScalar(a.message ?? a.title ?? 'n/a')}</p>
                        <p className={`truncate text-xs ${std ? 'text-slate-500' : 'text-[10px] text-slate-600'}`}>#{alertId ?? 'n/a'}</p>
                      </td>
                      <td className={`border-y px-2 py-1.5 ${std ? 'text-slate-800' : 'text-cyan-200'} ${tableCell(mode)}`}>{getAlertRegion(a)}</td>
                      <td className={`border-y px-2 py-1.5 ${tableCell(mode)}`}>
                        <span className={severityBadge(tone, mode)}>{formatScalar(a.severity)}</span>
                      </td>
                      <td className={`border-y px-2 py-1.5 tabular-nums ${tableCell(mode)}`}>
                        {risk !== null ? risk.toFixed(1) : 'n/a'}
                      </td>
                      <td className={`border-y px-2 py-1.5 ${tableCell(mode)}`}>
                        <span className={open ? (std ? 'font-medium text-amber-800' : 'text-amber-200') : std ? 'text-slate-500' : 'text-slate-500'}>
                          {typeof a.status === 'string' ? String(a.status).toUpperCase() : open ? 'OPEN' : 'CLOSED'}
                        </span>
                      </td>
                      <td className={`border-y px-2 py-1.5 uppercase ${deliveryTone} ${tableCell(mode)}`}>{delivery}</td>
                      <td className={`border-y px-2 py-1.5 text-right ${std ? 'text-slate-500' : 'text-slate-400'} ${tableCell(mode)}`}>
                        {relTime(a.timestamp ?? a.created_at)}
                      </td>
                      <td className={`rounded-r-md border-y border-r px-2 py-1.5 text-right ${tableCell(mode)}`}>
                        {alertId !== null && open ? (
                          <SendAlertButton alertId={alertId} compact />
                        ) : (
                          <span className={std ? 'text-xs text-slate-400' : 'font-mono text-[9px] uppercase tracking-widest text-slate-600'}>-</span>
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

function Select({
  mode,
  label,
  value,
  onChange,
  options,
}: {
  mode: import('@/lib/access/ui-mode').UiMode;
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className={fieldLabel(mode)}>{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className={selectField(mode)}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
