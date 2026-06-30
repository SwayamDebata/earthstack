'use client';

import { Brain } from 'lucide-react';
import type { OperationalDriver } from '@/lib/operational/narrative';
import { useMission } from '@/components/dashboard/MissionContext';
import { opsText } from '@/lib/ui/mode-copy';

export default function ExplainabilityPanel({
  drivers,
  evidenceLine,
}: {
  drivers: OperationalDriver[];
  evidenceLine: string | null;
}) {
  const { uiMode } = useMission();
  const std = uiMode === 'standard';

  return (
    <section
      className={
        std
          ? 'rounded-lg border border-slate-200 bg-white p-4 shadow-sm'
          : 'rounded-md border border-white/8 bg-[#060b18]/90 p-4'
      }
    >
      <div className="mb-3 flex items-center gap-2">
        <Brain size={14} className={std ? 'text-blue-600' : 'text-cyan-300'} />
        <p
          className={
            std
              ? 'text-xs font-semibold uppercase tracking-wide text-slate-500'
              : 'font-mono text-[10px] uppercase tracking-[0.22em] text-cyan-200'
          }
        >
          {opsText(uiMode, 'evidenceLabel')}
        </p>
      </div>
      <ul className="space-y-2">
        {drivers.map((d) => (
          <li
            key={d.label}
            className={
              std
                ? 'rounded-md border border-slate-200 bg-slate-50 px-3 py-2'
                : 'rounded-sm border border-white/5 bg-slate-950/50 px-3 py-2'
            }
          >
            <p className={`text-sm font-medium ${std ? 'text-slate-900' : 'text-slate-100'}`}>{d.label}</p>
            <p className={`mt-0.5 text-xs ${std ? 'text-slate-600' : 'font-mono text-[11px] text-slate-400'}`}>
              {d.detail}
            </p>
          </li>
        ))}
      </ul>
      {evidenceLine ? (
        <p
          className={`mt-3 border-t pt-3 text-xs leading-relaxed ${
            std ? 'border-slate-200 text-slate-600' : 'border-white/5 text-slate-400'
          }`}
        >
          {evidenceLine}
        </p>
      ) : null}
    </section>
  );
}
