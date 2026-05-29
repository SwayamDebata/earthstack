'use client';

import { Brain } from 'lucide-react';
import type { OperationalDriver } from '@/lib/operational/narrative';

export default function ExplainabilityPanel({
  drivers,
  evidenceLine,
}: {
  drivers: OperationalDriver[];
  evidenceLine: string | null;
}) {
  return (
    <section className="rounded-md border border-white/8 bg-[#060b18]/90 p-4">
      <div className="mb-3 flex items-center gap-2">
        <Brain size={14} className="text-cyan-300" />
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-cyan-200">
          Evidence · Why does the system believe this?
        </p>
      </div>
      <ul className="space-y-2">
        {drivers.map((d) => (
          <li
            key={d.label}
            className="rounded-sm border border-white/5 bg-slate-950/50 px-3 py-2"
          >
            <p className="text-sm font-medium text-slate-100">{d.label}</p>
            <p className="mt-0.5 font-mono text-[11px] text-slate-400">{d.detail}</p>
          </li>
        ))}
      </ul>
      {evidenceLine ? (
        <p className="mt-3 border-t border-white/5 pt-3 text-xs leading-relaxed text-slate-400">
          {evidenceLine}
        </p>
      ) : null}
    </section>
  );
}
