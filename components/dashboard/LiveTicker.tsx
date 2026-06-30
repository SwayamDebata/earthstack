'use client';

import { useMemo } from 'react';
import StatusLed, { type LedTone } from './StatusLed';
import { useMission } from '@/components/dashboard/MissionContext';
import { opsText } from '@/lib/ui/mode-copy';

export type TickItem = {
  channel: string;
  text: string;
  tone?: LedTone;
};

/**
 * Bottom telemetry ticker. Pure CSS marquee for zero JS scroll cost.
 * Items are doubled so the loop is seamless.
 */
export default function LiveTicker({ items }: { items: TickItem[] }) {
  const { uiMode } = useMission();
  const std = uiMode === 'standard';
  const doubled = useMemo(() => [...items, ...items], [items]);
  const summary = items[0];

  if (std) {
    return (
      <div className="mission-ticker flex h-9 items-center gap-2 border-t border-slate-200 bg-white px-4 text-xs text-slate-600">
        <StatusLed tone={summary?.tone ?? 'nominal'} size={6} />
        <span className="font-medium text-slate-500">{opsText(uiMode, 'tickerLabel')}:</span>
        <span className="truncate">
          {summary ? `${summary.channel} — ${summary.text}` : 'All systems reporting normally'}
        </span>
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="mission-ticker flex h-9 items-center gap-2 border-t border-cyan-400/15 bg-[#04080f] px-3 font-mono text-[10px] uppercase tracking-widest text-slate-500">
        <StatusLed tone="idle" size={6} />
        TELEMETRY · awaiting upstream signals
      </div>
    );
  }

  return (
    <div className="mission-ticker relative flex h-9 items-center overflow-hidden border-t border-cyan-400/15 bg-[#04080f]">
      <div className="flex shrink-0 items-center gap-2 border-r border-cyan-400/15 bg-[#070d1b] px-3 py-2">
        <StatusLed tone="nominal" size={6} />
        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-cyan-200">TELEMETRY</span>
      </div>
      <div className="pointer-events-none absolute left-32 z-10 h-full w-12 bg-gradient-to-r from-[#04080f] to-transparent" />
      <div className="pointer-events-none absolute right-0 z-10 h-full w-12 bg-gradient-to-l from-[#04080f] to-transparent" />
      <div className="flex w-max animate-[marquee_60s_linear_infinite] gap-8 pl-6 [will-change:transform]">
        {doubled.map((item, i) => (
          <span key={`${item.channel}-${i}`} className="flex items-center gap-2 whitespace-nowrap font-mono text-[10px] uppercase tracking-[0.18em]">
            <StatusLed tone={item.tone ?? 'info'} size={5} pulse={false} />
            <span className="text-cyan-300/80">{item.channel}</span>
            <span className="text-slate-300">{item.text}</span>
            <span className="text-cyan-400/40">◆</span>
          </span>
        ))}
      </div>
    </div>
  );
}
