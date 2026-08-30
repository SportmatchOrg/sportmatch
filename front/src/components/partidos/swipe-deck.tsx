'use client';

import { Check, Compass, Layers, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState, type PointerEvent } from 'react';

import { SwipeCard, type SwipeDecision } from '@/components/partidos/swipe-card';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { Toast } from '@/components/ui/toast';
import { ApiError } from '@/lib/api';
import { joinPartido } from '@/lib/partidos';
import type { Partido } from '@/types/partido';

const DECISION_THRESHOLD = 110;
const INDICATOR_THRESHOLD = 40;
const ROTATION_DIVISOR = 22;
const FLYOUT_DISTANCE = 600;
const FLYOUT_LIFT = -40;
const FLYOUT_DURATION = 300;
const TAP_TOLERANCE = 8;
const TOAST_DURATION = 2800;

const CONFLICT_MESSAGE = 'No pudimos sumarte: el partido está lleno o ya estás anotado.';
const JOIN_ERROR_MESSAGE = 'No pudimos sumarte al partido. Probá de nuevo.';

const RETURN_TRANSITION = 'transform 320ms var(--ease-spring)';

const BEHIND_BASE =
  'brightness-70 transition-transform duration-[320ms] ease-[var(--ease-spring)] lg:translate-y-0 lg:scale-92';

const STACK = [
  { depth: 2, className: `${BEHIND_BASE} scale-90 translate-y-[28px] lg:-translate-x-[300px]` },
  { depth: 1, className: `${BEHIND_BASE} scale-95 translate-y-[14px] lg:translate-x-[300px]` },
  { depth: 0, className: '' },
];

const ACTION_BUTTON =
  'flex size-20 items-center justify-center rounded-full transition active:scale-95';

type Drag = { x: number; y: number; active: boolean };

const NO_DRAG: Drag = { x: 0, y: 0, active: false };

type SwipeDeckProps = {
  partidos: Partido[];
};

export function SwipeDeck({ partidos }: SwipeDeckProps) {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [drag, setDrag] = useState<Drag>(NO_DRAG);
  const [flyout, setFlyout] = useState<SwipeDecision | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const start = useRef<{ x: number; y: number } | null>(null);
  const moved = useRef(false);

  useEffect(() => {
    if (!toast) return;

    const timer = setTimeout(() => setToast(null), TOAST_DURATION);

    return () => clearTimeout(timer);
  }, [toast]);

  const current = partidos[index];

  const commit = useCallback(
    (direction: SwipeDecision) => {
      setFlyout(direction);
      setDrag((previous) => ({ ...previous, active: false }));

      if (direction === 'yes' && current) {
        joinPartido(current.id).catch((error: unknown) => {
          setToast(
            error instanceof ApiError && error.status === 409
              ? CONFLICT_MESSAGE
              : JOIN_ERROR_MESSAGE
          );
        });
      }

      setTimeout(() => {
        setFlyout(null);
        setDrag(NO_DRAG);
        setIndex((previous) => previous + 1);
      }, FLYOUT_DURATION);
    },
    [current]
  );

  function decide(direction: SwipeDecision) {
    if (flyout) return;

    commit(direction);
  }

  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    if (flyout) return;

    start.current = { x: event.clientX, y: event.clientY };
    moved.current = false;
    setDrag({ x: 0, y: 0, active: true });
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    if (!start.current) return;

    const x = event.clientX - start.current.x;
    const y = event.clientY - start.current.y;

    if (Math.abs(x) > TAP_TOLERANCE || Math.abs(y) > TAP_TOLERANCE) {
      moved.current = true;
    }

    setDrag({ x, y, active: true });
  }

  function handlePointerUp() {
    if (!start.current) return;

    start.current = null;

    if (Math.abs(drag.x) > DECISION_THRESHOLD) {
      commit(drag.x > 0 ? 'yes' : 'no');
      return;
    }

    setDrag(NO_DRAG);
  }

  function openDetail(partidoId: string) {
    if (moved.current) return;

    router.push(`/partidos/${partidoId}`);
  }

  if (!partidos.length || !current) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-base lg:absolute">
        <EmptyState
          icon={Layers}
          title={partidos.length ? 'Viste todo por hoy' : 'Todavía no hay partidos'}
          text={
            partidos.length
              ? 'Ya viste todos los partidos cerca. Volvé más tarde.'
              : 'Cuando alguien cree un partido cerca tuyo, va a aparecer acá.'
          }
          action={
            partidos.length ? (
              <Button onClick={() => setIndex(0)} className="gap-2 rounded-full">
                <Compass className="size-[18px]" aria-hidden="true" />
                Empezar de nuevo
              </Button>
            ) : undefined
          }
        />
      </div>
    );
  }

  const offsetX = flyout ? (flyout === 'yes' ? FLYOUT_DISTANCE : -FLYOUT_DISTANCE) : drag.x;
  const offsetY = flyout ? FLYOUT_LIFT : drag.y;
  const decision =
    flyout ?? (Math.abs(drag.x) > INDICATOR_THRESHOLD ? (drag.x > 0 ? 'yes' : 'no') : null);

  return (
    <div className="fixed inset-0 overflow-hidden bg-base lg:absolute lg:flex lg:flex-col lg:items-center lg:justify-center lg:gap-8">
      <span className="relative hidden text-overline text-brand uppercase lg:block">
        Recomendado para vos
      </span>

      <div className="absolute top-[70px] right-4 bottom-[120px] left-4 lg:relative lg:inset-auto lg:aspect-[47/61] lg:h-[min(615px,calc(100dvh-15rem))] lg:w-auto lg:shrink-0">
        {STACK.map(({ depth, className }) => {
          const partido = partidos[index + depth];

          if (!partido) return null;

          const isTop = depth === 0;

          return (
            <SwipeCard
              key={partido.id}
              partido={partido}
              interactive={isTop}
              decision={isTop ? decision : null}
              className={className}
              onPointerDown={isTop ? handlePointerDown : undefined}
              onPointerMove={isTop ? handlePointerMove : undefined}
              onPointerUp={isTop ? handlePointerUp : undefined}
              onPointerCancel={isTop ? handlePointerUp : undefined}
              onOpen={isTop ? () => openDetail(partido.id) : undefined}
              style={
                isTop
                  ? {
                      transform: `translate(${offsetX}px, ${offsetY}px) rotate(${offsetX / ROTATION_DIVISOR}deg)`,
                      transition: drag.active ? 'none' : RETURN_TRANSITION,
                      touchAction: 'none',
                      cursor: 'grab',
                    }
                  : undefined
              }
            />
          );
        })}
      </div>

      <div className="relative hidden items-center gap-9 lg:flex">
        <button
          type="button"
          aria-label="Pasar"
          onClick={() => decide('no')}
          className={`${ACTION_BUTTON} bg-glass-strong text-swipe-no shadow-bevel backdrop-blur-card hover:bg-glass`}
        >
          <X className="size-8" aria-hidden="true" />
        </button>

        <button
          type="button"
          aria-label="Sumarme al partido"
          onClick={() => decide('yes')}
          className={`${ACTION_BUTTON} bg-swipe-yes text-midnight shadow-[0_0_28px_-4px_var(--color-swipe-yes)] hover:brightness-110`}
        >
          <Check className="size-8" aria-hidden="true" />
        </button>
      </div>

      {toast && (
        <div className="absolute inset-x-0 top-16 flex justify-center px-4">
          <Toast message={toast} tone="danger" />
        </div>
      )}
    </div>
  );
}
