"use client";

import Image from "next/image";
import { useState } from "react";

import { LANDING_CONTAINER } from "@/components/landing/landing-container";
import { cn } from "@/lib/utils";
import { SPORT_LABEL, type SportName } from "@/types/match";

const SPORTS: { name: SportName; photo: string }[] = [
  { name: "FUTBOL", photo: "/deportes/football-match.jpg" },
  { name: "BASQUET", photo: "/deportes/basketball-aerial.jpg" },
  { name: "TENIS", photo: "/deportes/tennis-clay.jpg" },
  { name: "PADEL", photo: "/deportes/padel-pro.jpg" },
  { name: "RUNNING", photo: "/deportes/running-bw.jpg" },
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
    <section className="pb-20 md:pb-24">
      <div className={`${LANDING_CONTAINER} flex flex-col gap-8`}>
        <h2 className="text-headline font-extrabold tracking-tight sm:text-title lg:text-display">
          Elegí tu deporte.
        </h2>

        <ul className="flex h-70 gap-3 lg:h-75">
          {SPORTS.map(({ name, photo }, index) => {
            const isActive = index === activeIndex;

            return (
              <li
                key={name}
                style={{ flexBasis: flexBasisFor(isActive) }}
                className={cn(
                  "relative grow-0 overflow-hidden rounded-md shadow-bevel",
                  "transition-[flex-basis] duration-500 ease-out motion-reduce:transition-none",
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
                      "object-cover object-[50%_25%] origin-bottom transition duration-500 ease-out motion-reduce:transition-none",
                      isActive
                        ? "scale-100 grayscale-0"
                        : "scale-105 grayscale",
                    )}
                  />

                  <span className="absolute inset-0 bg-gradient-to-t from-ambient-bottom via-transparent to-transparent" />

                  <span
                    className={cn(
                      "absolute inset-x-5 bottom-5 flex items-center gap-3",
                      "transition-opacity duration-500 ease-out motion-reduce:transition-none",
                      isActive ? "opacity-100" : "opacity-0",
                    )}
                  >
                    <span className="h-6 w-[3px] shrink-0 rounded-full bg-brand shadow-brand-glow" />
                    <span className="truncate text-subhead">
                      {SPORT_LABEL[name]}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
