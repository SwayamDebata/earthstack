'use client';

import type { ReactNode } from 'react';
import { SiteRoot, ThemeProvider } from '@/components/site/primitives';
import SiteNav from '@/components/site/SiteNav';
import { SiteFooter } from '@/components/site/Closing';

export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <SiteRoot>
        <a href="#main" className="me-a11y-skip">
          Skip to content
        </a>
        <SiteNav />
        <main id="main">{children}</main>
        <SiteFooter />
      </SiteRoot>
    </ThemeProvider>
  );
}
