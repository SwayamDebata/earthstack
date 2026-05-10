'use client';

import { useEffect, useState } from 'react';

const MISSION_EPOCH_KEY = 'modelearth:mission-epoch';

function pad(n: number, w = 2) {
  return n.toString().padStart(w, '0');
}

function formatUtc(d: Date) {
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())} ${pad(d.getUTCHours())}:${pad(
    d.getUTCMinutes(),
  )}:${pad(d.getUTCSeconds())} UTC`;
}

function formatElapsed(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  const days = Math.floor(s / 86400);
  const hours = Math.floor((s % 86400) / 3600);
  const mins = Math.floor((s % 3600) / 60);
  const secs = s % 60;
  return `T+${pad(days, 3)}:${pad(hours)}:${pad(mins)}:${pad(secs)}`;
}

/**
 * UTC clock + mission elapsed timer (persisted across reloads).
 * One setInterval @ 1s — cheap.
 */
export default function MissionClock() {
  const [now, setNow] = useState<Date | null>(null);
  const [epoch, setEpoch] = useState<number | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    let stored = Number(window.localStorage.getItem(MISSION_EPOCH_KEY));
    if (!stored || Number.isNaN(stored)) {
      stored = Date.now();
      window.localStorage.setItem(MISSION_EPOCH_KEY, String(stored));
    }
    setEpoch(stored);
    setNow(new Date());

    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

  if (!now || !epoch) {
    return (
      <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate-500">
        <p>0000-00-00 00:00:00 UTC</p>
        <p className="mt-0.5 text-cyan-300/80">T+000:00:00:00</p>
      </div>
    );
  }

  return (
    <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate-300">
      <p>{formatUtc(now)}</p>
      <p className="mt-0.5 text-cyan-300/85">{formatElapsed(now.getTime() - epoch)}</p>
    </div>
  );
}
