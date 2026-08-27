import { Skeleton } from '@/components/ui/skeleton';

export function ProfileSkeleton() {
  return (
    <div aria-busy="true" aria-label="Cargando perfil">
      <Skeleton className="h-[196px] w-full rounded-none lg:h-[206px]" />

      <div className="mx-auto -mt-[52px] flex w-full max-w-md flex-col items-center gap-3 px-5 lg:-mt-[54px] lg:max-w-[1440px] lg:flex-row lg:items-end lg:gap-6 lg:px-8">
        <Skeleton className="size-[104px] shrink-0 rounded-full ring-[3px] ring-base lg:size-[140px]" />
        <div className="flex flex-col items-center gap-2 lg:flex-1 lg:items-start lg:pb-2">
          <Skeleton className="h-8 w-44 lg:h-11 lg:w-64" />
          <Skeleton className="h-5 w-52" />
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-md gap-3 px-5 pt-6 lg:max-w-[1440px] lg:gap-4 lg:px-8 lg:pt-[26px]">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-[110px] flex-1 rounded-[20px] lg:h-[94px] lg:rounded-[28px]" />
        ))}
      </div>

      <div className="mx-auto w-full max-w-md px-5 pt-8 lg:max-w-[1440px] lg:px-8 lg:pt-10">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="mt-4 h-[140px] w-full rounded-[20px] lg:h-[180px] lg:rounded-[28px]" />
      </div>
    </div>
  );
}
