'use client';

import { LOCATIONS } from '@/lib/config';
import { useMission } from '@/components/dashboard/MissionContext';

export default function RegionChips() {
  const { location, setLocation, uiMode } = useMission();
  const std = uiMode === 'standard';

  return (
    <div
      className={
        std
          ? 'flex items-center gap-1 rounded-md border border-slate-200 bg-white p-1 shadow-sm'
          : 'flex items-center gap-1 rounded-sm border border-cyan-400/20 bg-black/40 p-1'
      }
    >
      {LOCATIONS.map((loc) => (
        <button
          key={loc}
          type="button"
          onClick={() => setLocation(loc)}
          className={`rounded-md px-2.5 py-1 text-xs font-medium uppercase tracking-wide transition ${
            location === loc
              ? std
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-cyan-500/20 text-cyan-100 shadow-[inset_0_0_0_1px_rgba(34,211,238,0.45)]'
              : std
                ? 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                : 'text-slate-400 hover:text-cyan-200'
          }`}
        >
          {loc}
        </button>
      ))}
    </div>
  );
}
