export function MapPin() {
  return (
    <span className="group flex cursor-grab flex-col items-center active:cursor-grabbing">
      <svg
        viewBox="0 0 32 42"
        className="h-[42px] w-8 drop-shadow-brand-glow transition group-active:-translate-y-1.5"
        aria-hidden="true"
      >
        <path
          d="M16 1C7.7 1 1 7.6 1 15.8c0 10.4 12.2 23.3 14.1 25.2a1.3 1.3 0 0 0 1.8 0C18.8 39.1 31 26.2 31 15.8 31 7.6 24.3 1 16 1Z"
          className="fill-brand stroke-midnight"
          strokeWidth="2"
        />
        <circle cx="16" cy="16" r="6" className="fill-midnight" />
      </svg>
      <span className="-mt-1 h-1.5 w-5 rounded-full bg-base/80 opacity-0 blur-[2px] transition group-active:opacity-100" />
    </span>
  );
}
