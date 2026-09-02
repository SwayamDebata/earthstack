'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import BrandMark from './BrandMark';

/* ==========================================================================
   Theme - paper (warm light) · void (dark)
   ========================================================================== */

export const THEMES = ['paper', 'void'] as const;
export type Theme = (typeof THEMES)[number];

const STORAGE_KEY = 'modelearth-theme';

const ThemeCtx = createContext<{ theme: Theme; setTheme: (t: Theme) => void }>({
  theme: 'paper',
  setTheme: () => {},
});

export const useTheme = () => useContext(ThemeCtx);

function resolveTheme(raw: string | null): Theme | null {
  if (raw === 'paper' || raw === 'void') return raw;
  // Retired “white” theme maps to paper.
  if (raw === 'white') return 'paper';
  return null;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('paper');

  useEffect(() => {
    try {
      const next = resolveTheme(localStorage.getItem(STORAGE_KEY));
      if (next) setThemeState(next);
    } catch {
      /* private mode / blocked storage - the default stands */
    }
  }, []);

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t);
    try {
      localStorage.setItem(STORAGE_KEY, t);
    } catch {
      /* not worth surfacing */
    }
  }, []);

  useEffect(() => {
    document.documentElement.style.colorScheme = theme === 'void' ? 'dark' : 'light';
    return () => {
      document.documentElement.style.colorScheme = '';
    };
  }, [theme]);

  return <ThemeCtx.Provider value={{ theme, setTheme }}>{children}</ThemeCtx.Provider>;
}

/* ==========================================================================
   Status chip - the labelling discipline, in a component
   ========================================================================== */

export type ChipKind = 'live' | 'backtest' | 'shadow' | 'miss' | 'open' | 'dev';

const CHIP_TEXT: Record<ChipKind, string> = {
  live: 'Live',
  backtest: 'Backtest',
  shadow: 'Shadow',
  miss: 'Miss',
  open: 'Open',
  dev: 'In development',
};

export function Chip({
  kind,
  children,
  className = '',
}: {
  kind: ChipKind;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <span className={`me-chip ${className}`} data-k={kind}>
      {children ?? CHIP_TEXT[kind]}
    </span>
  );
}

/* ==========================================================================
   Reveal - one IntersectionObserver per element, unobserved once shown
   ========================================================================== */

export function Reveal({
  children,
  delay = 0,
  className = '',
  as: Tag = 'div',
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  as?: 'div' | 'section' | 'li' | 'article' | 'header' | 'figure';
}) {
  const ref = useRef<HTMLElement | null>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setShown(true);
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setShown(true);
            io.unobserve(e.target);
          }
        }
      },
      { rootMargin: '0px 0px -12% 0px', threshold: 0.08 },
    );

    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <Tag
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ref={ref as any}
      className={`me-reveal ${className}`}
      data-shown={shown ? 'true' : 'false'}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </Tag>
  );
}

/* ==========================================================================
   Section header - eyebrow only
   ========================================================================== */

export function SectionHead({ index, label }: { index: string; label: string }) {
  return (
    <div className="me-sec-head">
      <span className="me-eyebrow">
        {index} · {label}
      </span>
    </div>
  );
}

/* ==========================================================================
   Brand mark + title text
   ========================================================================== */

export function Mark({ size = 26, animate = false }: { size?: number; animate?: boolean }) {
  return <BrandMark size={size} animate={animate} className="me-mark" />;
}

/** Mark + “ModelEarth” title text — standard lockup. */
export function BrandLockup({
  markSize = 22,
  animate = false,
}: {
  markSize?: number;
  animate?: boolean;
}) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 9 }}>
      <Mark size={markSize} animate={animate} />
      <span
        style={{
          fontFamily: 'var(--sans)',
          fontSize: 17,
          fontWeight: 600,
          letterSpacing: '-0.03em',
        }}
      >
        ModelEarth
      </span>
    </span>
  );
}

/* ==========================================================================
   Figure caption - used under every mockup and diagram
   ========================================================================== */

export function Caption({ children }: { children: ReactNode }) {
  return (
    <p
      className="me-label"
      style={{ marginTop: '0.9rem', lineHeight: 1.7, letterSpacing: '0.1em', maxWidth: '80ch' }}
    >
      {children}
    </p>
  );
}

/* ==========================================================================
   SiteRoot - carries the theme attribute every token is scoped to
   ========================================================================== */

export function SiteRoot({ children }: { children: ReactNode }) {
  const { theme } = useTheme();
  return (
    <div className="me-root" data-me-theme={theme} style={{ minHeight: '100svh' }}>
      {children}
    </div>
  );
}
