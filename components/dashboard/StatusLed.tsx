'use client';

export type LedTone = 'nominal' | 'warning' | 'critical' | 'idle' | 'info';

const TONE: Record<LedTone, { dot: string; ring: string }> = {
  nominal: { dot: 'bg-emerald-400', ring: 'ring-emerald-400/40' },
  warning: { dot: 'bg-amber-400', ring: 'ring-amber-400/40' },
  critical: { dot: 'bg-red-500', ring: 'ring-red-500/40' },
  idle: { dot: 'bg-slate-500', ring: 'ring-slate-500/30' },
  info: { dot: 'bg-cyan-400', ring: 'ring-cyan-400/40' },
};

export default function StatusLed({ tone = 'nominal', pulse = true, size = 7 }: { tone?: LedTone; pulse?: boolean; size?: number }) {
  const cls = TONE[tone];
  return (
    <span
      className={`inline-block shrink-0 rounded-full ring-2 ${cls.dot} ${cls.ring} ${pulse ? 'led-pulse' : ''}`}
      style={{ width: size, height: size }}
      aria-hidden
    />
  );
}
