'use client';

import type { ReactNode } from 'react';
import { SiteRoot, ThemeProvider } from '@/components/site/primitives';
import SiteNav from '@/components/site/SiteNav';
import BrandIntro from '@/components/site/BrandIntro';
import { SiteFooter } from '@/components/site/Closing';

export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <SiteRoot>
        <a href="#main" className="me-a11y-skip">
          Skip to content
        </a>
        <BrandIntro />
        <SiteNav />
        <main id="main">{children}</main>
        <SiteFooter />
      </SiteRoot>
    </ThemeProvider>
  );
}
