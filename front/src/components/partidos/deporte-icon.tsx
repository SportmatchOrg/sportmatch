import type { ComponentType, SVGProps } from 'react';

import {
  BasquetIcon,
  FutbolIcon,
  PadelIcon,
  RunningIcon,
  TenisIcon,
} from '@/components/partidos/sport-icons';
import type { DeporteNombre } from '@/types/partido';

export type SportIcon = ComponentType<SVGProps<SVGSVGElement>>;

export const DEPORTE_ICON: Record<DeporteNombre, SportIcon> = {
  FUTBOL: FutbolIcon,
  BASQUET: BasquetIcon,
  TENIS: TenisIcon,
  PADEL: PadelIcon,
  RUNNING: RunningIcon,
};
