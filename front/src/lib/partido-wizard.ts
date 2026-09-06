import type { PartidoForm, PartidoFormErrors } from '@/lib/partido-form';

export type WizardStep = {
  name: string;
  question: string;
  fields: (keyof PartidoForm)[];
};

export const WIZARD_STEPS: WizardStep[] = [
  { name: 'Deporte', question: '¿A qué vas a jugar?', fields: ['deporteId'] },
  { name: 'Lugar', question: '¿Dónde se juega?', fields: ['ubicacion'] },
  { name: 'Horario', question: '¿A qué hora arranca?', fields: ['fecha'] },
  {
    name: 'Jugadores',
    question: '¿Cuántos jugadores?',
    fields: ['cupo', 'nivel', 'titulo', 'descripcion'],
  },
  { name: 'Revisión', question: '¿Listo para publicar?', fields: [] },
];

export const LAST_STEP = WIZARD_STEPS.length - 1;

export function stepErrors(errors: PartidoFormErrors, step: number): PartidoFormErrors {
  const found: PartidoFormErrors = {};

  for (const field of WIZARD_STEPS[step].fields) {
    const message = errors[field];

    if (message) found[field] = message;
  }

  return found;
}

export function firstStepWithError(errors: PartidoFormErrors): number {
  const index = WIZARD_STEPS.findIndex((wizardStep) =>
    wizardStep.fields.some((field) => errors[field])
  );

  return index === -1 ? LAST_STEP : index;
}
