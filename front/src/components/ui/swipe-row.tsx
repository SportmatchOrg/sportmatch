'use client';

import type { LucideIcon } from 'lucide-react';
import {
  useRef,
  useState,
  type MouseEvent,
  type PointerEvent,
  type ReactNode,
  type TransitionEvent,
} from 'react';

import { DIRECTION_LOCK_PX, prefersReducedMotion, rubberBand } from '@/lib/gesture';
import { cn } from '@/lib/utils';

const COMMIT_RATIO = 0.35;
const BLOCKED_DIRECTION_DAMPING = 0.55;
const HAPTIC_MS = 8;

const SURFACE_TRANSITION = {
  idle: 'transform var(--dur-base) var(--ease-spring)',
  exiting: 'transform var(--dur-base) var(--ease-out)',
} as const;

const TONE = {
  success: {
    idle: 'bg-success-tint text-success',
    armed: 'bg-success text-midnight',
  },
  neutral: {
    idle: 'bg-glass-strong text-ink-64',
    armed: 'bg-ink-32 text-white',
  },
} as const;

export type SwipeActionTone = keyof typeof TONE;

export type SwipeAction = {
  label: string;
  icon: LucideIcon;
  tone: SwipeActionTone;
  onCommit: () => void;
};

type SwipeRowProps = {
  children: ReactNode;
  startAction?: SwipeAction;
  endAction?: SwipeAction;
  className?: string;
};

type Phase = 'idle' | 'dragging' | 'exiting' | 'collapsing';

type Gesture = {
  pointerId: number;
  pointerType: string;
  startX: number;
  startY: number;
  width: number;
  offset: number;
  axis: 'x' | 'y' | null;
};

export function SwipeRow({ children, startAction, endAction, className }: SwipeRowProps) {
  const gesture = useRef<Gesture | null>(null);
  const suppressClick = useRef(false);
  const committedAction = useRef<SwipeAction | null>(null);
  const [offset, setOffset] = useState(0);
  const [phase, setPhase] = useState<Phase>('idle');
  const [rowWidth, setRowWidth] = useState(0);

  function actionAt(value: number): SwipeAction | undefined {
    if (value > 0) return startAction;
    if (value < 0) return endAction;
    return undefined;
  }

  function isArmedAt(value: number, width: number): boolean {
    return actionAt(value) !== undefined && width > 0 && Math.abs(value) >= width * COMMIT_RATIO;
  }

  const action = actionAt(offset);
  const armed = isArmedAt(offset, rowWidth);

  function resist(dx: number, rowWidth: number): number {
    const target = dx > 0 ? startAction : endAction;
    const distance = Math.abs(dx);
    const commitDistance = rowWidth * COMMIT_RATIO;

    if (!target) return rubberBand(dx, rowWidth) * BLOCKED_DIRECTION_DAMPING;
    if (distance <= commitDistance) return dx;

    return Math.sign(dx) * (commitDistance + rubberBand(distance - commitDistance, rowWidth));
  }

  function reset() {
    gesture.current = null;
    setPhase('idle');
    setOffset(0);
  }

  function commit(target: SwipeAction, direction: number, rowWidth: number) {
    gesture.current = null;

    if (prefersReducedMotion()) {
      target.onCommit();
      return;
    }

    committedAction.current = target;
    setPhase('exiting');
    setOffset(direction * rowWidth);
  }

  function handleSurfaceTransitionEnd(event: TransitionEvent<HTMLDivElement>) {
    if (phase !== 'exiting' || event.target !== event.currentTarget) return;
    if (event.propertyName !== 'transform') return;

    setPhase('collapsing');
  }

  function handleCollapseTransitionEnd(event: TransitionEvent<HTMLDivElement>) {
    if (phase !== 'collapsing' || event.target !== event.currentTarget) return;
    if (event.propertyName !== 'opacity') return;

    committedAction.current?.onCommit();
    committedAction.current = null;
  }

  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    if (phase !== 'idle' || event.button !== 0) return;

    suppressClick.current = false;
    setRowWidth(event.currentTarget.offsetWidth);
    gesture.current = {
      pointerId: event.pointerId,
      pointerType: event.pointerType,
      startX: event.clientX,
      startY: event.clientY,
      width: event.currentTarget.offsetWidth,
      offset: 0,
      axis: null,
    };
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    const current = gesture.current;

    if (!current || current.pointerId !== event.pointerId) return;

    const dx = event.clientX - current.startX;
    const dy = event.clientY - current.startY;

    if (current.axis === null) {
      if (Math.max(Math.abs(dx), Math.abs(dy)) < DIRECTION_LOCK_PX) return;

      current.axis = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';

      if (current.axis === 'x') {
        event.currentTarget.setPointerCapture(event.pointerId);
        setPhase('dragging');
      }
    }

    if (current.axis !== 'x') return;

    const next = resist(dx, current.width);
    const becameArmed = isArmedAt(next, current.width) && !isArmedAt(current.offset, current.width);

    if (becameArmed && current.pointerType === 'touch') navigator.vibrate?.(HAPTIC_MS);

    current.offset = next;
    setOffset(next);
  }

  function handlePointerUp(event: PointerEvent<HTMLDivElement>) {
    const current = gesture.current;

    if (!current || current.pointerId !== event.pointerId) return;
    if (current.axis !== 'x') {
      gesture.current = null;
      return;
    }

    suppressClick.current = true;

    const target = actionAt(current.offset);

    if (target && isArmedAt(current.offset, current.width)) {
      commit(target, Math.sign(current.offset), current.width);
    } else {
      reset();
    }
  }

  function handleClickCapture(event: MouseEvent<HTMLDivElement>) {
    if (!suppressClick.current) return;

    event.preventDefault();
    event.stopPropagation();
    suppressClick.current = false;
  }

  const Icon = action?.icon;

  return (
    <div
      onTransitionEnd={handleCollapseTransitionEnd}
      className={cn(
        'grid transition-[grid-template-rows,opacity] duration-[var(--dur-base)] ease-[var(--ease-out)] motion-reduce:transition-none',
        phase === 'collapsing' ? 'grid-rows-[0fr] opacity-0' : 'grid-rows-[1fr]'
      )}
    >
      <div className="min-h-0 overflow-hidden">
        <div className={className}>
          <div className="relative">
            {action && Icon && (
              <div
                aria-hidden="true"
                className={cn(
                  'absolute inset-0 flex items-center rounded-md px-5 transition-colors duration-[var(--dur-fast)]',
                  offset > 0 ? 'justify-start' : 'justify-end',
                  armed ? TONE[action.tone].armed : TONE[action.tone].idle
                )}
              >
                <span className="flex items-center gap-2 text-callout font-bold">
                  <Icon
                    className={cn(
                      'size-5 transition-transform duration-[var(--dur-fast)]',
                      armed && 'scale-125'
                    )}
                  />
                  {action.label}
                </span>
              </div>
            )}

            <div
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={reset}
              onClickCapture={handleClickCapture}
              onTransitionEnd={handleSurfaceTransitionEnd}
              style={{
                transform: `translateX(${offset}px)`,
                transition:
                  phase === 'dragging'
                    ? 'none'
                    : phase === 'idle'
                      ? SURFACE_TRANSITION.idle
                      : SURFACE_TRANSITION.exiting,
              }}
              className="relative touch-pan-y select-none motion-reduce:!transition-none"
            >
              {children}
            </div>

            <span className="sr-only" aria-live="polite">
              {armed && action ? `Soltá para ${action.label.toLowerCase()}` : ''}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
