'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import BrandMark from './BrandMark';

/* ==========================================================================
   The intro.

   The mark fills from the bottom, the way water comes up through the
   waterline in the middle of the "e", holds for a beat, then flies to the
   seat it occupies in the nav for the rest of the visit.

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

    const glyph = mark.querySelector<HTMLElement>('.me-brand');
    if (!glyph) {
      const bail = window.setTimeout(finish, 0);
      return () => window.clearTimeout(bail);
    }

    const anims: Animation[] = [];

    // ---- the mark fills, bottom to top ----
    anims.push(
      glyph.animate(
        [
          { clipPath: 'inset(100% 0 0 0)', opacity: 0.25 },
          { clipPath: 'inset(45% 0 0 0)', opacity: 1, offset: 0.55 },
          { clipPath: 'inset(0% 0 0 0)', opacity: 1 },
        ],
        { duration: 1100, easing: 'cubic-bezier(0.22, 1, 0.36, 1)', fill: 'both' },
      ),
    );

    // ---- hold, then hand off to the nav ----
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
    }, 1500);

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
