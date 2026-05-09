'use client';

import { useEffect, useRef } from 'react';

/**
 * Lightweight cursor glow: one layer, rAF-coalesced updates (no React state on mousemove).
 * Avoids particle trails + springs that were tanking scroll / main-thread budget.
 */
export default function CursorSpotlight() {
  const elRef = useRef<HTMLDivElement>(null);
  const posRef = useRef({ x: 0, y: 0 });
  const frameRef = useRef<number>(0);

  useEffect(() => {
    const el = elRef.current;
    if (!el) return;

    const flush = () => {
      frameRef.current = 0;
      const { x, y } = posRef.current;
      el.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
    };

    const onMove = (e: MouseEvent) => {
      posRef.current.x = e.clientX;
      posRef.current.y = e.clientY;
      if (frameRef.current === 0) {
        frameRef.current = requestAnimationFrame(flush);
      }
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', onMove);
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, []);

  return (
    <div
      ref={elRef}
      className="pointer-events-none fixed left-0 top-0 z-[100] hidden h-[min(260px,38vw)] w-[min(260px,38vw)] rounded-full bg-cyan-500/10 blur-[48px] will-change-transform md:block"
      aria-hidden
    />
  );
}
