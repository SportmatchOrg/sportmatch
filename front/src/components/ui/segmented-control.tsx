'use client';

import { useLayoutEffect, useRef, useState, type CSSProperties } from 'react';

import { cn } from '@/lib/utils';

const STRETCH_DELAY_MS = 70;

const TRACK =
  'relative flex w-full rounded-full bg-glass-strong p-1 shadow-bevel';

const THUMB =
  'pointer-events-none absolute inset-y-1 rounded-full bg-white shadow-bevel transition-[left,right] duration-[var(--dur-base)] ease-[var(--ease-out)] motion-reduce:transition-none';

const OPTION =
  'relative z-10 h-9 flex-1 rounded-full px-4 text-callout font-semibold whitespace-nowrap transition-colors duration-[var(--dur-base)] outline-none focus-visible:ring-2 focus-visible:ring-brand lg:flex-none lg:px-5';

export type SegmentOption<T extends string> = {
  value: T;
  label: string;
};

type SegmentedControlProps<T extends string> = {
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  label: string;
  className?: string;
};

type ThumbBox = {
  left: number;
  right: number;
  leadingEdge: 'left' | 'right';
};

function thumbStyle({ left, right, leadingEdge }: ThumbBox): CSSProperties {
  const [leftDelay, rightDelay] = leadingEdge === 'left' ? [0, STRETCH_DELAY_MS] : [STRETCH_DELAY_MS, 0];

  return { left, right, transitionDelay: `${leftDelay}ms, ${rightDelay}ms` };
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  label,
  className,
}: SegmentedControlProps<T>) {
  const trackRef = useRef<HTMLDivElement>(null);
  const optionRefs = useRef(new Map<T, HTMLButtonElement>());
  const [thumb, setThumb] = useState<ThumbBox | null>(null);

  useLayoutEffect(() => {
    const track = trackRef.current;

    if (!track) return;

    function measure(container: HTMLDivElement) {
      const option = optionRefs.current.get(value);

      if (!option) return;

      const left = option.offsetLeft;
      const right = container.clientWidth - left - option.offsetWidth;

      setThumb((previous) => ({
        left,
        right,
        leadingEdge: previous && left < previous.left ? 'left' : 'right',
      }));
    }

    const observer = new ResizeObserver(() => measure(track));
    observer.observe(track);

    return () => observer.disconnect();
  }, [value]);

  return (
    <div ref={trackRef} role="group" aria-label={label} className={cn(TRACK, className)}>
      {thumb && <span aria-hidden="true" className={THUMB} style={thumbStyle(thumb)} />}

      {options.map((option) => {
        const selected = option.value === value;

        return (
          <button
            key={option.value}
            ref={(element) => {
              if (element) optionRefs.current.set(option.value, element);
              else optionRefs.current.delete(option.value);
            }}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange(option.value)}
            className={cn(OPTION, selected ? 'text-midnight' : 'text-ink-64 hover:text-white')}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
