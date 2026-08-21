import type { ReactNode } from 'react';

import { BrandLogo } from '@/components/brand-logo';

const HERO_IMAGE = 'auth-hero.jpg';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-neutral-950 md:flex-row">
      <div className="relative h-[38vh] w-full shrink-0 overflow-hidden md:h-auto md:w-1/2">
        <img src={HERO_IMAGE} alt="" className="h-full w-full object-cover" />

        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-neutral-950 md:bg-gradient-to-r md:from-black/40 md:via-black/50 md:to-neutral-950" />

        <div className="absolute inset-x-0 bottom-0 flex flex-col items-center gap-2 pb-10 md:inset-0 md:justify-center md:pb-0">
          <h1>
            <BrandLogo className="text-[42px] md:text-6xl" />
          </h1>
          <p className="text-sm text-neutral-300 md:text-base">
            Encontrá tu próximo partido
          </p>
        </div>
      </div>

      <div className="relative z-10 flex flex-1 justify-center rounded-t-[2rem] bg-neutral-950 px-6 pb-12 pt-10 md:items-center md:rounded-none md:px-12">
        <div className="w-full max-w-sm">{children}</div>
      </div>
    </div>
  );
}
