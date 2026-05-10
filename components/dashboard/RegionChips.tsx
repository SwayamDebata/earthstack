'use client';

import { LOCATIONS } from '@/lib/config';
import { useMission } from '@/components/dashboard/MissionContext';

export default function RegionChips() {
  const { location, setLocation } = useMission();

  return (
    <div className="flex items-center gap-1 rounded-sm border border-cyan-400/20 bg-black/40 p-1">
      {LOCATIONS.map((loc) => (
        <button
          key={loc}
          type="button"
          onClick={() => setLocation(loc)}
          className={`rounded-sm px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest transition ${
            location === loc
              ? 'bg-cyan-500/20 text-cyan-100 shadow-[inset_0_0_0_1px_rgba(34,211,238,0.45)]'
              : 'text-slate-400 hover:text-cyan-200'
          }`}
        >
          {loc}
        </button>
      ))}
    </div>
  );
}
