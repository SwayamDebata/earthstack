'use client';

import Link from 'next/link';
import { useEffect, useRef } from 'react';

/* ==========================================================================
   The low-poly river valley, ported from the Delta prototype.

   Hand-written WebGL, no libraries: procedural terrain from fbm noise carved
   by a meandering river, flat-shaded houses and trees placed on the surface,
   an animated water plane and a raymarched sky, with the camera flying the
   valley on scroll and three title beats keyed to the same progress.

   Warm dawn palette, so unlike the Mahanadi point cloud this one reads light.
   ========================================================================== */

declare global {
  interface Window {
    meInitValley?: (opts: {
      canvas: HTMLCanvasElement;
      section: HTMLElement;
      beats: (HTMLElement | null)[];
    }) => (() => void) | null;
  }
}

let loading: Promise<void> | null = null;

function loadEngine() {
  if (typeof window === 'undefined') return Promise.resolve();
  if (window.meInitValley) return Promise.resolve();
  if (loading) return loading;
  loading = new Promise<void>((resolve) => {
    const s = document.createElement('script');
    s.src = '/js/valley.js';
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => resolve();
    document.head.appendChild(s);
  });
  return loading;
}

export default function ValleyHero() {
  const secRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const beatRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    let dispose: (() => void) | null = null;
    let cancelled = false;

    loadEngine().then(() => {
      if (cancelled || !canvasRef.current || !secRef.current || !window.meInitValley) return;
      dispose = window.meInitValley({
        canvas: canvasRef.current,
        section: secRef.current,
        beats: beatRefs.current,
      });
    });

    return () => {
      cancelled = true;
      dispose?.();
    };
  }, []);

  return (
    <section ref={secRef} className="me-valley" style={{ position: 'relative', height: '360vh' }}>
      <div className="me-valley-pin">
        <canvas ref={canvasRef} className="me-valley-gl" />

        {/* beat 01 */}
        <div
          ref={(el) => {
            beatRefs.current[0] = el;
          }}
          className="me-valley-beat"
        >
          <span className="me-eyebrow" style={{ color: 'var(--art-accent-onlight)' }}>
            Mahanadi · Odisha · dawn
          </span>
          <h1 className="me-display" style={{ color: '#2a2418', marginTop: 18 }}>
            The water always comes.
          </h1>
        </div>

        {/* beat 02 */}
        <div
          ref={(el) => {
            beatRefs.current[1] = el;
          }}
          className="me-valley-beat"
        >
          <h2 className="me-display" style={{ color: '#2a2418', marginBottom: 18 }}>
            The question is whether anyone saw it in time.
          </h2>
          <p
            style={{
              margin: 0,
              maxWidth: '54ch',
              fontSize: 'clamp(1rem, 1.3vw, 1.15rem)',
              lineHeight: 1.62,
              color: '#3f3728',
            }}
          >
            ModelEarth scores flood risk for five Odisha cities every thirty minutes, and publishes
            the replay, so a district can check the engine before it trusts an alert.
          </p>
        </div>

        {/* beat 03 */}
        <div
          ref={(el) => {
            beatRefs.current[2] = el;
          }}
          className="me-valley-beat"
        >
          <span className="me-eyebrow" style={{ color: 'var(--art-accent-onlight)' }}>
            Sambalpur · Mahanadi
          </span>
          <h2 className="me-display" style={{ color: '#2a2418', margin: '18px 0 22px' }}>
            Forty-eight hours before the road goes.
          </h2>
          <Link
            href="/products/flood"
            className="me-btn"
            style={{ background: '#2a2418', color: '#f2f0e4' }}
          >
            Open Flood Ops
          </Link>
          <p className="me-label" style={{ marginTop: 20, color: '#6d6046' }}>
            Advisory only · does not override IMD, CWC or OSDMA
          </p>
        </div>
      </div>
    </section>
  );
}
