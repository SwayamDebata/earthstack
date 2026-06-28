'use client';

import { Volume2, VolumeX } from 'lucide-react';
import { useSoundOptional } from '@/components/audio/SoundProvider';

type Props = {
  className?: string;
  compact?: boolean;
};

export default function SoundToggle({ className = '', compact = false }: Props) {
  const sound = useSoundOptional();
  if (!sound?.hydrated) return null;

  const { enabled, toggle } = sound;

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={enabled ? 'Mute situation room audio' : 'Enable situation room audio'}
      title={enabled ? 'Sound on' : 'Sound off'}
      className={`inline-flex items-center gap-2 rounded-full border transition ${
        enabled
          ? 'border-cyan-400/35 bg-cyan-500/10 text-cyan-100'
          : 'border-white/15 bg-white/5 text-slate-400 hover:border-white/25 hover:text-slate-200'
      } ${compact ? 'p-2.5' : 'px-3 py-2'} ${className}`}
    >
      {enabled ? <Volume2 size={compact ? 16 : 18} /> : <VolumeX size={compact ? 16 : 18} />}
      {!compact ? (
        <span className="font-mono text-[10px] uppercase tracking-widest">{enabled ? 'Sound on' : 'Sound off'}</span>
      ) : null}
    </button>
  );
}
