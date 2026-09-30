import { cn } from '@/lib/utils';
import { SPORT_LABEL, type SportName } from '@/types/match';

const PILL =
  'flex h-9.5 items-center gap-1.5 whitespace-nowrap rounded-full bg-sheet px-3 text-caption font-bold text-white';

const TAIL = 'h-2 w-4 -translate-y-px bg-sheet [clip-path:polygon(0_0,100%_0,50%_100%)]';

const SPORT_DOT: Record<SportName, string> = {
  FUTBOL: 'bg-sport-futbol shadow-[0_0_8px_var(--color-sport-futbol)]',
  BASQUET: 'bg-sport-basquet shadow-[0_0_8px_var(--color-sport-basquet)]',
  TENIS: 'bg-sport-tenis shadow-[0_0_8px_var(--color-sport-tenis)]',
  PADEL: 'bg-sport-padel shadow-[0_0_8px_var(--color-sport-padel)]',
  RUNNING: 'bg-sport-running shadow-[0_0_8px_var(--color-sport-running)]',
};

export function MatchPin({ sport }: { sport: SportName }) {
  return (
    <span className="flex flex-col items-center drop-shadow-map-pin transition-transform hover:-translate-y-0.5">
      <span className={PILL}>
        <span className={cn('size-2 rounded-full', SPORT_DOT[sport])} aria-hidden="true" />
        {SPORT_LABEL[sport]}
      </span>
      <span className={TAIL} aria-hidden="true" />
    </span>
  );
}
