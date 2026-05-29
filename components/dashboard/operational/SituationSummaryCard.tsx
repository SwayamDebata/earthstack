'use client';

import { AlertTriangle } from 'lucide-react';
import type { OperationalSituation } from '@/lib/operational/narrative';
import StatusLed from '@/components/dashboard/StatusLed';

function severityTone(sev: string): 'critical' | 'warning' | 'nominal' | 'info' {
  const s = sev.toLowerCase();
  if (s.includes('high') || s.includes('critical')) return 'critical';
  if (s.includes('medium') || s.includes('warning')) return 'warning';
  if (s.includes('low') || s.includes('normal')) return 'nominal';
  return 'info';
}

export default function SituationSummaryCard({ situation }: { situation: OperationalSituation }) {
  const tone = severityTone(situation.severityLabel);
  return (
    <section className="relative overflow-hidden rounded-lg border border-emerald-400/25 bg-gradient-to-br from-emerald-950/35 via-[#070d18] to-[#050a12] p-5 shadow-[0_0_40px_rgba(16,185,129,0.06)]">
      <span className="hud-bracket hud-bracket-tl" />
      <span className="hud-bracket hud-bracket-br" />

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="font-mono text-[10px] uppercase tracking-[0.32em] text-emerald-300/80">
            Situation · What is happening?
          </p>
          <h2 className="mt-2 text-2xl font-semibold leading-tight tracking-tight text-white md:text-3xl">
            {situation.headline}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-300">{situation.escalationWindow}</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <span
            className={`inline-flex items-center gap-2 rounded-sm border px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest ${
              tone === 'critical'
                ? 'border-red-400/40 bg-red-500/10 text-red-100'
                : tone === 'warning'
                  ? 'border-amber-400/40 bg-amber-500/10 text-amber-100'
                  : 'border-emerald-400/40 bg-emerald-500/10 text-emerald-100'
            }`}
          >
            <StatusLed tone={tone} size={7} pulse={tone === 'critical'} />
            <AlertTriangle size={12} />
            {situation.severityLabel}
          </span>
          <p className="font-mono text-[10px] uppercase tracking-widest text-slate-500">
            Confidence · <span className="text-cyan-200">{situation.confidenceLabel}</span>
          </p>
        </div>
      </div>
    </section>
  );
}
