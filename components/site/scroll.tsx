'use client';

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';

/* ==========================================================================
   Scroll storytelling primitives.

   The technique is the one the Alt Carbon ELI5 piece uses: pin a scene, scrub
   a normalised progress value through it, and drive layered art, clip-path
   wipes and counters from that one number.

   Everything shares a single rAF loop and one IntersectionObserver per
   element, so a page with several of these still only paints once a frame,
   and nothing runs while off screen.
   ========================================================================== */

/* ---- shared ticker: one rAF for the whole page ---- */
const subscribers = new Set<() => void>();
let ticking = false;

function tick() {
  subscribers.forEach((fn) => fn());
  if (subscribers.size) requestAnimationFrame(tick);
  else ticking = false;
}

function subscribe(fn: () => void) {
  subscribers.add(fn);
  if (!ticking) {
    ticking = true;
    requestAnimationFrame(tick);
  }
  return () => {
    subscribers.delete(fn);
  };
}

/* ---- progress of an element through the viewport, 0..1 ---- */
export function useScrollProgress<T extends HTMLElement>(
  ref: React.RefObject<T | null>,
  opts: { mode?: 'pin' | 'through' } = {},
) {
  const mode = opts.mode ?? 'through';
  const [p, setP] = useState(0);
  const value = useRef(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setP(1);
      return;
    }

    let visible = false;
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
    });
    io.observe(el);

    const read = () => {
      if (!visible) return;
      const r = el.getBoundingClientRect();
      let next: number;
      if (mode === 'pin') {
        // a tall pinned section: progress across its scrollable span
        const span = el.offsetHeight - window.innerHeight;
        next = span > 0 ? -r.top / span : 0;
      } else {
        // a normal block: 0 as it enters the bottom, 1 as it leaves the top
        const span = window.innerHeight + r.height;
        next = (window.innerHeight - r.top) / span;
      }
      next = Math.max(0, Math.min(1, next));
      if (Math.abs(next - value.current) > 0.001) {
        value.current = next;
        setP(next);
      }
    };

    read();
    const unsub = subscribe(read);
    return () => {
      unsub();
      io.disconnect();
    };
  }, [ref, mode]);

  return p;
}

/* segment helper: maps global progress onto a 0..1 ramp between a and b */
export const seg = (t: number, a: number, b: number) =>
  Math.max(0, Math.min(1, (t - a) / (b - a)));

const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);

/* ==========================================================================
   ScrollStory — a pinned scene whose beats cross-fade as you scroll past
   ========================================================================== */

export function ScrollStory({
  beats,
  height = '340vh',
  background = 'var(--bg)',
  layers,
  className = '',
}: {
  beats: ReactNode[];
  height?: string;
  background?: string;
  /* optional parallax art, back to front; each moves at its own rate */
  layers?: { node: ReactNode; rate: number }[];
  className?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const p = useScrollProgress(ref, { mode: 'pin' });
  const n = beats.length;

  return (
    <section ref={ref} className={`me-story ${className}`} style={{ height, background }}>
      <div className="me-story-pin">
        {layers?.map((l, i) => (
          <div
            key={i}
            className="me-story-layer"
            aria-hidden="true"
            style={{ transform: `translate3d(0, ${(-p * l.rate * 100).toFixed(2)}px, 0)` }}
          >
            {l.node}
          </div>
        ))}

        <div className="me-wrap me-story-stage">
          {beats.map((b, i) => {
            // each beat owns an equal slice, fading in and out at its edges
            const a0 = i / n;
            const b0 = (i + 1) / n;
            // the first beat is already on screen when the scene is reached,
            // and the last one holds to the end rather than fading out
            const inP = i === 0 ? 1 : seg(p, a0, a0 + 0.36 / n);
            const outP = i === n - 1 ? 0 : seg(p, b0 - 0.28 / n, b0);
            const o = Math.min(inP, 1 - outP);
            return (
              <div
                key={i}
                className="me-story-beat"
                style={{
                  opacity: o,
                  transform: `translate3d(0, ${((1 - ease(inP)) * 34 + outP * -26).toFixed(1)}px, 0)`,
                  pointerEvents: o > 0.5 ? 'auto' : 'none',
                }}
              >
                {b}
              </div>
            );
          })}
        </div>

        {/* progress rail, so the reader can see how far through the scene they are */}
        <div className="me-story-rail" aria-hidden="true">
          <span style={{ transform: `scaleY(${p.toFixed(3)})` }} />
        </div>
      </div>
    </section>
  );
}

/* ==========================================================================
   CountUp — a number that counts as it scrolls into view
   ========================================================================== */

export function CountUp({
  to,
  decimals = 0,
  prefix = '',
  suffix = '',
  className = '',
  style,
}: {
  to: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
  style?: CSSProperties;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [v, setV] = useState(0);
  const done = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setV(to);
      return;
    }

    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting || done.current) return;
        done.current = true;
        io.disconnect();
        const start = performance.now();
        const dur = 1100;
        const step = (now: number) => {
          const t = Math.min(1, (now - start) / dur);
          setV(to * ease(t));
          if (t < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [to]);

  return (
    <span ref={ref} className={className} style={style}>
      {prefix}
      {v.toLocaleString(undefined, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}
      {suffix}
    </span>
  );
}

/* ==========================================================================
   ClipReveal — a wipe that uncovers its content as it scrolls in
   ========================================================================== */

export function ClipReveal({
  children,
  from = 'bottom',
  className = '',
}: {
  children: ReactNode;
  from?: 'bottom' | 'left';
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const p = useScrollProgress(ref, { mode: 'through' });
  // the wipe completes over the first half of the pass, then holds
  const t = ease(seg(p, 0.12, 0.52));
  const inset =
    from === 'bottom'
      ? `inset(${((1 - t) * 100).toFixed(1)}% 0 0 0)`
      : `inset(0 ${((1 - t) * 100).toFixed(1)}% 0 0)`;

  return (
    <div
      ref={ref}
      className={className}
      style={{ clipPath: inset, willChange: 'clip-path' }}
    >
      {children}
    </div>
  );
}

/* ==========================================================================
   Parallax — a single layer that drifts against the scroll
   ========================================================================== */

export function Parallax({
  children,
  rate = 0.12,
  className = '',
}: {
  children: ReactNode;
  rate?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const p = useScrollProgress(ref, { mode: 'through' });
  return (
    <div
      ref={ref}
      className={className}
      style={{
        transform: `translate3d(0, ${((p - 0.5) * rate * -200).toFixed(1)}px, 0)`,
        willChange: 'transform',
      }}
    >
      {children}
    </div>
  );
}

/* ==========================================================================
   Num — counts up when the value is cleanly numeric, otherwise renders as-is.
   Lets a stat grid mix "43,616" with "v2.3" and "14/18" without special cases.
   ========================================================================== */

export function Num({
  value,
  className = '',
  style,
}: {
  value: string;
  className?: string;
  style?: CSSProperties;
}) {
  const m = /^([\d,]+(?:\.\d+)?)(\s*[%a-zA-Z]*)$/.exec(value.trim());
  if (!m) return <span className={className} style={style}>{value}</span>;

  const n = Number(m[1].replace(/,/g, ''));
  if (!Number.isFinite(n)) return <span className={className} style={style}>{value}</span>;

  const decimals = m[1].includes('.') ? (m[1].split('.')[1]?.length ?? 0) : 0;
  return (
    <CountUp to={n} decimals={decimals} suffix={m[2] ?? ''} className={className} style={style} />
  );
}
