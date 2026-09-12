import Link from 'next/link';

import { BrandLogo } from '@/components/brand-logo';
import { BrandMark } from '@/components/brand-mark';
import { pillButtonClassName } from '@/components/ui/pill-button';

export function LandingHeader() {
  return (
    <header className="absolute inset-x-0 top-0 z-10 px-4 pt-4 md:px-12 md:pt-8">
      <div className="flex items-center justify-between gap-4 rounded-full bg-glass-solid px-4 py-3 shadow-bevel backdrop-blur-chip md:rounded-none md:bg-transparent md:p-0 md:shadow-none md:backdrop-blur-none">
        <Link href="/" className="flex items-center gap-2" aria-label="SportMatch">
          <span className="flex size-7 shrink-0 items-center justify-center rounded-[9px] bg-glass shadow-bevel md:size-[34px] md:rounded-[11px]">
            <BrandMark className="size-4 md:size-5" />
          </span>
          <BrandLogo className="text-body tracking-[-0.02em] md:text-[20px] md:leading-[31px] md:tracking-[-0.013em]" />
        </Link>

        <nav className="flex items-center gap-2">
          <Link
            href="/login"
            className="hidden h-10 items-center rounded-full px-4 text-callout font-semibold leading-[17px] text-white md:flex"
          >
            Ingresar
          </Link>
          <Link
            href="/signup"
            className={pillButtonClassName({ size: 'md', className: 'h-10 leading-[17px]' })}
          >
            Registrarse
          </Link>
        </nav>
      </div>
    </header>
  );
}
