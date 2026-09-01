'use client';

import { useEffect, useRef } from 'react';

/* MEMotion: the timeline set pieces from the prototype. Each scene renders a
   whole frame from one normalised time, and the engine gives it a loop, a
   scrub bar, a play/pause control and a reduced-motion still.

   Two things to know about the engine:
   - It auto-boots on load and mounts every [data-mg] it can find, so the
     attributes go on only after it has loaded. Otherwise boot() and our own
     mount() both fire and the scene renders twice.
   - Its palette is hardcoded to the prototype's dark scheme, so the host stays
     dark in every theme rather than fighting it. */

export type Scene = 'density' | 'score' | 'leadtime' | 'sentence';

declare global {
  interface Window {
    MEMotion?: { mount: (host: HTMLElement) => void; boot: () => void };
  }
}

let loading: Promise<void> | null = null;

function loadEngine() {
  if (typeof window === 'undefined') return Promise.resolve();
  if (window.MEMotion) return Promise.resolve();
  if (loading) return loading;
  loading = new Promise<void>((resolve) => {
    const s = document.createElement('script');
    s.src = '/js/memotion.js';
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => resolve();
    document.head.appendChild(s);
  });
  return loading;
}

export default function MotionScene({
  scene,
  duration = 13,
  label,
  note,
}: {
  scene: Scene;
  duration?: number;
  label?: string;
  note?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const mounted = useRef(false);

  useEffect(() => {
    let cancelled = false;
    loadEngine().then(() => {
      const host = ref.current;
      if (cancelled || mounted.current || !host || !window.MEMotion) return;
      mounted.current = true;
      host.setAttribute('data-mg', scene);
      host.setAttribute('data-dur', String(duration));
      window.MEMotion.mount(host);
    });
    return () => {
      cancelled = true;
    };
  }, [scene, duration]);

  return (
    <div className="me-motion-panel">
      {(label || note) && (
        <div className="me-motion-bar">
          {label && <span className="me-label">{label}</span>}
          {note && (
            <span className="me-label" style={{ color: 'var(--art-accent-hi)' }}>
              {note}
            </span>
          )}
        </div>
      )}
      <div ref={ref} className="me-motion" />
    </div>
  );
}
