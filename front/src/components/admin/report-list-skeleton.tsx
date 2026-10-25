import { Skeleton } from '@/components/ui/skeleton';

const SKELETON_ROWS = 4;

export function ReportListSkeleton() {
  return (
    <div aria-busy="true" aria-label="Cargando reportes" className="flex flex-col gap-2">
      {Array.from({ length: SKELETON_ROWS }, (_, index) => (
        <Skeleton key={index} className="h-[76px] rounded-md" />
      ))}
    </div>
  );
}
