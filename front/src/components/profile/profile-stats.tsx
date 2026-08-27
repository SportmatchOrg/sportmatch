import { Flame, Star, Trophy, type LucideIcon } from 'lucide-react';

import { PROFILE_SECTION } from '@/components/profile/profile-layout';
import { cn } from '@/lib/utils';

const TILE_BEVEL =
  'shadow-bevel-lit';

const PENDING_VALUE = '—';

type Stat = {
  label: string;
  icon: LucideIcon;
  iconClassName: string;
};

const STATS: Stat[] = [
  { label: 'Puntaje', icon: Star, iconClassName: 'fill-warning text-warning' },
  { label: 'Partidos Jugados', icon: Trophy, iconClassName: 'text-brand' },
  { label: 'Semanas', icon: Flame, iconClassName: 'fill-warning text-warning' },
];

export function ProfileStats() {
  return (
    <div className={cn(PROFILE_SECTION, 'flex items-stretch justify-center gap-3 pt-6 lg:gap-4 lg:pt-[26px]')}>
      {STATS.map(({ label, icon: Icon, iconClassName }) => (
        <div
          key={label}
          title="Próximamente"
          className={cn(
            'flex flex-1 flex-col items-center gap-[5px] rounded-[20px] bg-glass px-2 py-4',
            'lg:flex-row lg:gap-4 lg:rounded-[28px] lg:px-[22px] lg:py-5',
            TILE_BEVEL
          )}
        >
          <span className="flex shrink-0 items-center justify-center lg:size-[46px] lg:rounded-[12px] lg:bg-glass-strong">
            <Icon className={cn('size-[17px] lg:size-[22px]', iconClassName)} aria-hidden="true" />
          </span>

          <span className="flex flex-col items-center gap-[5px] lg:items-start">
            <span className="text-[24px] font-extrabold leading-[34.8px] tracking-[-0.72px] text-white lg:text-[34px] lg:leading-[34px] lg:tracking-[-1.02px]">
              {PENDING_VALUE}
            </span>
            <span className="text-caption leading-[15px] tracking-[-0.17px] text-white/46">
              {label}
            </span>
          </span>
        </div>
      ))}
    </div>
  );
}
