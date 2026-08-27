export type DeporteNombre = 'FUTBOL' | 'BASQUET' | 'TENIS' | 'PADEL' | 'RUNNING';

export type Deporte = {
  id: string;
  nombre: DeporteNombre;
};

export const DEPORTE_LABEL: Record<DeporteNombre, string> = {
  FUTBOL: 'Fútbol',
  BASQUET: 'Básquet',
  TENIS: 'Tenis',
  PADEL: 'Pádel',
  RUNNING: 'Running',
};

export type Nivel = 'PRINCIPIANTE' | 'INTERMEDIO' | 'AVANZADO';

export const NIVELES: Nivel[] = ['PRINCIPIANTE', 'INTERMEDIO', 'AVANZADO'];

export const NIVEL_LABEL: Record<Nivel, string> = {
  PRINCIPIANTE: 'Principiante',
  INTERMEDIO: 'Intermedio',
  AVANZADO: 'Avanzado',
};

export type Organizador = {
  id: string;
  nombre: string;
  fotoUrl: string | null;
};

export type Partido = {
  id: string;
  deporteId: string;
  nivel: Nivel;
  fecha: string;
  ubicacion: string;
  cupo: number;
  descripcion: string | null;
  organizador: Organizador;
};

export const CUPO_MIN = 2;
export const CUPO_MAX = 30;
export const UBICACION_MIN = 3;
export const UBICACION_MAX = 120;
export const DESCRIPCION_MAX = 500;
