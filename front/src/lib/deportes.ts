import type { Deporte } from '@/types/partido';

const DEPORTES: Deporte[] = [
  { id: 'cmtbj3fpo0002kc3h3ikmnwnh', nombre: 'FUTBOL' },
  { id: 'cmtbj3fpo0001kc3h99170u08', nombre: 'BASQUET' },
  { id: 'cmtbj3fpo0000kc3hguht70ip', nombre: 'TENIS' },
  { id: 'cmtbj3fpo0004kc3hhnt80l7c', nombre: 'PADEL' },
  { id: 'cmtbj3fpo0003kc3hek5k89bj', nombre: 'RUNNING' },
];

export async function fetchDeportes(): Promise<Deporte[]> {
  return DEPORTES;
}
