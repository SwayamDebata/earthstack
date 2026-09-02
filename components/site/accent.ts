/* ==========================================================================
   The accent, for the scenes that cannot use CSS.

   Canvas and WebGL draw with numbers, not custom properties, so anything
   painted procedurally has to be told the accent explicitly. Rather than let
   the hex spread back through those files, they read it from the stylesheet
   at mount: site.css stays the one place the hue is defined, including the
   data-me-accent alternates.

   These read the --art-* ramp, not --accent: the procedural scenes paint on
   their own dark grounds, so their accent stays at the on-dark values whatever
   page theme is showing, exactly like the SVG scene art.
   ========================================================================== */

export type Rgb = [number, number, number];

/** Fallbacks matter: these run before paint and during SSR, and a scene that
    renders with a wrong colour for one frame is worse than one that never
    reads the sheet at all. Keep them equal to the leaf-green defaults. */
const FALLBACK: Record<string, Rgb> = {
  '--art-accent': [90, 154, 67],
  '--art-accent-hi': [127, 187, 127],
  '--art-accent-deep': [56, 128, 35],
};

const parse = (raw: string): Rgb | null => {
  const s = raw.trim();
  const hex = /^#([0-9a-f]{6})$/i.exec(s);
  if (hex) {
    const n = parseInt(hex[1], 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  const fn = /^rgba?\(([^)]+)\)$/i.exec(s);
  if (fn) {
    const p = fn[1].split(/[,/\s]+/).filter(Boolean).map(Number);
    if (p.length >= 3 && p.slice(0, 3).every(Number.isFinite)) {
      return [p[0], p[1], p[2]];
    }
  }
  return null;
};

function read(name: string): Rgb {
  if (typeof document === 'undefined') return FALLBACK[name];
  const root = document.querySelector('.me-root');
  if (!root) return FALLBACK[name];
  return parse(getComputedStyle(root).getPropertyValue(name)) ?? FALLBACK[name];
}

export type Accent = {
  accent: Rgb;
  hi: Rgb;
  deep: Rgb;
  /** `rgba(r, g, b, a)` for canvas fill and stroke styles */
  rgba: (c: Rgb, a: number) => string;
  /** 0..1 triple for WebGL uniforms */
  gl: (c: Rgb) => [number, number, number];
};

export function readAccent(): Accent {
  return {
    accent: read('--art-accent'),
    hi: read('--art-accent-hi'),
    deep: read('--art-accent-deep'),
    rgba: ([r, g, b], a) => `rgba(${r}, ${g}, ${b}, ${a})`,
    gl: ([r, g, b]) => [r / 255, g / 255, b / 255],
  };
}
