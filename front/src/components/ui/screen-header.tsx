'use client';

import { ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { IconButton } from '@/components/ui/icon-button';

type ScreenHeaderProps = {
  overline: string;
  title: string;
};

export function ScreenHeader({ overline, title }: ScreenHeaderProps) {
  const router = useRouter();

  return (
    <div className="flex items-center gap-3">
      <IconButton label="Volver" onClick={() => router.back()}>
        <ChevronLeft className="size-6" aria-hidden="true" />
      </IconButton>

      <div className="flex min-w-0 flex-col gap-1">
        <span className="text-overline text-ink-46 uppercase">{overline}</span>
        <h1 className="truncate text-title font-bold text-white">{title}</h1>
      </div>
    </div>
  );
}
