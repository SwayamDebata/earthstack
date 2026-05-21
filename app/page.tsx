'use client';

import HeroSection from '@/components/landing/HeroSection';
import PlatformCards from '@/components/landing/PlatformCards';
import LaptopDemo from '@/components/landing/LaptopDemo';
import PremiumFooter from '@/components/landing/PremiumFooter';
import CursorSpotlight from '@/components/ui/CursorSpotlight';
import MarqueeStrip from '@/components/landing/MarqueeStrip';
import LandingOrbitalDeck from '@/components/landing/LandingOrbitalDeck';
import BentoFeatures from '@/components/landing/BentoFeatures';
import LandingSignalPath from '@/components/landing/LandingSignalPath';
import LandingSpecMatrix from '@/components/landing/LandingSpecMatrix';
import LandingHorizonCTA from '@/components/landing/LandingHorizonCTA';
import Landing3DTunnel from '@/components/landing/Landing3DTunnel';
import LandingHologramShowcase from '@/components/landing/LandingHologramShowcase';
import LandingBhoomiG1 from '@/components/landing/LandingBhoomiG1';
import LandingPinnedReveal from '@/components/landing/LandingPinnedReveal';

export default function Home() {
  return (
    <main className="min-h-screen bg-[#050816] font-[family-name:var(--font-sans)]">
      <CursorSpotlight />
      <HeroSection />
      <MarqueeStrip />
      <Landing3DTunnel />
      <LandingOrbitalDeck />
      <LandingBhoomiG1 />
      <BentoFeatures />
      <LandingHologramShowcase />
      <LandingSignalPath />
      <PlatformCards />
      <LandingPinnedReveal />
      <LandingSpecMatrix />
      <LaptopDemo />
      <LandingHorizonCTA />
      <PremiumFooter />
    </main>
  );
}
