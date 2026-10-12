'use client';

import { Check, Compass, Layers, X } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState, type PointerEvent } from 'react';
import { createPortal } from 'react-dom';

import { SwipeCard, type SwipeDecision } from '@/components/matches/swipe-card';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { TOAST_DURATION, Toast, type ToastTone } from '@/components/ui/toast';
import { useCurrentUser } from '@/hooks/use-current-user';
import { sportPhotoUrl } from '@/lib/sport-photo';
import { joinRequestErrorMessage, requestToJoin } from '@/lib/matches';
import { suspensionMessage } from '@/lib/suspension';
import type { Match } from '@/types/match';

const DECISION_THRESHOLD = 110;
const INDICATOR_THRESHOLD = 40;
const ROTATION_DIVISOR = 22;
const FLYOUT_DISTANCE = 600;
const FLYOUT_LIFT = -40;
const FLYOUT_DURATION = 300;
const TAP_TOLERANCE = 8;

const RETURN_TRANSITION = 'transform 320ms var(--ease-spring)';

const BEHIND_BASE =
  'brightness-70 transition-transform duration-[320ms] ease-[var(--ease-spring)] lg:translate-y-0 lg:scale-92';

const STACK = [
  { depth: 2, className: `${BEHIND_BASE} scale-90 translate-y-[28px] lg:-translate-x-[300px]` },
  { depth: 1, className: `${BEHIND_BASE} scale-95 translate-y-[14px] lg:translate-x-[300px]` },
  { depth: 0, className: '' },
];

const DECK =
  'absolute top-[max(70px,calc(env(safe-area-inset-top)_+_12px))] right-4 bottom-[max(120px,calc(env(safe-area-inset-bottom)_+_104px))] left-4 lg:relative lg:inset-auto lg:aspect-[47/61] lg:h-[min(615px,calc(100dvh-18rem))] lg:w-auto lg:shrink-0';

const ACTION_BUTTON =
  'flex size-20 items-center justify-center rounded-full transition active:scale-95';

type Drag = { x: number; y: number; active: boolean };

const NO_DRAG: Drag = { x: 0, y: 0, active: false };

type SwipeDeckProps = {
  matches: Match[];
  onRestart: () => void;
};

type DeckToast = {
  message: string;
  tone: ToastTone;
};

