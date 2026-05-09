'use client';

const ITEMS = [
  'ModelEarth',
  'Climate mission control',
  'API-first intelligence',
  'Rainfall · Rivers · Risk',
  'Replay & forecast',
  'Odisha-scale operations',
  'Live dashboards',
];

export default function MarqueeStrip() {
  const doubled = [...ITEMS, ...ITEMS];
  return (
    <div className="relative z-20 border-y border-cyan-500/15 bg-[#050816] py-4">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-[#050816] to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-[#050816] to-transparent" />
      <div className="flex w-max animate-[marquee_45s_linear_infinite] gap-12 px-6 font-mono text-xs uppercase tracking-[0.35em] text-cyan-200/70 [will-change:transform]">
        {doubled.map((label, i) => (
          <span key={`${label}-${i}`} className="flex items-center gap-12 whitespace-nowrap">
            <span>{label}</span>
            <span className="text-cyan-400/40">◆</span>
          </span>
        ))}
      </div>
    </div>
  );
}
