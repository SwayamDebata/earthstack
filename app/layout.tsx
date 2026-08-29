import type { Metadata } from 'next';
import { Space_Grotesk, JetBrains_Mono, Instrument_Sans, Inter_Tight } from 'next/font/google';
import 'mapbox-gl/dist/mapbox-gl.css';
import './globals.css';
import './site.css';
import Providers from '@/app/providers';

const spaceGrotesk = Space_Grotesk({
  variable: '--font-sans',
  subsets: ['latin'],
  display: 'swap',
  weight: ['300', '400', '500', '600', '700'],
});

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-mono',
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '500', '600'],
});

// Landing typography, exactly the Route D prototype's: Instrument Sans set
// heavy and very tight for display, Inter Tight for body, JetBrains Mono for
// labels and data. Flat terminals and closed apertures, so it stays sharp.
const instrumentSans = Instrument_Sans({
  variable: '--font-display',
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '500', '600', '700'],
});

const interTight = Inter_Tight({
  variable: '--font-site-sans',
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '500', '600'],
});

export const metadata: Metadata = {
  title: 'ModelEarth · Climate intelligence & mission control',
  description:
    'ModelEarth: flood early warning and operational command for districts. Verified historical replay, live hydrology and risk in one surface.',
  metadataBase: new URL('https://www.modelearth.in'),
  icons: {
    icon: [{ url: '/modelearth-favicon.svg', type: 'image/svg+xml' }],
    apple: '/modelearth-favicon.svg',
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        {/* Scroll reveals start at opacity 0. Without JS nothing would ever
            un-hide them, so the landing page would render blank to crawlers
            and to anyone with scripting off. */}
        <noscript>
          <style>{`.me-reveal{opacity:1!important;transform:none!important}`}</style>
        </noscript>
      </head>
      <body
        className={`${spaceGrotesk.variable} ${jetbrainsMono.variable} ${instrumentSans.variable} ${interTight.variable} antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
