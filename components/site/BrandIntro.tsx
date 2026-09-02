'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import BrandMark from './BrandMark';

/* ==========================================================================
   The intro.

   The mark builds itself in the order the product works in, then flies to the
   seat it occupies in the nav for the rest of the visit, so the thing you
   watched being assembled is the thing in the corner.

     the aperture opens          an instrument is pointed at the Earth
     the ground rises            the terrain resolves
     the river runs, source down the water finds its course
     the layer sweeps across     the intelligence layer reads the surface

   Rules it keeps:
     once a session   an intro on every navigation is an obstacle, not a brand
     never a gate     the page is already rendered underneath; this only sits
                      on top of it, and it is aria-hidden throughout
     motion optional  reduced motion skips the whole thing on the first frame
     no layout shift  the nav mark keeps its box the entire time and only
                      changes visibility, so nothing reflows at the handoff
     never stuck      a guard timer clears the overlay even if an animation
                      never reports finished
   ========================================================================== */

const SEEN = 'me-brand-intro-seen';
const MARK = 124; // px, the size it plays at before the handoff

export default function BrandIntro() {
  // Start hidden and decide on the client: prerendering this visible would
  // flash the overlay for everyone, including repeat visitors.
  const [live, setLive] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const markRef = useRef<HTMLDivElement>(null);
  const doneRef = useRef(false);

  /** put the nav mark back and take the overlay out of the tree */
  const finish = useCallback(() => {
    if (doneRef.current) return;
    doneRef.current = true;
    document.documentElement.removeAttribute('data-brand-intro');
    setLive(false);
  }, []);

  useEffect(() => {
    let cancel = false;
    try {
      if (sessionStorage.getItem(SEEN)) return;
      sessionStorage.setItem(SEEN, '1');
    } catch {
      /* private mode: play it, it is only ever cosmetic */
    }
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    document.documentElement.setAttribute('data-brand-intro', 'running');
    // one frame later, so this never renders synchronously out of the effect
    const raf = requestAnimationFrame(() => {
      if (!cancel) setLive(true);
    });
    return () => {
      cancel = true;
      cancelAnimationFrame(raf);
      document.documentElement.removeAttribute('data-brand-intro');
    };
  }, []);

  useEffect(() => {
    if (!live) return;
    const wrap = wrapRef.current;
    const mark = markRef.current;
    if (!wrap || !mark) return;

    const svg = mark.querySelector('svg');
    const ring = svg?.querySelector<SVGCircleElement>('.me-brand-ring');
    const ground = svg?.querySelector<SVGGElement>('.me-brand-ground');
    const river = svg?.querySelector<SVGPathElement>('.me-brand-river');
    const layer = svg?.querySelector<SVGPathElement>('.me-brand-layer');
    if (!ring || !ground || !river || !layer) {
      const bail = window.setTimeout(finish, 0);
      return () => window.clearTimeout(bail);
    }

    const anims: Animation[] = [];
    const ease = 'cubic-bezier(0.22, 1, 0.36, 1)';

    // ---- 1. the aperture opens ----
    ring.style.strokeDasharray = '100';
    ring.style.transformOrigin = '32px 32px';
    ring.style.transform = 'rotate(-90deg)';
    anims.push(
      ring.animate([{ strokeDashoffset: 100 }, { strokeDashoffset: 0 }], {
        duration: 720,
        easing: ease,
        fill: 'both',
      }),
    );

    // ---- 2. the ground rises ----
    ground.style.transformOrigin = '32px 60px';
    anims.push(
      ground.animate(
        [
          { transform: 'translateY(22px)', opacity: 0 },
          { transform: 'translateY(0px)', opacity: 1 },
        ],
        { duration: 700, delay: 240, easing: ease, fill: 'both' },
      ),
    );

    // ---- 3. the river runs, source to sea ----
    river.style.strokeDasharray = '100';
    anims.push(
      river.animate(
        [
          { strokeDashoffset: 100, opacity: 0 },
          { strokeDashoffset: 65, opacity: 1, offset: 0.35 },
          { strokeDashoffset: 0, opacity: 1 },
        ],
        { duration: 680, delay: 620, easing: 'cubic-bezier(0.37, 0, 0.28, 1)', fill: 'both' },
      ),
    );

    // ---- 4. the layer sweeps across, reads once, and holds ----
    layer.style.strokeDasharray = '100';
    anims.push(
      layer.animate(
        [
          { strokeDashoffset: 100, opacity: 0 },
          { strokeDashoffset: 0, opacity: 1, offset: 0.62 },
          { strokeDashoffset: 0, opacity: 0.45, offset: 0.8 },
          { strokeDashoffset: 0, opacity: 1 },
        ],
        { duration: 900, delay: 980, easing: ease, fill: 'both' },
      ),
    );

    // ---- 5. hold, then hand off to the nav ----
    let handoff: Animation | null = null;
    const timer = window.setTimeout(() => {
      const seat = document.querySelector('.me-nav-brand .me-mark');
      const from = mark.getBoundingClientRect();

      if (seat) {
        const to = seat.getBoundingClientRect();
        const scale = to.width / from.width;
        const dx = to.left + to.width / 2 - (from.left + from.width / 2);
        const dy = to.top + to.height / 2 - (from.top + from.height / 2);
        handoff = mark.animate(
          [
            { transform: 'translate(0px, 0px) scale(1)' },
            { transform: `translate(${dx}px, ${dy}px) scale(${scale})` },
          ],
          { duration: 640, easing: 'cubic-bezier(0.65, 0, 0.35, 1)', fill: 'both' },
        );
      }
      wrap.animate([{ opacity: 1 }, { opacity: 0 }], {
        duration: 460,
        delay: 240,
        easing: 'ease-out',
        fill: 'both',
      });

      const end = handoff ?? wrap.getAnimations()[0];
      if (end) end.finished.then(finish).catch(finish);
      else finish();
    }, 2050);

    // a stuck animation must never leave the overlay covering the page
    const guard = window.setTimeout(finish, 4500);

    return () => {
      window.clearTimeout(timer);
      window.clearTimeout(guard);
      anims.forEach((a) => a.cancel());
      handoff?.cancel();
    };
  }, [live, finish]);

  if (!live) return null;

  return (
    <div ref={wrapRef} className="me-brand-intro" aria-hidden="true">
      <div ref={markRef} className="me-brand-intro-mark">
        <BrandMark size={MARK} />
      </div>
    </div>
  );
}
