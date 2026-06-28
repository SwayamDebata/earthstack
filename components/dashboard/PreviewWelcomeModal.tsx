'use client';

import Link from 'next/link';
import { History, MapPin, X } from 'lucide-react';

type Props = {
  open: boolean;
  onClose: () => void;
  onExplore: () => void;
};

export default function PreviewWelcomeModal({ open, onClose, onExplore }: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 bg-black/75 backdrop-blur-sm"
        onClick={onExplore}
      />
      <div className="relative z-10 w-full max-w-xl overflow-hidden rounded-lg border border-cyan-400/25 bg-gradient-to-br from-[#0a1628] to-[#050a12] p-6 shadow-[0_0_80px_rgba(34,211,238,0.15)]">
        <span className="hud-bracket hud-bracket-tl" />
        <span className="hud-bracket hud-bracket-br" />

        <button
          type="button"
          onClick={onExplore}
          className="absolute right-4 top-4 rounded-sm border border-white/10 p-1 text-slate-400 hover:text-white"
        >
          <X size={16} />
        </button>

        <p className="font-mono text-[10px] uppercase tracking-[0.32em] text-cyan-300/80">Live command preview</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white">
          Live command preview
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-slate-300">
          You are entering a live operational preview: real API data, situation intelligence, and verified historical
          replay. Alert dispatch and full analytics require a district pilot briefing.
        </p>

        <div className="mt-6 grid grid-cols-1 gap-2 sm:grid-cols-2">
          <Link
            href="/dashboard/ops/replay?tour=1"
            onClick={onClose}
            className="flex items-center gap-3 rounded-md border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 transition hover:border-emerald-400/50"
          >
            <History size={18} className="text-emerald-300" />
            <div className="text-left">
              <p className="font-mono text-[10px] uppercase tracking-widest text-emerald-200">Recommended</p>
              <p className="text-sm text-white">See verified early warning</p>
            </div>
          </Link>
          <button
            type="button"
            onClick={onExplore}
            className="flex items-center gap-3 rounded-md border border-white/10 bg-black/30 px-4 py-3 text-left transition hover:border-cyan-400/30"
          >
            <MapPin size={18} className="text-cyan-300" />
            <div>
              <p className="font-mono text-[10px] uppercase tracking-widest text-slate-500">Explore</p>
              <p className="text-sm text-white">Command center</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
