const RETRY =
  'rounded-full bg-glass-strong px-6 py-3 text-callout font-semibold text-white shadow-bevel transition-colors hover:bg-glass-solid';

export function RetryButton({ onRetry }: { onRetry: () => void }) {
  return (
    <button type="button" onClick={onRetry} className={RETRY}>
      Reintentar
    </button>
  );
}
