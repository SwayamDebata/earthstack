'use client';

import type { UiMode } from '@/lib/access/ui-mode';

/**
 * Always-visible SHADOW chrome.
 * Neutral outline (not green) so it never reads as "safe/live".
 * Alert affordances must stay gated on `alerting === true` elsewhere.
 */
export default function ShadowBadge({
  mode = 'command',
  showDisclaimer = true,
  label = 'Shadow',
  disclaimer = 'Advisory. Does not replace IMD.',
  className = '',
}: {
  mode?: UiMode;
  showDisclaimer?: boolean;
  /** Persistent badge copy. Flood shadow uses "SHADOW · not alerting". */
  label?: string;
  disclaimer?: string;
  className?: string;
}) {
  const std = mode === 'standard';
  return (
    <div className={`inline-flex flex-col items-start gap-1 ${className}`}>
      <span
        className={
          std
            ? 'inline-flex items-center rounded border border-slate-400 bg-white px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-700'
            : 'inline-flex items-center rounded-sm border border-slate-400/50 bg-slate-950/80 px-2 py-0.5 font-mono text-[9px] uppercase tracking-widest text-slate-300'
        }
      >
        {label}
      </span>
      {showDisclaimer ? (
        <p className={std ? 'text-[11px] text-slate-500' : 'text-[10px] text-slate-500'}>{disclaimer}</p>
      ) : null}
    </div>
  );
}
