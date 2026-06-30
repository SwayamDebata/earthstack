'use client';

import StatusLed, { type LedTone } from './StatusLed';
import { useDashboardUiMode } from '@/lib/ui/use-dashboard-ui-mode';
import { showHudChrome, statTileLabel, statTileShell, statTileValue } from '@/lib/ui/standard-surface';

export type Kpi = {
  label: string;
  value: string;
  unit?: string;
  hint?: string;
  tone?: LedTone;
  spark?: number[];
};

function Sparkline({ values, tone = 'info', std }: { values: number[]; tone?: LedTone; std: boolean }) {
  if (!values.length) return <div className="h-7 w-full" />;
  const max = Math.max(...values);
  const min = Math.min(...values);
  const span = max - min || 1;
  const w = 100;
  const h = 28;
  const step = w / Math.max(1, values.length - 1);
  const points = values
    .map((v, i) => {
      const x = i * step;
      const y = h - ((v - min) / span) * h;
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(' ');

  const stroke = std
    ? tone === 'critical'
      ? '#dc2626'
      : tone === 'warning'
        ? '#d97706'
        : tone === 'nominal'
          ? '#059669'
          : '#2563eb'
    : tone === 'critical'
      ? '#ef4444'
      : tone === 'warning'
        ? '#f59e0b'
        : tone === 'nominal'
          ? '#10b981'
          : tone === 'idle'
            ? '#64748b'
            : '#22d3ee';

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-7 w-full" preserveAspectRatio="none" aria-hidden>
      <polyline points={points} fill="none" stroke={stroke} strokeWidth={1.25} strokeLinejoin="round" strokeLinecap="round" />
      <polyline points={`0,${h} ${points} ${w},${h}`} fill={stroke} opacity={std ? 0.08 : 0.12} />
    </svg>
  );
}

export default function KpiRibbon({ kpis }: { kpis: Kpi[] }) {
  const mode = useDashboardUiMode();
  const std = mode === 'standard';

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
      {kpis.map((k) => (
        <div key={k.label} className={statTileShell(mode, 'sm')}>
          {showHudChrome(mode) ? (
            <>
              <span className="hud-bracket hud-bracket-tl" />
              <span className="hud-bracket hud-bracket-br" />
            </>
          ) : null}
          <div className="flex items-center justify-between">
            <p className={statTileLabel(mode)}>{k.label}</p>
            <StatusLed tone={k.tone ?? 'info'} size={6} pulse={!std} />
          </div>
          <p className="mt-1.5 flex items-baseline gap-1">
            <span className={statTileValue(mode, 'lg')}>{k.value}</span>
            {k.unit ? (
              <span className={std ? 'text-xs text-slate-500' : 'font-mono text-[10px] uppercase tracking-widest text-slate-500'}>
                {k.unit}
              </span>
            ) : null}
          </p>
          {k.spark && k.spark.length > 1 ? <Sparkline values={k.spark} tone={k.tone} std={std} /> : <div className="h-7" />}
          {k.hint ? (
            <p className={std ? 'text-xs text-slate-500' : 'font-mono text-[9px] uppercase tracking-widest text-slate-500'}>
              {k.hint}
            </p>
          ) : null}
        </div>
      ))}
    </div>
  );
}
