'use client';

import { Building2, Sparkles } from 'lucide-react';
import { useMission } from '@/components/dashboard/MissionContext';

export default function UiModeToggle() {
  const { uiMode, setUiMode } = useMission();
  const std = uiMode === 'standard';
  const standardActive = uiMode === 'standard';
  const commandActive = uiMode === 'command';

  const shellClass = std
    ? 'flex rounded-md border border-slate-300 bg-white p-0.5 shadow-sm'
    : 'flex rounded-sm border border-white/10 bg-black/30 p-0.5 mission-ui-mode-toggle';

  const standardBtnClass = std
    ? standardActive
      ? 'bg-blue-600 text-white'
      : 'text-slate-600 hover:bg-slate-50'
    : standardActive
      ? 'bg-blue-600/90 text-white'
      : 'font-mono uppercase tracking-widest text-slate-500 hover:text-slate-300';

  const commandBtnClass = std
    ? commandActive
      ? 'bg-slate-800 text-white'
      : 'text-slate-600 hover:bg-slate-50'
    : commandActive
      ? 'bg-cyan-500/20 font-mono uppercase tracking-widest text-cyan-100'
      : 'font-mono uppercase tracking-widest text-slate-500 hover:text-slate-300';

  return (
    <div className={shellClass} role="group" aria-label="Display mode">
      <button
        type="button"
        onClick={() => setUiMode('standard')}
        title="Standard view for district operations"
        className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-semibold transition ${standardBtnClass}`}
      >
        <Building2 size={11} />
        <span className="hidden sm:inline">Standard</span>
      </button>
      <button
        type="button"
        onClick={() => setUiMode('command')}
        title="Command theater view for briefings and demos"
        className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-semibold transition ${commandBtnClass}`}
      >
        <Sparkles size={11} />
        <span className="hidden sm:inline">Command</span>
      </button>
    </div>
  );
}
