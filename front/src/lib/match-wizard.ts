import type { MatchForm, MatchFormErrors } from '@/lib/match-form';

export type WizardStep = {
  name: string;
  question: string;
  fields: (keyof MatchForm)[];
};

export const WIZARD_STEPS: WizardStep[] = [
  { name: 'Deporte', question: '¿A qué vas a jugar?', fields: ['sportId'] },
  { name: 'Lugar', question: '¿Dónde se juega?', fields: ['location'] },
  { name: 'Horario', question: '¿A qué hora arranca?', fields: ['date'] },
  {
    name: 'Jugadores',
    question: '¿Cuántos jugadores?',
    fields: ['capacity', 'level', 'title', 'description'],
  },
  { name: 'Revisión', question: '¿Listo para publicar?', fields: [] },
];

export const LAST_STEP = WIZARD_STEPS.length - 1;

export function stepErrors(errors: MatchFormErrors, step: number): MatchFormErrors {
  const found: MatchFormErrors = {};

  for (const field of WIZARD_STEPS[step].fields) {
    const message = errors[field];

    if (message) found[field] = message;
  }

  return found;
}

export function firstStepWithError(errors: MatchFormErrors): number {
  const index = WIZARD_STEPS.findIndex((wizardStep) =>
    wizardStep.fields.some((field) => errors[field])
  );

  return index === -1 ? LAST_STEP : index;
}
