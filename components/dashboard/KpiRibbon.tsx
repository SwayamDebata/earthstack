'use client';

import StatusLed, { type LedTone } from './StatusLed';

export type Kpi = {
  label: string;
  value: string;
  unit?: string;
  hint?: string;
  tone?: LedTone;
  spark?: number[];
};

function Sparkline({ values, tone = 'info' }: { values: number[]; tone?: LedTone }) {
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

  const stroke =
    tone === 'critical'
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
      <polyline
        points={`0,${h} ${points} ${w},${h}`}
        fill={stroke}
        opacity={0.12}
      />
    </svg>
  );
}

export default function KpiRibbon({ kpis }: { kpis: Kpi[] }) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
      {kpis.map((k) => (
        <div
          key={k.label}
          className="relative overflow-hidden rounded-md border border-cyan-400/15 bg-gradient-to-b from-[#0b1325]/95 to-[#070d1b]/95 p-2.5"
        >
          <span className="hud-bracket hud-bracket-tl" />
          <span className="hud-bracket hud-bracket-br" />
          <div className="flex items-center justify-between">
            <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-slate-500">{k.label}</p>
            <StatusLed tone={k.tone ?? 'info'} size={6} />
          </div>
          <p className="mt-1.5 flex items-baseline gap-1">
            <span className="font-mono text-xl font-semibold text-cyan-100 tabular-nums tracking-tight">{k.value}</span>
            {k.unit ? <span className="font-mono text-[10px] uppercase tracking-widest text-slate-500">{k.unit}</span> : null}
          </p>
          {k.spark && k.spark.length > 1 ? <Sparkline values={k.spark} tone={k.tone} /> : <div className="h-7" />}
          {k.hint ? <p className="font-mono text-[9px] uppercase tracking-widest text-slate-500">{k.hint}</p> : null}
        </div>
      ))}
    </div>
  );
}
