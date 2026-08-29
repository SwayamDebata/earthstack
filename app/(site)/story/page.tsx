'use client';

import ValleyHero from '@/components/site/ValleyHero';
import RisingWater from '@/components/site/RisingWater';
import PageHero from '@/components/site/PageHero';
import MonsoonNight from '@/components/site/MonsoonNight';
import { CallToAction } from '@/components/site/Closing';

export default function StoryPage() {
  return (
    <>
      <ValleyHero />

      <PageHero
        eyebrow="The story · explained simply"
        title="How a flood warning actually gets made."
        lede="Four moments in one August, on one stretch of the Mahanadi. No jargon, just what the engine sees, and when."
        note="Most of the year, nothing happens. That is what makes the one day legible."
      />
      <RisingWater />

      <MonsoonNight />
      <CallToAction />
    </>
  );
}
