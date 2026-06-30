import type { UiMode } from '@/lib/access/ui-mode';

export type SurfaceTone = 'nominal' | 'warning' | 'critical' | 'info' | 'idle';

export function isStd(mode: UiMode) {
  return mode === 'standard';
}

/** KPI / summary count tile */
export function statTileShell(mode: UiMode, pad: 'sm' | 'md' = 'md') {
  const p = pad === 'sm' ? 'p-2.5' : 'p-3';
  return isStd(mode)
    ? `rounded-lg border border-slate-200 bg-white ${p} shadow-sm`
    : `relative overflow-hidden rounded-md border border-cyan-400/15 bg-gradient-to-b from-[#0b1325]/95 to-[#070d1b]/95 ${p}`;
}

export function statTileLabel(mode: UiMode) {
  return isStd(mode)
    ? 'text-[11px] font-medium uppercase tracking-wide text-slate-500'
    : 'font-mono text-[9px] uppercase tracking-[0.22em] text-slate-500';
}

export function statTileValue(mode: UiMode, size: 'lg' | 'xl' = 'xl') {
  const sz = size === 'lg' ? 'text-xl' : 'text-2xl';
  return isStd(mode)
    ? `${sz} font-semibold tabular-nums text-slate-900`
    : `font-mono ${sz} font-semibold tabular-nums text-cyan-100`;
}

export function panelCard(mode: UiMode) {
  return isStd(mode)
    ? 'rounded-lg border border-slate-200 bg-white p-4 shadow-sm'
    : 'relative overflow-hidden rounded-md border border-cyan-400/15 bg-[#060b18]/95 p-3';
}

export function listRow(mode: UiMode) {
  return isStd(mode)
    ? 'rounded-md border border-slate-200 bg-white px-3 py-2'
    : 'rounded-sm border border-white/5 bg-slate-950/50 px-2 py-1.5';
}

export function listRowPrimary(mode: UiMode) {
  return isStd(mode) ? 'text-sm font-medium text-slate-900' : 'truncate text-cyan-100';
}

export function listRowMeta(mode: UiMode) {
  return isStd(mode) ? 'text-xs text-slate-500' : 'truncate text-[10px] text-slate-500';
}

export function severityBadge(tone: SurfaceTone, mode: UiMode) {
  if (!isStd(mode)) {
    const cmd: Record<SurfaceTone, string> = {
      critical: 'bg-red-500/15 text-red-200 ring-1 ring-red-500/30',
      warning: 'bg-amber-500/15 text-amber-200 ring-1 ring-amber-500/30',
      nominal: 'bg-emerald-500/15 text-emerald-200 ring-1 ring-emerald-500/30',
      info: 'bg-cyan-500/15 text-cyan-200 ring-1 ring-cyan-500/30',
      idle: 'bg-slate-500/15 text-slate-300 ring-1 ring-slate-500/30',
    };
    return `rounded-sm px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-widest ${cmd[tone]}`;
  }
  const gov: Record<SurfaceTone, string> = {
    critical: 'border border-red-300 bg-red-50 text-red-900',
    warning: 'border border-amber-300 bg-amber-50 text-amber-950',
    nominal: 'border border-emerald-300 bg-emerald-50 text-emerald-950',
    info: 'border border-blue-300 bg-blue-50 text-blue-900',
    idle: 'border border-slate-300 bg-slate-50 text-slate-700',
  };
  return `rounded-md px-2 py-0.5 text-xs font-semibold ${gov[tone]}`;
}

export function btnSecondary(mode: UiMode) {
  return isStd(mode)
    ? 'inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50'
    : 'flex items-center gap-1.5 rounded-sm border border-cyan-400/40 bg-cyan-500/10 px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-cyan-200 hover:bg-cyan-500/20';
}

export function selectField(mode: UiMode) {
  return isStd(mode)
    ? 'rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'
    : 'rounded-sm border border-cyan-400/20 bg-black/50 px-2 py-1.5 font-mono text-[11px] uppercase tracking-widest text-cyan-100 focus:border-cyan-400/60 focus:outline-none';
}

export function fieldLabel(mode: UiMode) {
  return isStd(mode)
    ? 'text-xs font-medium text-slate-600'
    : 'font-mono text-[9px] uppercase tracking-widest text-slate-500';
}

export function chartGridStroke(mode: UiMode) {
  return isStd(mode) ? '#e2e8f0' : '#1e293b';
}

export function chartAxisStroke(mode: UiMode) {
  return isStd(mode) ? '#64748b' : '#475569';
}

export function chartTooltip(mode: UiMode) {
  return isStd(mode)
    ? {
        contentStyle: { background: '#ffffff', border: '1px solid #cbd5e1', fontSize: 12, borderRadius: 6 },
        labelStyle: { color: '#0f172a', fontWeight: 600 },
      }
    : {
        contentStyle: { background: '#020617', border: '1px solid #22d3ee55', fontFamily: 'monospace', fontSize: 11 },
        labelStyle: { color: '#67e8f9' },
      };
}

export function tableRow(mode: UiMode) {
  return isStd(mode) ? 'bg-white hover:bg-slate-50' : 'bg-slate-950/50';
}

export function tableCell(mode: UiMode) {
  return isStd(mode) ? 'border-slate-200 text-slate-800' : 'border-white/5';
}

export function showHudChrome(mode: UiMode) {
  return !isStd(mode);
}
