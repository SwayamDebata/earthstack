'use client';

import { useEffect, useState } from 'react';
import { ENGAGEMENT_PROMPT_KEY } from '@/lib/access/pilot';
import { useMission } from '@/components/dashboard/MissionContext';

const DELAY_MS = 2 * 60_000;

export default function PreviewEngagementPrompt() {
  const { hasPilotAccess, openPilotRequest } = useMission();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (hasPilotAccess || typeof window === 'undefined') return;
    if (window.localStorage.getItem(ENGAGEMENT_PROMPT_KEY) === '1') return;

    const timer = window.setTimeout(() => setVisible(true), DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [hasPilotAccess]);

  if (!visible || hasPilotAccess) return null;

  const dismiss = () => {
    window.localStorage.setItem(ENGAGEMENT_PROMPT_KEY, '1');
    setVisible(false);
  };

  return (
    <div className="fixed bottom-16 right-4 z-40 max-w-sm rounded-md border border-emerald-400/30 bg-[#060b18]/95 p-4 shadow-[0_0_40px_rgba(16,185,129,0.12)]">
      <p className="font-mono text-[10px] uppercase tracking-widest text-emerald-300">District pilot</p>
      <p className="mt-1 text-sm text-white">Want this command environment for your region?</p>
      <p className="mt-1 text-xs text-slate-400">Book an operational briefing with the ModelEarth team.</p>
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={() => {
            dismiss();
            openPilotRequest();
          }}
          className="rounded-sm border border-emerald-400/40 bg-emerald-500/15 px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-emerald-100"
        >
          Request briefing
        </button>
        <button
          type="button"
          onClick={dismiss}
          className="rounded-sm border border-white/10 px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-slate-400"
        >
          Later
        </button>
      </div>
    </div>
  );
}
