'use client';

import { useDashboardUiMode } from '@/lib/ui/use-dashboard-ui-mode';
import type { SeverityTone } from './util';

export function ScoreBar({
  label,
  value,
  max = 1,
  highlight = false,
}: {
  label: string;
  value: number | null;
  max?: number;
  highlight?: boolean;
}) {
  const mode = useDashboardUiMode();
  const std = mode === 'standard';
  const v = value ?? 0;
  const pct = Math.min(100, Math.max(0, (v / max) * 100));
  const color = v >= 0.7 ? '#dc2626' : v >= 0.4 ? '#d97706' : '#059669';
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <span className={std ? 'text-xs font-medium text-slate-600' : 'font-mono text-[10px] uppercase tracking-widest text-slate-400'}>
          {label}
        </span>
        <span
          className={
            std
              ? `text-sm font-semibold tabular-nums text-slate-900 ${highlight ? 'text-base' : ''}`
              : `font-mono ${highlight ? 'text-base font-semibold text-cyan-100' : 'text-xs text-cyan-200'}`
          }
        >
          {value !== null ? value.toFixed(3) : 'n/a'}
        </span>
      </div>
      <div className={`mt-1 h-1.5 w-full overflow-hidden rounded-sm ${std ? 'bg-slate-200' : 'bg-white/5'}`}>
        <div
          className="h-full rounded-sm transition-[width] duration-500"
          style={{
            width: `${pct}%`,
            background: std ? color : `linear-gradient(90deg, ${color}88, ${color})`,
            boxShadow: std ? 'none' : `0 0 8px ${color}66`,
          }}
        />
      </div>
    </div>
  );
}

export function Telemetry({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: SeverityTone;
}) {
  const uiMode = useDashboardUiMode();
  const std = uiMode === 'standard';
  const valueColor = std
    ? tone === 'critical'
      ? 'text-red-700'
      : tone === 'warning'
        ? 'text-amber-700'
        : tone === 'nominal'
          ? 'text-emerald-700'
          : 'text-slate-900'
    : tone === 'critical'
      ? 'text-red-200'
      : tone === 'warning'
        ? 'text-amber-200'
        : tone === 'nominal'
          ? 'text-emerald-200'
          : 'text-cyan-100';
  return (
    <div
      className={
        std
          ? 'ops-stat rounded-md border border-slate-200 bg-white px-3 py-2 shadow-sm'
          : 'rounded-sm border border-white/5 bg-slate-950/50 px-2 py-1.5'
      }
    >
      <p
        className={
          std
            ? 'text-[11px] font-medium uppercase tracking-wide text-slate-500'
            : 'font-mono text-[9px] uppercase tracking-widest text-slate-500'
        }
      >
        {label}
      </p>
      <p
        className={`mt-0.5 truncate ${std ? 'text-sm font-semibold' : 'font-mono text-xs'} ${valueColor}`}
      >
        {value || 'n/a'}
      </p>
    </div>
  );
}

export function Legend({ items }: { items: { color: string; label: string }[] }) {
  return (
    <div className="mt-2 flex flex-wrap gap-3 font-mono text-[9px] uppercase tracking-widest text-slate-500">
      {items.map((it) => (
        <span key={it.label} className="flex items-center gap-1.5">
          <span className="inline-block h-1.5 w-3 rounded-sm" style={{ background: it.color }} />
          {it.label}
        </span>
      ))}
    </div>
  );
}

export function ErrorBlock({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-start gap-2 rounded-sm border border-red-500/30 bg-red-500/5 p-3">
      <p className="font-mono text-[10px] uppercase tracking-widest text-red-200">UPSTREAM FAULT · {message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="rounded-sm border border-cyan-400/40 bg-cyan-500/10 px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest text-cyan-200 hover:bg-cyan-500/15"
      >
        RETRANSMIT
      </button>
    </div>
  );
}

export function EmptyBlock({ message }: { message: string }) {
  const mode = useDashboardUiMode();
  const std = mode === 'standard';
  return (
    <div
      className={
        std
          ? 'flex h-20 flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 p-3 text-center'
          : 'flex h-20 flex-col items-center justify-center rounded-sm border border-white/5 bg-slate-950/40 p-3 text-center'
      }
    >
      <p className={std ? 'text-xs font-medium text-slate-500' : 'font-mono text-[10px] uppercase tracking-widest text-slate-500'}>
        {std ? 'No data' : 'CHANNEL CLEAR'}
      </p>
      <p className={`mt-0.5 ${std ? 'text-sm text-slate-600' : 'font-mono text-[10px] uppercase tracking-widest text-slate-600'}`}>
        {message}
      </p>
    </div>
  );
}

export function PageTitle({ eyebrow, title, children }: { eyebrow: string; title: string; children?: React.ReactNode }) {
  const mode = useDashboardUiMode();
  const std = mode === 'standard';
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <p className={std ? 'text-xs font-semibold uppercase tracking-wide text-blue-800' : 'font-mono text-[10px] uppercase tracking-[0.4em] text-cyan-400/80'}>
          {eyebrow}
        </p>
        <h1 className={`mt-1 text-2xl font-semibold tracking-tight ${std ? 'text-slate-900' : 'text-white'}`}>{title}</h1>
      </div>
      {children ? <div className="flex items-center gap-2">{children}</div> : null}
    </div>
  );
}
