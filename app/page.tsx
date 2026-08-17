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
import LandingKrishiOS from '@/components/landing/LandingKrishiOS';
import LandingPinnedReveal from '@/components/landing/LandingPinnedReveal';
import LandingStakes from '@/components/landing/LandingStakes';
import LandingFieldMedia from '@/components/landing/LandingFieldMedia';
import LandingMission from '@/components/landing/LandingMission';
import LandingHumanImpact from '@/components/landing/LandingHumanImpact';
import LandingOrigin from '@/components/landing/LandingOrigin';
import LandingProofStrip from '@/components/landing/LandingProofStrip';

export default function Home() {
  return (
    <main className="min-h-screen bg-[#050816] font-[family-name:var(--font-sans)]">
      <CursorSpotlight />
      <HeroSection />
      <div className="relative z-20 -mt-8 px-4 pb-10 md:-mt-12 md:px-8">
        <LandingProofStrip />
      </div>
      <LandingStakes />
      <LandingFieldMedia />
      <MarqueeStrip />
      <Landing3DTunnel />
      <LandingOrbitalDeck />
      <LandingBhoomiG1 />
      <LandingKrishiOS />
      <LandingMission />
      <LandingHumanImpact />
      <BentoFeatures />
      <LandingHologramShowcase />
      <LandingSignalPath />
      <PlatformCards />
      <LandingPinnedReveal />
      <LandingSpecMatrix />
      <LaptopDemo />
      <LandingOrigin />
      <LandingHorizonCTA />
      <PremiumFooter />
    </main>
  );
}
