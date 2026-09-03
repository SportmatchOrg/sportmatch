import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

export const PROFILE_SECTION = 'mx-auto w-full max-w-md px-5 lg:max-w-[1440px] lg:px-8';

const IDENTITY_ROW = cn(
  PROFILE_SECTION,
  '-mt-[52px] flex flex-col items-center gap-3',
  'lg:-mt-[54px] lg:flex-row lg:items-end lg:gap-6'
);

export function ProfileIdentityRow({ children }: { children: ReactNode }) {
  return <div className={IDENTITY_ROW}>{children}</div>;
}
