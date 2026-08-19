export function GoogleButton({ label }: { label: string }) {
  return (
    <button
      type="button"
      disabled
      title="Disponible en la próxima entrega"
      className="flex w-full cursor-not-allowed items-center justify-center gap-3 rounded-full border border-white/12 bg-surface-glass py-4 text-base font-semibold text-white transition hover:bg-white/10"
    >
      <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
        <path
          className="fill-google-blue"
          d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5a5.6 5.6 0 0 1-2.4 3.7v3h3.9c2.3-2.1 3.5-5.2 3.5-8.9z"
        />
        <path
          className="fill-google-green"
          d="M12 24c3.2 0 5.9-1.1 7.9-2.9l-3.9-3c-1.1.7-2.4 1.2-4 1.2-3.1 0-5.7-2.1-6.6-4.9H1.4v3.1A12 12 0 0 0 12 24z"
        />
        <path
          className="fill-google-yellow"
          d="M5.4 14.4a7.2 7.2 0 0 1 0-4.6V6.7H1.4a12 12 0 0 0 0 10.8l4-3.1z"
        />
        <path
          className="fill-google-red"
          d="M12 4.8c1.8 0 3.3.6 4.6 1.8l3.4-3.4C17.9 1.2 15.2 0 12 0A12 12 0 0 0 1.4 6.7l4 3.1C6.3 6.9 8.9 4.8 12 4.8z"
        />
      </svg>
      {label}
    </button>
  );
}
