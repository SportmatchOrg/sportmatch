import { LANDING_CONTAINER } from "@/components/landing/landing-container";
import { BrandMark } from "@/components/brand-mark";

export function LandingFooter() {
  return (
    <footer className="py-6 shadow-bevel">
      <div className={`${LANDING_CONTAINER} flex items-center gap-2`}>
        <BrandMark className="size-4" />
        <p className="text-caption text-ink-32">© 2026 SportMatch</p>
      </div>
    </footer>
  );
}
