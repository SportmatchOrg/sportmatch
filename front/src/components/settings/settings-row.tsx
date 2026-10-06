import { ChevronRight, type LucideIcon } from 'lucide-react';
import Link from 'next/link';
import type { ButtonHTMLAttributes } from 'react';

import { cn } from '@/lib/utils';

const ROW =
  'flex h-18 w-full items-center gap-3.5 rounded-md bg-glass px-4 text-left shadow-bevel transition outline-none hover:bg-glass-strong focus-visible:ring-2 focus-visible:ring-brand active:scale-[var(--press-scale-card)] disabled:cursor-not-allowed disabled:opacity-60 lg:h-13 lg:gap-3 lg:rounded-sm';

const ICON =
  'flex size-9.5 shrink-0 items-center justify-center rounded-sm bg-glass-strong lg:size-8 lg:rounded-xs';

const TONE = {
  default: { row: 'text-white', icon: 'text-brand' },
  danger: { row: 'text-danger', icon: 'text-danger' },
} as const;

type SettingsRowContent = {
  icon: LucideIcon;
  label: string;
  hint?: string;
  tone?: keyof typeof TONE;
};

function RowContent({ icon: Icon, label, hint, tone = 'default' }: SettingsRowContent) {
  return (
    <>
      <span className={cn(ICON, TONE[tone].icon)}>
        <Icon className="size-4.5 lg:size-4" aria-hidden="true" />
      </span>

      <span className="flex min-w-0 flex-1 flex-col lg:flex-row lg:items-center lg:gap-3">
        <span className="shrink-0 text-callout font-semibold">{label}</span>
        {hint && <span className="truncate text-caption text-ink-46">{hint}</span>}
      </span>

      {tone === 'default' && (
        <ChevronRight className="size-4.5 shrink-0 text-ink-46" aria-hidden="true" />
      )}
    </>
  );
}

type SettingsRowLinkProps = SettingsRowContent & { href: string };

export function SettingsRowLink({ href, tone = 'default', ...content }: SettingsRowLinkProps) {
  return (
    <Link href={href} className={cn(ROW, TONE[tone].row)}>
      <RowContent tone={tone} {...content} />
    </Link>
  );
}

type SettingsRowButtonProps = SettingsRowContent &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'>;

export function SettingsRowButton({
                                    icon,
                                    label,
                                    hint,
                                    tone = 'default',
                                    className,
                                    ...props
                                  }: SettingsRowButtonProps) {
  return (
    <button type="button" className={cn(ROW, TONE[tone].row, className)} {...props}>
      <RowContent icon={icon} label={label} hint={hint} tone={tone} />
    </button>
  );
}
