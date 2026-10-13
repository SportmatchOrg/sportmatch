'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useRef, type ComponentProps } from 'react';
import { DayPicker, getDefaultClassNames, type DayButton } from 'react-day-picker';

import { cn } from '@/lib/utils';

const NAV_BUTTON =
  'flex size-9 items-center justify-center rounded-full bg-glass text-white shadow-bevel transition outline-none hover:bg-glass-strong focus-visible:ring-2 focus-visible:ring-brand aria-disabled:cursor-not-allowed aria-disabled:opacity-32';

const DAY =
  'flex aspect-square w-full items-center justify-center rounded-sm text-callout font-semibold tabular-nums transition outline-none focus-visible:ring-2 focus-visible:ring-brand lg:aspect-auto lg:h-full lg:min-h-8';

const DAY_IDLE = 'text-white hover:bg-glass-strong';

const DAY_SELECTED = 'bg-brand text-brand-ink shadow-glow hover:bg-brand-bright';

const DAY_TODAY = 'text-brand hover:bg-glass-strong';

const DAY_OUTSIDE = 'text-ink-32 hover:bg-glass-strong';

const DAY_DISABLED = 'cursor-not-allowed text-ink-16';

function dayClassName(modifiers: ComponentProps<typeof DayButton>['modifiers']): string {
  if (modifiers.selected) return DAY_SELECTED;
  if (modifiers.disabled) return DAY_DISABLED;
  if (modifiers.today) return DAY_TODAY;
  if (modifiers.outside) return DAY_OUTSIDE;

  return DAY_IDLE;
}

function CalendarDayButton({
                             className,
                             day,
                             modifiers,
                             ...props
                           }: ComponentProps<typeof DayButton>) {
  const ref = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (modifiers.focused) ref.current?.focus();
  }, [modifiers.focused]);

  return (
    <button
      ref={ref}
      type="button"
      data-day={day.isoDate}
      className={cn(DAY, dayClassName(modifiers), className)}
      {...props}
    />
  );
}

// On desktop the calendar stretches to its parent's height, so the weeks share the room available.
function Calendar({
                    className,
                    classNames,
                    showOutsideDays = true,
                    components,
                    ...props
                  }: ComponentProps<typeof DayPicker>) {
  const defaults = getDefaultClassNames();

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn(
        'w-full max-w-sm rounded-md bg-glass p-4 shadow-bevel lg:flex lg:h-full lg:max-w-none lg:flex-col',
        className
      )}
      classNames={{
        root: cn('w-full', defaults.root),
        months: cn('relative flex flex-col lg:min-h-0 lg:flex-1', defaults.months),
        month: cn('flex w-full flex-col gap-4 lg:min-h-0 lg:flex-1', defaults.month),
        nav: cn(
          'absolute inset-x-0 top-0 flex items-center justify-between',
          defaults.nav
        ),
        button_previous: cn(NAV_BUTTON, defaults.button_previous),
        button_next: cn(NAV_BUTTON, defaults.button_next),
        month_caption: cn('flex h-9 items-center justify-center', defaults.month_caption),
        caption_label: cn(
          'text-callout font-bold text-white capitalize select-none',
          defaults.caption_label
        ),
        month_grid: cn(
          'w-full border-collapse lg:flex lg:min-h-0 lg:flex-1 lg:flex-col',
          defaults.month_grid
        ),
        weeks: cn('lg:flex lg:min-h-0 lg:flex-1 lg:flex-col', defaults.weeks),
        weekdays: cn('flex', defaults.weekdays),
        weekday: cn(
          'flex-1 text-overline font-normal text-ink-46 uppercase select-none',
          defaults.weekday
        ),
        week: cn('flex w-full pt-1 lg:flex-1', defaults.week),
        day: cn('flex-1 p-0.5 text-center select-none lg:flex', defaults.day),
        hidden: cn('invisible', defaults.hidden),
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation, className: chevronClassName }) =>
          orientation === 'left' ? (
            <ChevronLeft className={cn('size-5', chevronClassName)} aria-hidden="true" />
          ) : (
            <ChevronRight className={cn('size-5', chevronClassName)} aria-hidden="true" />
          ),
        DayButton: CalendarDayButton,
        ...components,
      }}
      {...props}
    />
  );
}

export { Calendar };
