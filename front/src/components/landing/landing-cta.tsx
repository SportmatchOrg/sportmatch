import Image from 'next/image';
import Link from 'next/link';

import { pillButtonClassName } from '@/components/ui/pill-button';
import { IMAGES } from '@/lib/images';

export function LandingCta() {
  return (
    <section className="relative isolate flex flex-col items-center gap-6 overflow-hidden px-6 py-24 text-center md:px-12 md:py-32">
      <Image
        src={IMAGES.landingCta}
        alt=""
        fill
        sizes="100vw"
        className="-z-10 object-cover"
      />
      <div className="absolute inset-0 -z-10 bg-scrim-strong" />

      <h2 className="max-w-2xl text-balance text-headline font-extrabold tracking-tight sm:text-title lg:text-display">
        Hay un partido esperándote esta noche.
      </h2>

      <p className="max-w-md text-callout text-ink-64">
        Ingresá a SportMatch, elegí tu deporte y jugá hoy mismo.
      </p>

      <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
        <Link href="/signup" className={pillButtonClassName()}>
          Registrarse
        </Link>
        <Link href="/login" className={pillButtonClassName({ variant: 'glass' })}>
          Iniciar sesión
        </Link>
      </div>
    </section>
  );
}