export function SwipeDeck({ matches, onRestart }: SwipeDeckProps) {
  const router = useRouter();
  const { user, loading: userLoading } = useCurrentUser();
  const [index, setIndex] = useState(0);
  const [previousMatches, setPreviousMatches] = useState(matches);
  const [drag, setDrag] = useState<Drag>(NO_DRAG);
  const [flyout, setFlyout] = useState<SwipeDecision | null>(null);
  const [toast, setToast] = useState<DeckToast | null>(null);
  const start = useRef<{ x: number; y: number } | null>(null);
  const moved = useRef(false);

  useEffect(() => {
    if (!toast) return;

    const timer = setTimeout(() => setToast(null), TOAST_DURATION);

    return () => clearTimeout(timer);
  }, [toast]);

  if (matches !== previousMatches) {
    setPreviousMatches(matches);
    setIndex(0);
  }

  const current = matches[index];

  const commit = useCallback(
    (direction: SwipeDecision) => {
      if (direction === 'yes') {
        const message = suspensionMessage(user?.stats.suspendedUntil);
        if (userLoading || !user || message) {
          setDrag(NO_DRAG);
          setToast({
            message: message ?? (userLoading
              ? 'Estamos comprobando tu perfil. Probá de nuevo en un momento.'
              : 'No pudimos comprobar tu perfil. Volvé a cargar la página.'),
            tone: 'danger',
          });
          return;
        }
      }
      setFlyout(direction);
      setDrag((previous) => ({ ...previous, active: false }));

      if (direction === 'yes' && current) {
        requestToJoin(current.id)
          .then(() => setToast({ message: 'Solicitud enviada ⚡', tone: 'success' }))
          .catch((error: unknown) =>
            setToast({ message: joinRequestErrorMessage(error), tone: 'danger' })
          );
      }

      setTimeout(() => {
        setFlyout(null);
        setDrag(NO_DRAG);
        setIndex((previous) => previous + 1);
      }, FLYOUT_DURATION);
    },
    [current, user, userLoading]
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

    if (!moved.current && current) {
      router.push(`/partidos/${current.id}`);
    }
  }

  const toastOverlay = toast
    ? createPortal(
        <div className="pointer-events-none fixed inset-x-0 top-[max(64px,calc(env(safe-area-inset-top)_+_12px))] z-50 flex justify-center px-4 lg:top-36">
          <Toast message={toast.message} tone={toast.tone} />
        </div>,
        document.body
      )
    : null;

  if (!matches.length || !current) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-base lg:absolute">
        {toastOverlay}
        <EmptyState
          icon={Layers}
          title={matches.length ? 'Viste todo por hoy' : 'No hay más partidos por ahora'}
          text={
            matches.length
              ? 'Ya viste todos los partidos cerca. Volvé más tarde.'
              : 'Cuando alguien cree uno cerca tuyo, va a aparecer acá.'
          }
          action={
            matches.length ? (
              <Button onClick={onRestart} className="gap-2 rounded-full">
                <Compass className="size-[18px]" aria-hidden="true" />
                Empezar de nuevo
              </Button>
            ) : undefined
          }
        />
      </div>
    );
  }

  const ambientPhoto = sportPhotoUrl(current.sport.name, current.id);
  const offsetX = flyout ? (flyout === 'yes' ? FLYOUT_DISTANCE : -FLYOUT_DISTANCE) : drag.x;
  const offsetY = flyout ? FLYOUT_LIFT : drag.y;
  const decision =
    flyout ?? (Math.abs(drag.x) > INDICATOR_THRESHOLD ? (drag.x > 0 ? 'yes' : 'no') : null);

  return (
    <div className="fixed inset-0 overflow-hidden bg-base lg:absolute lg:flex lg:flex-col lg:items-center lg:justify-center lg:gap-8 lg:py-6">
      <div
        key={current.id}
        aria-hidden="true"
        style={{ animation: 'ambient-in 700ms ease both' }}
        className="absolute inset-0 overflow-hidden"
      >
        {ambientPhoto && (
          <Image
            src={ambientPhoto}
            alt=""
            fill
            sizes="100vw"
            style={{ filter: 'blur(46px) saturate(1.35) brightness(0.6)', inset: '-12%' }}
            className="scale-108 object-cover"
          />
        )}
        <span className="absolute inset-0 bg-linear-to-b from-ambient-top via-scrim to-ambient-bottom" />
      </div>

      <span className="relative hidden text-overline text-brand uppercase lg:block">
        Recomendado para vos
      </span>

      <div className={DECK}>
        {STACK.map(({ depth, className }) => {
          const match = matches[index + depth];

          if (!match) return null;

          const isTop = depth === 0;

          return (
            <SwipeCard
              key={match.id}
              match={match}
              interactive={isTop}
              decision={isTop ? decision : null}
              className={className}
              onPointerDown={isTop ? handlePointerDown : undefined}
              onPointerMove={isTop ? handlePointerMove : undefined}
              onPointerUp={isTop ? handlePointerUp : undefined}
              onPointerCancel={isTop ? handlePointerUp : undefined}
              style={
                isTop
                  ? {
                      transform: `translate(${offsetX}px, ${offsetY}px) rotate(${offsetX / ROTATION_DIVISOR}deg)`,
                      transition: drag.active ? 'none' : RETURN_TRANSITION,
                      touchAction: 'none',
                      cursor: 'pointer',
                      zIndex: 10,
                    }
                  : { zIndex: 10 - depth }
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

      {toastOverlay}
    </div>
  );
}
