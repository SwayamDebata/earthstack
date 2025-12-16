'use client';

import HeroSection from '@/components/landing/HeroSection';
import PlatformCards from '@/components/landing/PlatformCards';
import LaptopDemo from '@/components/landing/LaptopDemo';
import PremiumFooter from '@/components/landing/PremiumFooter';
import CursorSpotlight from '@/components/ui/CursorSpotlight';

export default function Home() {
  return (
    <main className="min-h-screen bg-[#080B14]">
      <CursorSpotlight />
      <HeroSection />
      <PlatformCards />
      <LaptopDemo />
      <PremiumFooter />
    </main>
  );
}
