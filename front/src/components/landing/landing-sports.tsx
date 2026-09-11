import Image from 'next/image';

import { DEPORTE_LABEL, type DeporteNombre } from '@/types/partido';

const SPORTS: { nombre: DeporteNombre; photo: string; wide: boolean }[] = [
  { nombre: 'FUTBOL', photo: '/deportes/football-match.jpg', wide: true },
  { nombre: 'BASQUET', photo: '/deportes/basketball-aerial.jpg', wide: false },
  { nombre: 'TENIS', photo: '/deportes/tennis-clay.jpg', wide: false },
];

export function LandingSports() {
  return (
    <section className="flex flex-col gap-8 pb-20 md:pb-24">
      <h2 className="px-6 text-headline font-extrabold tracking-tight sm:text-title md:px-12 lg:text-display">
        Elegí tu deporte.
      </h2>

      <ul className="flex snap-x snap-mandatory gap-4 overflow-x-auto px-6 pb-2 md:px-12 lg:grid lg:grid-cols-[1.4fr_1fr_1fr] lg:overflow-visible lg:pb-0">
        {SPORTS.map(({ nombre, photo, wide }) => (
          <li
            key={nombre}
            className="relative h-60 w-[72%] shrink-0 snap-start overflow-hidden rounded-md shadow-bevel lg:h-75 lg:w-auto"
          >
            <Image
              src={photo}
              alt=""
              fill
              sizes={wide ? '(min-width: 1024px) 40vw, 72vw' : '(min-width: 1024px) 28vw, 72vw'}
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ambient-bottom via-transparent to-transparent" />
            <h3 className="absolute bottom-5 left-5 text-subhead">{DEPORTE_LABEL[nombre]}</h3>
          </li>
        ))}
      </ul>
    </section>
  );
}
