'use client';

import { ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { ReactNode } from 'react';

import { PROFILE_SECTION } from '@/components/profile/profile-layout';
import { cn } from '@/lib/utils';

type PlayedMatchesScreenProps = {
  title: string;
  children: ReactNode;
};

export function PlayedMatchesScreen({ title, children }: PlayedMatchesScreenProps) {
  const router = useRouter();

  return (
    <main className={cn(PROFILE_SECTION, 'flex flex-col gap-6 py-6 lg:py-10')}>
      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label="Volver"
          onClick={() => router.back()}
          className="flex size-11 shrink-0 items-center justify-center rounded-full bg-glass-solid text-white shadow-bevel backdrop-blur-chip transition hover:bg-glass-strong"
        >
          <ChevronLeft className="size-6" aria-hidden="true" />
        </button>

        <div className="flex min-w-0 flex-col gap-1">
          <span className="text-overline text-ink-46 uppercase">Historial</span>
          <h1 className="truncate text-title font-bold text-white">{title}</h1>
        </div>
      </div>

      {children}
    </main>
  );
}
