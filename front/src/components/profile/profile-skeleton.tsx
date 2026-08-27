import { PROFILE_SECTION, ProfileIdentityRow } from '@/components/profile/profile-layout';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export function ProfileSkeleton() {
  return (
    <div aria-busy="true" aria-label="Cargando perfil">
      <Skeleton className="h-[196px] w-full rounded-none lg:h-[206px]" />

      <ProfileIdentityRow>
        <Skeleton className="size-[104px] shrink-0 rounded-full ring-[3px] ring-base lg:size-[140px]" />
        <div className="flex flex-col items-center gap-2 lg:flex-1 lg:items-start lg:pb-2">
          <Skeleton className="h-8 w-44 lg:h-11 lg:w-64" />
          <Skeleton className="h-5 w-52" />
        </div>
      </ProfileIdentityRow>

      <div className={cn(PROFILE_SECTION, 'flex gap-3 pt-6 lg:gap-4 lg:pt-[26px]')}>
        {[0, 1, 2].map((i) => (
          <Skeleton
            key={i}
            className="h-[110px] flex-1 rounded-[20px] lg:h-[94px] lg:rounded-[28px]"
          />
        ))}
      </div>

      <div className={cn(PROFILE_SECTION, 'pt-8 lg:pt-10')}>
        <Skeleton className="h-8 w-56" />
        <Skeleton className="mt-4 h-[140px] w-full rounded-[20px] lg:h-[180px] lg:rounded-[28px]" />
      </div>
    </div>
  );
}
