'use client';

import { ReactNode } from 'react';
import StatusLed, { type LedTone } from './StatusLed';

type MetaItem = { label: string; value: string };

type HudFrameProps = {
  label: string;
  subtitle?: string;
  status?: LedTone;
  statusText?: string;
  meta?: MetaItem[];
  className?: string;
  bodyClassName?: string;
  children: ReactNode;
  rightSlot?: ReactNode;
  noPad?: boolean;
};

/**
 * Reusable mission-control panel frame.
 * Corner brackets, label strip, status LED, meta values, scanlines.
 * Designed to be lightweight: zero animations beyond the LED + a static grid.
 */
export default function HudFrame({
  label,
  subtitle,
  status = 'nominal',
  statusText,
  meta,
  className = '',
  bodyClassName = '',
  children,
  rightSlot,
  noPad = false,
}: HudFrameProps) {
  return (
    <section
      className={`hud-frame relative overflow-hidden rounded-md border border-cyan-400/15 bg-[#060b18]/95 shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_0_0_1px_rgba(34,211,238,0.04)] ${className}`}
    >
      <span className="hud-bracket hud-bracket-tl" />
      <span className="hud-bracket hud-bracket-tr" />
      <span className="hud-bracket hud-bracket-bl" />
      <span className="hud-bracket hud-bracket-br" />

      <header className="hud-frame-header relative z-10 flex items-center justify-between border-b border-cyan-400/15 bg-gradient-to-b from-[#0b1325] to-[#070d1b] px-3 py-1.5">
        <div className="flex min-w-0 items-center gap-2.5">
          <StatusLed tone={status} />
          <p className="truncate font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-cyan-200">{label}</p>
          {subtitle ? (
            <p className="hidden truncate font-mono text-[10px] uppercase tracking-[0.22em] text-slate-500 sm:block">
              · {subtitle}
            </p>
          ) : null}
        </div>
        <div className="flex shrink-0 items-center gap-3">
          {meta?.map((m) => (
            <div key={m.label} className="hidden md:block">
              <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-slate-500">{m.label} </span>
              <span className="font-mono text-[10px] text-cyan-200">{m.value}</span>
            </div>
          ))}
          {rightSlot}
          {statusText ? (
            <span className="rounded-sm border border-cyan-400/25 bg-black/40 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-widest text-cyan-200">
              {statusText}
            </span>
          ) : null}
        </div>
      </header>

      <div className={`relative ${noPad ? '' : 'p-3'} ${bodyClassName}`}>{children}</div>
    </section>
  );
}
