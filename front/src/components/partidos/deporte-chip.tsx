import { SPORT_LABEL, type SportName } from '@/types/match';

const CHIP =
  'rounded-full bg-glass-solid px-3 py-1 text-caption font-semibold text-white shadow-bevel backdrop-blur-chip';

type DeporteChipProps = {
  name: SportName;
};

export function DeporteChip({ name }: DeporteChipProps) {
  return <span className={CHIP}>{SPORT_LABEL[name]}</span>;
}
