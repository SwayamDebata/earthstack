'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { getAlertId, getAlertRegion, isAlertOpen } from '@/lib/api/alerts';
import SendAlertButton from '@/components/dashboard/alerts/SendAlertButton';
import StatusLed from '@/components/dashboard/StatusLed';
import { relTime, severityToTone } from '@/components/dashboard/util';
import { useDashboardUiMode } from '@/lib/ui/use-dashboard-ui-mode';
import { listRow, listRowMeta } from '@/lib/ui/standard-surface';

export default function LiveIncidentFeed({
  alerts,
  isLoading,
}: {
  alerts: Record<string, unknown>[];
  isLoading?: boolean;
}) {
  const mode = useDashboardUiMode();
  const std = mode === 'standard';
  const open = alerts.filter((a) => isAlertOpen(a));

  return (
    <section
      className={
        std
          ? 'rounded-lg border border-slate-200 bg-white p-4 shadow-sm'
          : 'rounded-md border border-white/8 bg-[#060b18]/90 p-4'
      }
    >
      <div className="mb-3 flex items-center justify-between">
        <p className={std ? 'text-sm font-semibold text-slate-800' : 'font-mono text-[10px] uppercase tracking-[0.22em] text-cyan-200'}>
          {std ? 'Open incidents' : 'Coordination · Live incident feed'}
        </p>
        <Link
          href="/dashboard/alerts"
          className={std ? 'flex items-center gap-0.5 text-xs font-medium text-blue-700 hover:underline' : 'flex items-center gap-0.5 font-mono text-[10px] uppercase tracking-widest text-slate-500 hover:text-cyan-200'}
        >
          Full alerts <ChevronRight size={11} />
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className={`h-12 animate-pulse rounded-md ${std ? 'bg-slate-100' : 'bg-white/5'}`} />
          ))}
        </div>
      ) : open.length === 0 ? (
        <p className={std ? 'rounded-lg border border-dashed border-slate-300 bg-slate-50 p-3 text-sm text-slate-600' : 'rounded-sm border border-white/5 bg-slate-950/40 p-3 font-mono text-[10px] uppercase tracking-widest text-slate-500'}>
          {std ? 'No open incidents' : 'No open incidents in queue'}
        </p>
      ) : (
        <ul className="max-h-64 space-y-1.5 overflow-auto pr-1">
          {open.slice(0, 8).map((alert) => {
            const id = getAlertId(alert);
            const region = getAlertRegion(alert);
            const sev = String(alert.severity ?? 'n/a');
            const tone = severityToTone(alert.severity);
            return (
              <li key={String(alert.id ?? alert.timestamp)} className={`grid grid-cols-[14px_1fr_auto] items-center gap-2 ${listRow(mode)}`}>
                <StatusLed tone={tone} size={6} pulse={!std && tone === 'critical'} />
                <div className="min-w-0">
                  <p className={`truncate ${std ? 'text-sm font-medium text-slate-900' : 'text-sm text-slate-100'}`}>
                    {String(alert.message ?? alert.title ?? 'Incident')}
                  </p>
                  <p className={listRowMeta(mode)}>
                    {region} · {sev} · {relTime(alert.timestamp)}
                  </p>
                </div>
                {id !== null ? <SendAlertButton alertId={id} compact /> : null}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
