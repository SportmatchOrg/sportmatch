import type { ComponentType, SVGProps } from 'react';

import {
  BasquetIcon,
  FutbolIcon,
  PadelIcon,
  RunningIcon,
  TenisIcon,
} from '@/components/matches/sport-icons';
import type { SportName } from '@/types/match';

export type SportIcon = ComponentType<SVGProps<SVGSVGElement>>;

export const SPORT_ICON: Record<SportName, SportIcon> = {
  FUTBOL: FutbolIcon,
  BASQUET: BasquetIcon,
  TENIS: TenisIcon,
  PADEL: PadelIcon,
  RUNNING: RunningIcon,
};
