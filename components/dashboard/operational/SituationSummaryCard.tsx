'use client';

import { AlertTriangle } from 'lucide-react';
import type { OperationalSituation } from '@/lib/operational/narrative';
import StatusLed from '@/components/dashboard/StatusLed';
import { useMission } from '@/components/dashboard/MissionContext';
import { opsText } from '@/lib/ui/mode-copy';

function severityTone(sev: string): 'critical' | 'warning' | 'nominal' | 'info' {
  const s = sev.toLowerCase();
  if (s.includes('high') || s.includes('critical')) return 'critical';
  if (s.includes('medium') || s.includes('warning')) return 'warning';
  if (s.includes('low') || s.includes('normal')) return 'nominal';
  return 'info';
}

export default function SituationSummaryCard({ situation }: { situation: OperationalSituation }) {
  const { uiMode } = useMission();
  const std = uiMode === 'standard';
  const tone = severityTone(situation.severityLabel);
  return (
    <section
      className={
        std
          ? 'rounded-lg border border-slate-200 bg-white p-5 shadow-sm'
          : 'relative overflow-hidden rounded-lg border border-emerald-400/25 bg-gradient-to-br from-emerald-950/35 via-[#070d18] to-[#050a12] p-5 shadow-[0_0_40px_rgba(16,185,129,0.06)]'
      }
    >
      {!std ? (
        <>
          <span className="hud-bracket hud-bracket-tl" />
          <span className="hud-bracket hud-bracket-br" />
        </>
      ) : null}

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p
            className={
              std
                ? 'text-xs font-semibold uppercase tracking-wide text-slate-500'
                : 'font-mono text-[10px] uppercase tracking-[0.32em] text-emerald-300/80'
            }
          >
            {opsText(uiMode, 'situationLabel')}
          </p>
          <h2
            className={`mt-2 text-2xl font-semibold leading-tight tracking-tight md:text-3xl ${
              std ? 'text-slate-900' : 'text-white'
            }`}
          >
            {situation.headline}
          </h2>
          <p className={`mt-3 text-sm leading-relaxed ${std ? 'text-slate-600' : 'text-slate-300'}`}>
            {situation.escalationWindow}
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <span
            className={`inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-xs font-semibold uppercase tracking-wide ${
              tone === 'critical'
                ? std
                  ? 'border-red-200 bg-red-50 text-red-800'
                  : 'border-red-400/40 bg-red-500/10 text-red-100'
                : tone === 'warning'
                  ? std
                    ? 'border-amber-200 bg-amber-50 text-amber-800'
                    : 'border-amber-400/40 bg-amber-500/10 text-amber-100'
                  : std
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                    : 'border-emerald-400/40 bg-emerald-500/10 text-emerald-100'
            }`}
          >
            {!std ? <StatusLed tone={tone} size={7} pulse={tone === 'critical'} /> : null}
            <AlertTriangle size={12} />
            {situation.severityLabel}
          </span>
          <p className={`text-xs ${std ? 'text-slate-500' : 'font-mono text-[10px] uppercase tracking-widest text-slate-500'}`}>
            Confidence ·{' '}
            <span className={std ? 'font-semibold text-slate-800' : 'text-cyan-200'}>
              {situation.confidenceLabel}
            </span>
          </p>
        </div>
      </div>
    </section>
  );
}
