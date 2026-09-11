'use client';

import Image from 'next/image';
import { useState } from 'react';

import { cn } from '@/lib/utils';
import { DEPORTE_LABEL, type DeporteNombre } from '@/types/partido';

const SPORTS: { nombre: DeporteNombre; photo: string }[] = [
  { nombre: 'FUTBOL', photo: '/deportes/football-match.jpg' },
  { nombre: 'BASQUET', photo: '/deportes/basketball-aerial.jpg' },
  { nombre: 'TENIS', photo: '/deportes/tennis-clay.jpg' },
  { nombre: 'PADEL', photo: '/deportes/padel-pro.jpg' },
  { nombre: 'RUNNING', photo: '/deportes/running-bw.jpg' },
];

const DEFAULT_INDEX = 0;
const EXPAND_RATIO = 3.2;

function flexBasisFor(isActive: boolean): string {
  const units = EXPAND_RATIO + SPORTS.length - 1;

  return `${((isActive ? EXPAND_RATIO : 1) / units) * 100}%`;
}

export function LandingSports() {
  const [activeIndex, setActiveIndex] = useState(DEFAULT_INDEX);

  return (
    <section className="flex flex-col gap-8 pb-20 md:pb-24">
      <h2 className="px-6 text-headline font-extrabold tracking-tight sm:text-title md:px-12 lg:text-display">
        Elegí tu deporte.
      </h2>

      <ul className="flex h-70 gap-3 px-6 md:px-12 lg:h-75">
        {SPORTS.map(({ nombre, photo }, index) => {
          const isActive = index === activeIndex;

          return (
            <li
              key={nombre}
              style={{ flexBasis: flexBasisFor(isActive) }}
              className={cn(
                'relative grow-0 overflow-hidden rounded-md shadow-bevel',
                'transition-[flex-basis] duration-500 ease-out motion-reduce:transition-none'
              )}
            >
              <button
                type="button"
                onClick={() => setActiveIndex(index)}
                onMouseEnter={() => setActiveIndex(index)}
                aria-pressed={isActive}
                className="absolute inset-0 h-full w-full cursor-pointer text-left outline-none focus-visible:ring-3 focus-visible:ring-brand/50"
              >
                <Image
                  src={photo}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 45vw, 70vw"
                  className={cn(
                    'object-cover object-[50%_25%] origin-bottom transition duration-500 ease-out motion-reduce:transition-none',
                    isActive ? 'scale-100 grayscale-0' : 'scale-105 grayscale'
                  )}
                />

                <span className="absolute inset-0 bg-gradient-to-t from-ambient-bottom via-transparent to-transparent" />

                <span
                  className={cn(
                    'absolute inset-x-5 bottom-5 flex items-center gap-3',
                    'transition-opacity duration-500 ease-out motion-reduce:transition-none',
                    isActive ? 'opacity-100' : 'opacity-0'
                  )}
                >
                  <span className="h-6 w-[3px] shrink-0 rounded-full bg-brand shadow-brand-glow" />
                  <span className="truncate text-subhead">{DEPORTE_LABEL[nombre]}</span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
