'use client';

import { useCallback, useRef, type MouseEvent, type PointerEvent } from 'react';

import { DIRECTION_LOCK_PX, rubberBand } from '@/lib/gesture';

const DISMISS_DISTANCE_PX = 120;
const DISMISS_VELOCITY_PX_PER_MS = 0.6;

type Drag = {
  pointerId: number;
  startX: number;
  startY: number;
  lastY: number;
  lastTime: number;
  velocity: number;
  offset: number;
  axis: 'vertical' | 'ignored' | null;
};

function isScrollable(element: HTMLElement): boolean {
  return element.scrollHeight > element.clientHeight;
}

export function useDragToDismiss(onDismiss: () => void) {
  const sheet = useRef<HTMLElement | null>(null);
  const drag = useRef<Drag | null>(null);
  const suppressClick = useRef(false);

  const ref = useCallback((element: HTMLElement | null) => {
    sheet.current = element;

    if (!element) return;

    const syncTouchAction = () => {
      element.style.touchAction = isScrollable(element) ? '' : 'none';
    };
    const observer = new ResizeObserver(syncTouchAction);
    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  function moveSheet(transform: string, transition: string) {
    if (!sheet.current) return;

    sheet.current.style.transition = transition;
    sheet.current.style.transform = transform;
  }

  function release() {
    drag.current = null;
    moveSheet('', '');
  }

  function onPointerDown(event: PointerEvent<HTMLElement>) {
    if (event.button !== 0) return;

    suppressClick.current = false;
    drag.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      lastY: event.clientY,
      lastTime: event.timeStamp,
      velocity: 0,
      offset: 0,
      axis: null,
    };
  }

  function onPointerMove(event: PointerEvent<HTMLElement>) {
    const current = drag.current;
    const element = sheet.current;

    if (!current || !element || current.pointerId !== event.pointerId) return;

    const dx = event.clientX - current.startX;
    const dy = event.clientY - current.startY;

    if (current.axis === null) {
      if (Math.max(Math.abs(dx), Math.abs(dy)) < DIRECTION_LOCK_PX) return;

      const pullsDown = dy > 0 && Math.abs(dy) > Math.abs(dx) && element.scrollTop <= 0;
      current.axis = pullsDown ? 'vertical' : 'ignored';

      if (pullsDown) event.currentTarget.setPointerCapture(event.pointerId);
    }

    if (current.axis !== 'vertical') return;

    const elapsed = Math.max(1, event.timeStamp - current.lastTime);
    current.velocity = (event.clientY - current.lastY) / elapsed;
    current.lastY = event.clientY;
    current.lastTime = event.timeStamp;
    current.offset = dy > 0 ? dy : rubberBand(dy, element.offsetHeight);

    moveSheet(`translateY(${current.offset}px)`, 'none');
  }

  function onPointerUp(event: PointerEvent<HTMLElement>) {
    const current = drag.current;

    if (!current || current.pointerId !== event.pointerId) return;
    if (current.axis !== 'vertical') {
      drag.current = null;
      return;
    }

    suppressClick.current = true;

    const dismissed =
      current.offset > DISMISS_DISTANCE_PX || current.velocity > DISMISS_VELOCITY_PX_PER_MS;

    if (!dismissed) {
      release();
      return;
    }

    drag.current = null;
    moveSheet('translateY(100%)', '');
    onDismiss();
  }

  function onClickCapture(event: MouseEvent<HTMLElement>) {
    if (!suppressClick.current) return;

    event.preventDefault();
    event.stopPropagation();
    suppressClick.current = false;
  }

  return {
    ref,
    dragHandlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerCancel: release,
      onClickCapture,
    },
  };
}
