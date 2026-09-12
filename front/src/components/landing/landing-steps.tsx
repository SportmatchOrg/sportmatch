import { Check, Flame, MapPin, type LucideIcon } from 'lucide-react';

const STEPS: { label: string; title: string; description: string; icon: LucideIcon }[] = [
  {
    label: 'Paso 1',
    title: 'Mirá qué hay cerca',
    description:
      'Abrís el mapa y ves los partidos abiertos de hoy a diez cuadras tuyo, con nivel y lugares libres.',
    icon: MapPin,
  },
  {
    label: 'Paso 2',
    title: 'Sumate en un toque',
    description:
      'Reservás tu lugar, pagás tu parte de la cancha y el grupo se entera al instante.',
    icon: Check,
  },
  {
    label: 'Paso 3',
    title: 'Jugá y volvé',
    description:
      'Puntuás a los que jugaron, subís de nivel y te empiezan a llegar los partidos que te quedan bien.',
    icon: Flame,
  },
];

export function LandingSteps() {
  return (
    <section className="flex flex-col gap-8 px-6 py-20 md:px-12 md:py-24">
      <div className="flex flex-col gap-3">
        <p className="text-overline uppercase text-ink-46">Cómo funciona</p>
        <h2 className="text-headline font-extrabold tracking-tight sm:text-title lg:text-display">
          Tres pasos y estás jugando.
        </h2>
      </div>

      <ul className="grid gap-4 md:grid-cols-3">
        {STEPS.map(({ label, title, description, icon: Icon }) => (
          <li
            key={label}
            className="flex flex-col gap-3 rounded-md bg-raised p-6 shadow-card-glass-lit"
          >
            <p className="text-overline uppercase text-brand">{label}</p>

            <div className="flex items-start justify-between gap-4">
              <h3 className="text-subhead">{title}</h3>
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-glass shadow-bevel">
                <Icon className="size-4 text-white" aria-hidden="true" />
              </span>
            </div>

            <p className="text-callout text-ink-46">{description}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
