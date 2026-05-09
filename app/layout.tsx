import type { Metadata } from 'next';
import { Space_Grotesk, JetBrains_Mono } from 'next/font/google';
import 'mapbox-gl/dist/mapbox-gl.css';
import './globals.css';
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

export const metadata: Metadata = {
  title: 'ModelEarth · Climate intelligence & mission control',
  description:
    'ModelEarth: planetary-scale resilience intelligence. Flood risk, hydrology, and operations in a unified command experience.',
  metadataBase: new URL('https://www.modelearth.in'),
  icons: {
    icon: [{ url: '/modelearth-favicon.svg', type: 'image/svg+xml' }],
    apple: '/modelearth-favicon.svg',
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${spaceGrotesk.variable} ${jetbrainsMono.variable} antialiased bg-slate-950`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
