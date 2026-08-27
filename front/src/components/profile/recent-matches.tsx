import { CalendarX } from 'lucide-react';

import { PROFILE_SECTION } from '@/components/profile/profile-layout';
import { cn } from '@/lib/utils';

export function RecentMatches() {
  return (
    <section className={cn(PROFILE_SECTION, 'pt-8 lg:pt-10')}>
      <h2 className="text-title lg:text-[28px]">Partidos recientes</h2>

      <div className="mt-4 flex flex-col items-center gap-3 rounded-[20px] border border-glass-strong bg-glass px-6 py-10 text-center lg:rounded-[28px] lg:py-16">
        <CalendarX className="size-8 text-white/46" aria-hidden="true" />
        <p className="text-body text-white/46">Todavía no jugaste ningún partido</p>
      </div>
    </section>
  );
}
