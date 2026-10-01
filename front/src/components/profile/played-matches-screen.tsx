import type { ReactNode } from 'react';

import { PROFILE_SECTION } from '@/components/profile/profile-layout';
import { ScreenHeader } from '@/components/ui/screen-header';
import { cn } from '@/lib/utils';

type PlayedMatchesScreenProps = {
  title: string;
  children: ReactNode;
};

export function PlayedMatchesScreen({ title, children }: PlayedMatchesScreenProps) {
  return (
    <main className={cn(PROFILE_SECTION, 'flex flex-col gap-6 py-6 lg:py-10')}>
      <ScreenHeader overline="Historial" title={title} />

      {children}
    </main>
  );
}
