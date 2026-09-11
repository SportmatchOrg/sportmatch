const TRACK_TRANSITION = 'width var(--dur-base) var(--ease-out)';

type WizardProgressProps = {
  step: number;
  total: number;
};

export function WizardProgress({ step, total }: WizardProgressProps) {
  return (
    <span
      role="progressbar"
      aria-valuemin={1}
      aria-valuemax={total}
      aria-valuenow={step + 1}
      className="h-[5px] flex-1 overflow-hidden rounded-full bg-glass-strong"
    >
      <span
        style={{ width: `${((step + 1) / total) * 100}%`, transition: TRACK_TRANSITION }}
        className="block h-full rounded-full bg-brand"
      />
    </span>
  );
}
