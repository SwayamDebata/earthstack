'use client';

import StatusLed, { type LedTone } from '@/components/dashboard/StatusLed';
import { useDashboardUiMode } from '@/lib/ui/use-dashboard-ui-mode';
import { showHudChrome, statTileLabel, statTileShell, statTileValue } from '@/lib/ui/standard-surface';

type Props = {
  label: string;
  value: string;
  unit?: string;
  hint?: string;
  tone?: LedTone;
  size?: 'sm' | 'md';
  valueSize?: 'lg' | 'xl';
};

export default function StatTile({
  label,
  value,
  unit,
  hint,
  tone = 'info',
  size = 'md',
  valueSize = 'xl',
}: Props) {
  const mode = useDashboardUiMode();
  const std = mode === 'standard';

  return (
    <div className={statTileShell(mode, size === 'sm' ? 'sm' : 'md')}>
      {showHudChrome(mode) ? (
        <>
          <span className="hud-bracket hud-bracket-tl" />
          <span className="hud-bracket hud-bracket-br" />
        </>
      ) : null}
      <div className="flex items-center justify-between">
        <p className={statTileLabel(mode)}>{label}</p>
        <StatusLed tone={tone} size={6} pulse={!std && tone === 'critical'} />
      </div>
      <p className="mt-1.5 flex items-baseline gap-1">
        <span className={statTileValue(mode, valueSize)}>{value}</span>
        {unit ? (
          <span className={std ? 'text-xs text-slate-500' : 'font-mono text-[10px] uppercase tracking-widest text-slate-500'}>
            {unit}
          </span>
        ) : null}
      </p>
      {hint ? (
        <p className={std ? 'mt-0.5 text-xs text-slate-500' : 'font-mono text-[9px] uppercase tracking-widest text-slate-500'}>
          {hint}
        </p>
      ) : null}
    </div>
  );
}
