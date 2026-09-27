import type { Metadata } from 'next';
import { Space_Grotesk, JetBrains_Mono, Instrument_Sans, Inter_Tight, Inter, IBM_Plex_Mono } from 'next/font/google';
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

/* ModelEarth Ops typography.

   Space Grotesk carries the brand on the landing page and in Mission Control,
   where personality is the point. Ops is the opposite job: small type, dense
   rows, numbers read quickly by someone who is tired, and screens that get
   photographed and printed. Space Grotesk's geometric quirks, its single-storey
   shapes and its wide default figures all work against that at 13px.

   Inter is the plain, unglamorous answer. It was drawn for interfaces at small
   sizes, it has a tall x-height, and its tabular figures line up in a column of
   elapsed times. IBM Plex Mono replaces JetBrains Mono for the numbers: it has
   a slashed zero and unmistakable 1/l/I, which matters when the figure on the
   screen is a river level someone is about to act on.

   Both are scoped to the Ops shell. Nothing else in the app changes. */
const opsSans = Inter({
  variable: '--font-ops-sans',
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '500', '600', '700'],
});

const opsMono = IBM_Plex_Mono({
  variable: '--font-ops-mono',
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '500', '600'],
});

export const metadata: Metadata = {
  title: 'ModelEarth · Climate intelligence & mission control',
  description:
    'ModelEarth: a planetary-scale climate resilience intelligence layer, turning observation into decisions a district can act on, with the evidence attached.',
  metadataBase: new URL('https://www.modelearth.in'),
  icons: {
    icon: [
      { url: '/modelearth-demo-logo.svg', type: 'image/svg+xml' },
      { url: '/modelearth-favicon.png', type: 'image/png', sizes: '32x32' },
      { url: '/modelearth-icon.png', type: 'image/png', sizes: '64x64' },
    ],
    apple: '/modelearth-apple.png',
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
        className={`${spaceGrotesk.variable} ${jetbrainsMono.variable} ${instrumentSans.variable} ${interTight.variable} ${opsSans.variable} ${opsMono.variable} antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
