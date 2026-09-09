import { DEPORTE_LABEL, type DeporteNombre } from '@/types/partido';

const CHIP =
  'rounded-full bg-glass-solid px-3 py-1 text-caption font-semibold text-white shadow-bevel backdrop-blur-chip';

type DeporteChipProps = {
  nombre: DeporteNombre;
};

export function DeporteChip({ nombre }: DeporteChipProps) {
  return <span className={CHIP}>{DEPORTE_LABEL[nombre]}</span>;
}
