import { ApiError, apiFetch } from '@/lib/api';
import { localDateTimeValue, type MatchForm } from '@/lib/match-form';
import type { Level } from '@/types/match';

export type MatchDraft = {
  sportId: string | null;
  level: Level | null;
  date: string | null;
  location: string | null;
  capacity: number | null;
  description: string | null;
};

const UNAVAILABLE = 'El asistente no está disponible ahora. Podés armarlo paso a paso.';

const DRAFT_ERROR_MESSAGE: Partial<Record<number, string>> = {
  422: 'No pudimos armar el partido con eso. Probá contando deporte, día y hora.',
  429: 'Ya usaste todos los borradores de hoy. Seguí paso a paso o probá mañana.',
  503: UNAVAILABLE,
};

export async function fetchMatchDraft(text: string): Promise<MatchDraft> {
  return apiFetch<MatchDraft>('/ai/match-draft', {
    method: 'POST',
    body: JSON.stringify({ text }),
  });
}

export function matchDraftErrorMessage(error: unknown): string {
  if (!(error instanceof ApiError)) return UNAVAILABLE;

  return DRAFT_ERROR_MESSAGE[error.status] ?? UNAVAILABLE;
}

export type ImageTarget = 'profile' | 'match';

type ImageRequest = {
  prompt: string;
  target: ImageTarget;
  matchId?: string;
};

const IMAGE_FILE_NAME = 'imagen-ia.jpg';

const IMAGE_ERROR_MESSAGE: Partial<Record<number, string>> = {
  400: 'Escribí una descripción de al menos 3 letras.',
  403: 'No podés cambiar la foto de este perfil o partido.',
  422: 'No pudimos generar una imagen con eso. Probá con otras palabras.',
  429: 'Ya generaste todas las imágenes de hoy. Subí tu foto o probá mañana.',
  503: 'La generación de imágenes no está disponible ahora. Podés subir tu foto.',
};

export async function generateImage(request: ImageRequest): Promise<string> {
  const { image } = await apiFetch<{ image: string }>('/ai/images', {
    method: 'POST',
    body: JSON.stringify(request),
  });

  return image;
}

export async function imageFileFromDataUrl(dataUrl: string): Promise<File> {
  const blob = await (await fetch(dataUrl)).blob();

  return new File([blob], IMAGE_FILE_NAME, { type: blob.type });
}

export function imageErrorMessage(error: unknown): string {
  if (!(error instanceof ApiError)) return IMAGE_ERROR_MESSAGE[503] as string;

  return IMAGE_ERROR_MESSAGE[error.status] ?? (IMAGE_ERROR_MESSAGE[503] as string);
}

export function applyMatchDraft(form: MatchForm, draft: MatchDraft): MatchForm {
  return {
    ...form,
    sportId: draft.sportId ?? form.sportId,
    level: draft.level ?? form.level,
    date: draft.date ? localDateTimeValue(new Date(draft.date)) : form.date,
    location: draft.location ?? form.location,
    latitude: draft.location ? null : form.latitude,
    longitude: draft.location ? null : form.longitude,
    capacity: draft.capacity === null ? form.capacity : String(draft.capacity),
    description: draft.description ?? form.description,
  };
}
