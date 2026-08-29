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

/* ==========================================================================
   Theme - paper (warm light) · white (clean) · void (dark)
   ========================================================================== */

export const THEMES = ['paper', 'white', 'void'] as const;
export type Theme = (typeof THEMES)[number];

const STORAGE_KEY = 'modelearth-theme';

const ThemeCtx = createContext<{ theme: Theme; setTheme: (t: Theme) => void }>({
  theme: 'paper',
  setTheme: () => {},
});

export const useTheme = () => useContext(ThemeCtx);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('paper');

  // Read the stored preference after mount. Server renders `paper` either way,
  // so there is nothing to mismatch.
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored && (THEMES as readonly string[]).includes(stored)) {
        setThemeState(stored as Theme);
      }
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

  // Keep the browser UI (scrollbars, form controls) in step with the theme.
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
   Brand mark
   ========================================================================== */

export function Mark({ size = 26 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 26 26"
      fill="none"
      aria-hidden="true"
      className="me-mark"
      style={{ flex: '0 0 auto' }}
    >
      <circle cx="13" cy="13" r="11.5" stroke="currentColor" strokeWidth="1.5" />
      {/* the reach itself, held steady */}
      <path
        className="me-mark-river"
        d="M1.9 10.4c3.6 1.6 6.6-1.5 10.2-.2 3.5 1.3 6.4 4.6 11.4 2.6"
        stroke="var(--water)"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      {/* a short segment travelling the same course, so the line reads as
          moving water rather than a drawn curve */}
      <path
        className="me-mark-flow"
        d="M1.9 10.4c3.6 1.6 6.6-1.5 10.2-.2 3.5 1.3 6.4 4.6 11.4 2.6"
        stroke="var(--water)"
        strokeWidth="1.9"
        strokeLinecap="round"
      />
    </svg>
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
