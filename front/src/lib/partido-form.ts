import {
  CUPO_DEFAULT,
  CUPO_MAX,
  CUPO_MIN,
  DESCRIPCION_MAX,
  TITULO_MAX,
  UBICACION_MAX,
  UBICACION_MIN,
  type Nivel,
} from '@/types/partido';

export type PartidoForm = {
  deporteId: string;
  nivel: Nivel | '';
  fecha: string;
  ubicacion: string;
  cupo: string;
  titulo: string;
  descripcion: string;
};

export type PartidoFormErrors = Partial<Record<keyof PartidoForm, string>>;

export const EMPTY_PARTIDO_FORM: PartidoForm = {
  deporteId: '',
  nivel: '',
  fecha: '',
  ubicacion: '',
  cupo: String(CUPO_DEFAULT),
  titulo: '',
  descripcion: '',
};

export function validatePartidoForm(form: PartidoForm): PartidoFormErrors {
  const errors: PartidoFormErrors = {};

  if (!form.deporteId) {
    errors.deporteId = 'Elegí un deporte.';
  }

  if (!form.nivel) {
    errors.nivel = 'Elegí un nivel.';
  }

  const fecha = new Date(form.fecha);
  if (!form.fecha || Number.isNaN(fecha.getTime())) {
    errors.fecha = 'Elegí una fecha y hora.';
  } else if (fecha.getTime() <= Date.now()) {
    errors.fecha = 'La fecha tiene que ser futura.';
  }

  const ubicacion = form.ubicacion.trim();
  if (ubicacion.length < UBICACION_MIN) {
    errors.ubicacion = `La ubicación necesita al menos ${UBICACION_MIN} caracteres.`;
  } else if (ubicacion.length > UBICACION_MAX) {
    errors.ubicacion = `La ubicación no puede superar los ${UBICACION_MAX} caracteres.`;
  }

  const cupo = Number(form.cupo);
  if (!form.cupo || !Number.isInteger(cupo)) {
    errors.cupo = 'Escribí un número entero.';
  } else if (cupo < CUPO_MIN || cupo > CUPO_MAX) {
    errors.cupo = `El cupo va de ${CUPO_MIN} a ${CUPO_MAX} jugadores.`;
  }

  if (form.titulo.length > TITULO_MAX) {
    errors.titulo = `El título no puede superar los ${TITULO_MAX} caracteres.`;
  }

  if (form.descripcion.length > DESCRIPCION_MAX) {
    errors.descripcion = `La descripción no puede superar los ${DESCRIPCION_MAX} caracteres.`;
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

export function toCreatePartidoBody(form: PartidoForm) {
  return {
    deporteId: form.deporteId,
    nivel: form.nivel as Nivel,
    fecha: new Date(form.fecha).toISOString(),
    ubicacion: form.ubicacion.trim(),
    cupo: Number(form.cupo),
    ...(form.descripcion.trim() ? { descripcion: form.descripcion.trim() } : {}),
  };
}
