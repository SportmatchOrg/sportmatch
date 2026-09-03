import { cn } from '@/lib/utils';

export function BrandLogo({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'animate-logo-glow font-extrabold tracking-[-0.036em] text-white motion-reduce:animate-none',
        className
      )}
    >
      Sport<span className="text-brand">Match</span>
    </span>
  );
}
