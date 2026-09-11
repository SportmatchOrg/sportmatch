import Image from 'next/image';
import Link from 'next/link';

import { pillButtonClassName } from '@/components/ui/pill-button';
import { IMAGES } from '@/lib/images';

export function LandingHero() {
  return (
    <section className="relative isolate flex min-h-[92svh] items-end overflow-hidden px-6 pb-16 pt-32 md:min-h-[88svh] md:items-center md:px-12 md:pb-28">
      <Image
        src={IMAGES.landingHero}
        alt=""
        fill
        priority
        sizes="100vw"
        className="-z-10 object-cover"
      />
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-base via-base/40 to-transparent" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-base via-transparent to-transparent" />

      <div className="flex w-full max-w-xl flex-col gap-7">
        <h1 className="text-title font-extrabold tracking-[-0.036em] sm:text-display lg:text-hero">
          Encontrá con
          <br />
          quién jugar hoy.
        </h1>

        <p className="max-w-md text-callout text-ink-64">
          Partidos abiertos cerca tuyo, gente de tu nivel y la cancha ya reservada. Entrás, jugás,
          listo.
        </p>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Link href="/signup" className={pillButtonClassName()}>
            Comenzá a jugar
          </Link>
          <Link href="/login" className={pillButtonClassName({ variant: 'glass' })}>
            Iniciar sesión
          </Link>
        </div>
      </div>
    </section>
  );
}
