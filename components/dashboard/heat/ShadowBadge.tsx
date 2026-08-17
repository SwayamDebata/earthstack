'use client';

import type { UiMode } from '@/lib/access/ui-mode';

const TOOLTIP = 'Advisory only. Does not replace IMD heat warnings. Not used for alerts.';

/**
 * Always-visible SHADOW chrome for heat surfaces.
 * Neutral outline (not green) so it never reads as "safe/live".
 */
export default function ShadowBadge({
  mode = 'command',
  showDisclaimer = true,
  className = '',
}: {
  mode?: UiMode;
  showDisclaimer?: boolean;
  className?: string;
}) {
  const std = mode === 'standard';
  return (
    <div className={`inline-flex flex-col items-start gap-1 ${className}`}>
      <span
        title={TOOLTIP}
        className={
          std
            ? 'inline-flex items-center rounded border border-slate-400 bg-white px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-700'
            : 'inline-flex items-center rounded-sm border border-slate-400/50 bg-slate-950/80 px-2 py-0.5 font-mono text-[9px] uppercase tracking-widest text-slate-300'
        }
      >
        Shadow
      </span>
      {showDisclaimer ? (
        <p className={std ? 'text-[11px] text-slate-500' : 'text-[10px] text-slate-500'}>
          Advisory. Does not replace IMD.
        </p>
      ) : null}
    </div>
  );
}
