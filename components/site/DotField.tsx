'use client';

import { useEffect, useRef } from 'react';

/* MEDots: the 2D particle engine from the prototype, loaded once and
   instantiated per canvas. It parks its own loop when off-screen and stops
   entirely under prefers-reduced-motion. */

type Mode = 'field' | 'rain' | 'heat' | 'ripple' | 'flow' | 'scatter';

declare global {
  interface Window {
    MEDots?: (
      cv: HTMLCanvasElement,
      mode: string,
      opts?: { accent?: string; water?: string; base?: string; max?: number },
    ) => void;
  }
}

let loading: Promise<void> | null = null;

function loadEngine() {
  if (typeof window === 'undefined') return Promise.resolve();
  if (window.MEDots) return Promise.resolve();
  if (loading) return loading;
  loading = new Promise<void>((resolve) => {
    const s = document.createElement('script');
    s.src = '/js/medots.js';
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => resolve(); // decorative only, never block the page
    document.head.appendChild(s);
  });
  return loading;
}

export default function DotField({
  mode = 'field',
  accent = '#C4622F',
  water,
  base,
  height = 240,
  max,
  label,
}: {
  mode?: Mode;
  accent?: string;
  water?: string;
  base?: string;
  height?: number | string;
  max?: number;
  label?: string;
}) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let cancelled = false;
    loadEngine().then(() => {
      if (cancelled || !ref.current || !window.MEDots) return;
      window.MEDots(ref.current, mode, { accent, water, base, max });
    });
    return () => {
      cancelled = true;
    };
  }, [mode, accent, water, base, max]);

  return (
    <div style={{ position: 'relative' }}>
      <canvas
        ref={ref}
        aria-hidden="true"
        style={{ display: 'block', width: '100%', height, background: 'transparent' }}
      />
      {label && (
        <span
          className="me-label"
          style={{ position: 'absolute', left: 0, bottom: 0, pointerEvents: 'none' }}
        >
          {label}
        </span>
      )}
    </div>
  );
}
