'use client';

import { Select as SelectPrimitive } from '@base-ui/react/select';
import { ChevronDown } from 'lucide-react';

import { DROPDOWN_PANEL } from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

const TRIGGER =
  'relative flex h-12 w-full items-center rounded-sm bg-glass pr-10 pl-4 text-callout font-bold tabular-nums text-white shadow-bevel transition outline-none hover:bg-glass-strong focus-visible:ring-2 focus-visible:ring-brand data-popup-open:bg-glass-strong';

const ICON = 'pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-ink-46';

const POPUP = 'max-h-64 scroll-py-1';

const OPTION =
  'flex h-10 cursor-default items-center rounded-md px-3 text-callout font-bold tabular-nums text-white outline-none select-none data-highlighted:bg-glass-strong aria-selected:bg-brand aria-selected:text-brand-ink aria-selected:data-highlighted:bg-brand-bright data-disabled:pointer-events-none data-disabled:opacity-40';

export type SelectOption<T extends string | number> = {
  value: T;
  label: string;
  disabled?: boolean;
};

type SelectProps<T extends string | number> = {
  label: string;
  value: T;
  options: SelectOption<T>[];
  onChange: (value: T) => void;
  className?: string;
};

export function Select<T extends string | number>({
  label,
  value,
  options,
  onChange,
  className,
}: SelectProps<T>) {
  return (
    <SelectPrimitive.Root
      value={value}
      items={options}
      onValueChange={(next) => {
        if (next !== null) onChange(next);
      }}
    >
      <SelectPrimitive.Trigger aria-label={label} className={cn(TRIGGER, className)}>
        <SelectPrimitive.Value />
        <SelectPrimitive.Icon className={ICON}>
          <ChevronDown className="size-5" aria-hidden="true" />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>

      <SelectPrimitive.Portal>
        <SelectPrimitive.Positioner
          className="isolate z-[70] outline-none"
          sideOffset={4}
          alignItemWithTrigger={false}
        >
          <SelectPrimitive.Popup className={cn(DROPDOWN_PANEL, POPUP)}>
            {options.map((option) => (
              <SelectPrimitive.Item
                key={option.value}
                value={option.value}
                disabled={option.disabled}
                className={OPTION}
              >
                <SelectPrimitive.ItemText>{option.label}</SelectPrimitive.ItemText>
              </SelectPrimitive.Item>
            ))}
          </SelectPrimitive.Popup>
        </SelectPrimitive.Positioner>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  );
}
