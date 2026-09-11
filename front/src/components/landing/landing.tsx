import { LandingCta } from '@/components/landing/landing-cta';
import { LandingFooter } from '@/components/landing/landing-footer';
import { LandingHeader } from '@/components/landing/landing-header';
import { LandingHero } from '@/components/landing/landing-hero';
import { LandingSports } from '@/components/landing/landing-sports';
import { LandingSteps } from '@/components/landing/landing-steps';

export function Landing() {
  return (
    <div className="relative flex min-h-dvh flex-col bg-base text-white">
      <LandingHeader />
      <main className="flex-1">
        <LandingHero />
        <LandingSteps />
        <LandingSports />
        <LandingCta />
      </main>
      <LandingFooter />
    </div>
  );
}
