'use client';

import { Building2, Sparkles } from 'lucide-react';
import { useMission } from '@/components/dashboard/MissionContext';

export default function UiModeToggle() {
  const { uiMode, setUiMode } = useMission();

  return (
    <div
      className="flex rounded-sm border border-white/10 bg-black/30 p-0.5 mission-ui-mode-toggle"
      role="group"
      aria-label="Display mode"
    >
      <button
        type="button"
        onClick={() => setUiMode('standard')}
        title="Standard view for district operations"
        className={`inline-flex items-center gap-1 rounded-sm px-2 py-1 font-mono text-[9px] uppercase tracking-widest transition ${
          uiMode === 'standard'
            ? 'bg-blue-600/90 text-white'
            : 'text-slate-500 hover:text-slate-300'
        }`}
      >
        <Building2 size={11} />
        <span className="hidden sm:inline">Standard</span>
      </button>
      <button
        type="button"
        onClick={() => setUiMode('command')}
        title="Command theater view for briefings and demos"
        className={`inline-flex items-center gap-1 rounded-sm px-2 py-1 font-mono text-[9px] uppercase tracking-widest transition ${
          uiMode === 'command'
            ? 'bg-cyan-500/20 text-cyan-100'
            : 'text-slate-500 hover:text-slate-300'
        }`}
      >
        <Sparkles size={11} />
        <span className="hidden sm:inline">Command</span>
      </button>
    </div>
  );
}
