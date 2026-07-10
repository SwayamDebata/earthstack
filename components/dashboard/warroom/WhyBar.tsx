'use client';

import type { WhyFactor } from '@/lib/api/schemas';
import type { UiMode } from '@/lib/access/ui-mode';

const SEGMENT_HEX = ['#0ea5e9', '#6366f1', '#a855f7', '#14b8a6', '#f59e0b', '#ec4899'];

function fmtValue(f: WhyFactor): string {
  const v = f.value;
  if (v === null || v === undefined || !Number.isFinite(Number(v))) return '';
  const num = Number(v);
  const rounded = Math.abs(num) >= 100 ? Math.round(num) : Math.round(num * 100) / 100;
  return f.unit ? `${rounded} ${f.unit}` : `${rounded}`;
}

/**
 * SHAP-style "why this score" bar. Each factor is a segment sized by contribution_pct.
 * contribution_pct across factors sums to ~100.
 */
export default function WhyBar({ why, mode }: { why: WhyFactor[]; mode: UiMode }) {
  const std = mode === 'standard';
  const factors = (why ?? []).filter((f) => f && f.factor);
  const total = factors.reduce((sum, f) => sum + Math.max(0, Number(f.contribution_pct ?? 0)), 0) || 1;

  if (factors.length === 0) {
    return (
      <p className={std ? 'text-sm text-slate-500' : 'font-mono text-[11px] uppercase tracking-widest text-slate-500'}>
        No driver breakdown available
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {/* Segmented bar */}
      <div className={`flex h-3 w-full overflow-hidden rounded-full ${std ? 'bg-slate-200' : 'bg-white/10'}`}>
        {factors.map((f, i) => {
          const pct = (Math.max(0, Number(f.contribution_pct ?? 0)) / total) * 100;
          if (pct <= 0) return null;
          return (
            <div
              key={f.factor}
              className="h-full first:rounded-l-full last:rounded-r-full"
              style={{ width: `${pct}%`, background: SEGMENT_HEX[i % SEGMENT_HEX.length] }}
              title={`${f.factor}: ${Math.round(Number(f.contribution_pct ?? 0))}%`}
            />
          );
        })}
      </div>

      {/* Legend / factor rows */}
      <ul className="space-y-1.5">
        {factors.map((f, i) => {
          const pct = Math.round(Number(f.contribution_pct ?? 0));
          const value = fmtValue(f);
          return (
            <li key={f.factor} className="flex items-center gap-2.5">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-sm"
                style={{ background: SEGMENT_HEX[i % SEGMENT_HEX.length] }}
                aria-hidden
              />
              <span className={`min-w-0 flex-1 truncate text-sm ${std ? 'text-slate-700' : 'text-slate-300'}`}>
                {f.factor}
                {value ? <span className={std ? 'text-slate-400' : 'text-slate-500'}> · {value}</span> : null}
              </span>
              <span
                className={`shrink-0 tabular-nums text-sm font-semibold ${std ? 'text-slate-900' : 'text-white'}`}
              >
                {pct}%
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
