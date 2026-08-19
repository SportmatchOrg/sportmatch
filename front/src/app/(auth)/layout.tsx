import type { ReactNode } from 'react';

const HERO_IMAGE =
  'https://images.unsplash.com/photo-1517927033932-b3d18e61fb3a?w=1400&h=1800&fit=crop&auto=format';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-neutral-950 md:flex-row">
      {/* Hero: on top for mobile, left half on desktop */}
      <div className="relative h-[38vh] w-full shrink-0 overflow-hidden md:h-auto md:w-1/2">
        <img src={HERO_IMAGE} alt="" className="h-full w-full object-cover" />

        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-neutral-950 md:bg-gradient-to-r md:from-black/40 md:via-black/50 md:to-neutral-950" />

        <div className="absolute inset-x-0 bottom-10 flex flex-col items-center md:inset-0 md:justify-center">
          <h1 className="text-[42px] font-extrabold tracking-[-0.036em] text-white md:text-6xl">
            Sport<span className="text-sky-400">Match</span>
          </h1>
          <p className="mt-2 text-sm text-neutral-300 md:text-base">
            Encontrá tu próximo partido
          </p>
        </div>
      </div>

      {/* Form: overlapping card on mobile, right half on desktop */}
      <div className="relative z-10 -mt-8 flex flex-1 justify-center rounded-t-[2rem] bg-neutral-950 px-6 pb-12 pt-10 md:mt-0 md:items-center md:rounded-none md:px-12">
        <div className="w-full max-w-sm">{children}</div>
      </div>
    </div>
  );
}
