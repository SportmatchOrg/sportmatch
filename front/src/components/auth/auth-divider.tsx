export function AuthDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-4">
      <span className="h-px flex-1 bg-neutral-800" />
      <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500">
        {label}
      </span>
      <span className="h-px flex-1 bg-neutral-800" />
    </div>
  );
}
