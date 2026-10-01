import {
  CAPACITY_DEFAULT,
  CAPACITY_MAX,
  CAPACITY_MIN,
  DESCRIPTION_MAX,
  LOCATION_MAX,
  LOCATION_MIN,
  TITLE_MAX,
  type Level,
  type Match,
} from '@/types/match';

export type MatchForm = {
  sportId: string;
  level: Level | '';
  date: string;
  location: string;
  latitude: number | null;
  longitude: number | null;
  capacity: string;
  title: string;
  description: string;
};

export type MatchFormErrors = Partial<Record<keyof MatchForm, string>>;

export const EMPTY_MATCH_FORM: MatchForm = {
  sportId: '',
  level: '',
  date: '',
  location: '',
  latitude: null,
  longitude: null,
  capacity: String(CAPACITY_DEFAULT),
  title: '',
  description: '',
};

export function validateMatchForm(form: MatchForm): MatchFormErrors {
  const errors: MatchFormErrors = {};

  if (!form.sportId) {
    errors.sportId = 'Elegí un deporte.';
  }

  if (!form.level) {
    errors.level = 'Elegí un nivel.';
  }

  const date = new Date(form.date);
  if (!form.date || Number.isNaN(date.getTime())) {
    errors.date = 'Elegí una fecha y hora.';
  } else if (date.getTime() <= Date.now()) {
    errors.date = 'La fecha tiene que ser futura.';
  }

  const location = form.location.trim();
  if (location.length < LOCATION_MIN) {
    errors.location = `La ubicación necesita al menos ${LOCATION_MIN} caracteres.`;
  } else if (location.length > LOCATION_MAX) {
    errors.location = `La ubicación no puede superar los ${LOCATION_MAX} caracteres.`;
  }

  if (form.latitude === null || form.longitude === null) {
    errors.latitude = 'Elegí una dirección de la lista.';
  }

  const capacity = Number(form.capacity);
  if (!form.capacity || !Number.isInteger(capacity)) {
    errors.capacity = 'Escribí un número entero.';
  } else if (capacity < CAPACITY_MIN || capacity > CAPACITY_MAX) {
    errors.capacity = `El cupo va de ${CAPACITY_MIN} a ${CAPACITY_MAX} jugadores.`;
  }

  if (form.title.length > TITLE_MAX) {
    errors.title = `El título no puede superar los ${TITLE_MAX} caracteres.`;
  }

  if (form.description.length > DESCRIPTION_MAX) {
    errors.description = `La descripción no puede superar los ${DESCRIPTION_MAX} caracteres.`;
  }

  return errors;
}

export function localDateTimeValue(date: Date = new Date()): string {
  const pad = (value: number) => String(value).padStart(2, '0');

  return [
    date.getFullYear(),
    '-',
    pad(date.getMonth() + 1),
    '-',
    pad(date.getDate()),
    'T',
    pad(date.getHours()),
    ':',
    pad(date.getMinutes()),
  ].join('');
}

export function toCreateMatchBody(form: MatchForm) {
  return {
    sportId: form.sportId,
    level: form.level as Level,
    date: new Date(form.date).toISOString(),
    location: form.location.trim(),
    latitude: form.latitude,
    longitude: form.longitude,
    capacity: Number(form.capacity),
    ...(form.description.trim() ? { description: form.description.trim() } : {}),
  };
}

export function toMatchForm(match: Match): MatchForm {
  return {
    sportId: match.sportId,
    level: match.level,
    date: localDateTimeValue(new Date(match.date)),
    location: match.location,
    latitude: match.latitude ?? null,
    longitude: match.longitude ?? null,
    capacity: String(match.capacity),
    title: '',
    description: match.description ?? '',
  };
}

export function toUpdateMatchBody(form: MatchForm) {
  return {
    sportId: form.sportId,
    level: form.level as Level,
    date: new Date(form.date).toISOString(),
    location: form.location.trim(),
    latitude: form.latitude,
    longitude: form.longitude,
    capacity: Number(form.capacity),
    description: form.description.trim(),
  };
}
