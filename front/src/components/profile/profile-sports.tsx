import { SignalHigh } from 'lucide-react';

import { SPORT_ICON } from '@/components/matches/sport-icon';
import { PROFILE_SECTION } from '@/components/profile/profile-layout';
import { cn } from '@/lib/utils';
import { LEVEL_LABEL, SPORT_LABEL, type Level, type Sport } from '@/types/match';

const CHIP =
  'flex h-chip items-center gap-1.5 rounded-full px-4 text-callout font-semibold whitespace-nowrap';

type ProfileSportsProps = {
  sports: Sport[];
  level: Level | null;
};

export function ProfileSports({ sports, level }: ProfileSportsProps) {
  if (sports.length === 0 && !level) return null;

  return (
    <ul
      aria-label="Deportes y nivel"
      className={cn(PROFILE_SECTION, 'flex flex-wrap justify-center gap-2 pt-4 lg:justify-start lg:pt-6')}
    >
      {sports.map((sport) => {
        const Icon = SPORT_ICON[sport.name];

        return (
          <li key={sport.id} className={cn(CHIP, 'bg-glass-strong text-white shadow-bevel')}>
            <Icon className="size-4" aria-hidden="true" />
            {SPORT_LABEL[sport.name]}
          </li>
        );
      })}

      {level && (
        <li className={cn(CHIP, 'bg-brand-tint text-brand')}>
          <SignalHigh className="size-4" aria-hidden="true" />
          <span className="sr-only">Nivel: </span>
          {LEVEL_LABEL[level]}
        </li>
      )}
    </ul>
  );
}
