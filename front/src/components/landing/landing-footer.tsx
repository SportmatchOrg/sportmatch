import { BrandMark } from '@/components/brand-mark';

export function LandingFooter() {
  return (
    <footer className="flex items-center gap-2 px-6 py-6 shadow-bevel md:px-12">
      <BrandMark className="size-4" />
      <p className="text-caption text-ink-32">© 2026 SportMatch</p>
    </footer>
  );
}
