'use client';

import { useEffect, useRef, useState } from 'react';

import { BrandMark } from '@/components/brand-mark';
import { cn } from '@/lib/utils';

const RUNTIME_MS = 2800;
const REDUCED_MOTION_MS = 700;
const FADE_OUT_MS = 400;
const DEFAULT_TAGLINE = 'Encontrá tu próximo partido';

export function SplashMark({ className }: { className?: string }) {
  return <BrandMark className={className} leftClassName="sm-tri-l" rightClassName="sm-tri-r" />;
}

export function SplashScreen({
  onDone,
  tagline = DEFAULT_TAGLINE,
  soundSrc,
  className,
}: {
  onDone?: () => void;
  tagline?: string;
  soundSrc?: string;
  className?: string;
}) {
  const [leaving, setLeaving] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    const hold = prefersReducedMotion ? REDUCED_MOTION_MS : RUNTIME_MS;

    if (soundSrc && !prefersReducedMotion) {
      const audio = new Audio(soundSrc);
      audio.volume = 0.7;
      audioRef.current = audio;
      void audio.play().catch(() => {});
    }

    const leaveTimeout = setTimeout(() => setLeaving(true), hold);
    const doneTimeout = setTimeout(() => onDone?.(), hold + FADE_OUT_MS);

    return () => {
      clearTimeout(leaveTimeout);
      clearTimeout(doneTimeout);
      audioRef.current?.pause();
    };
  }, [onDone, soundSrc]);

  return (
    <div
      className={cn(
        'fixed inset-0 z-[100] flex flex-col items-center justify-center bg-base',
        'transition-opacity duration-400 motion-reduce:transition-none',
        leaving ? 'pointer-events-none opacity-0' : 'opacity-100',
        className
      )}
      role="status"
      aria-label="SportMatch"
    >
      <div className="sm-vignette pointer-events-none absolute inset-0" />

      <div className="relative flex flex-col items-center gap-6 sm:gap-9">
        <div className="sm-mark relative h-28 w-28 sm:h-40 sm:w-40">
          <div className="sm-glow pointer-events-none absolute left-1/2 top-1/2 h-[320%] w-[320%] -translate-x-1/2 -translate-y-1/2" />
          <SplashMark className="absolute inset-0 h-full w-full" />
          <div className="sm-flare pointer-events-none absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-0" />
        </div>

        <div className="sm-word">
          <span className="text-4xl font-extrabold tracking-[-0.036em] text-white sm:text-6xl">
            Sport<span className="text-brand">Match</span>
          </span>
        </div>
      </div>

      {tagline ? (
        <p className="sm-tag absolute bottom-16 text-[11px] font-medium uppercase tracking-[0.34em] text-white/40 sm:text-sm">
          {tagline}
        </p>
      ) : null}
    </div>
  );
}
