'use client';

import { useEffect, useRef } from 'react';

import {
  startSpecularEdge,
  type ShaderProps,
  type SpecularEdgeProps,
} from './specular-edge.engine';

export type { SpecularEdgeProps };

function warnIfTargetNotPositioned(element: HTMLElement) {
  if (process.env.NODE_ENV === 'production') return;
  if (getComputedStyle(element).position === 'static') {
    console.warn(
      'SpecularEdge: its parent element needs a non-static position, otherwise the edge will not be visible.'
    );
  }
}

export function SpecularEdge({
  radius = 18,
  lineColor = '#ffffff',
  baseColor = '#525252',
  baseIntensity = 1,
  intensity = 1,
  shineSize = 10,
  shineFade = 40,
  thickness = 1,
  speed = 0.35,
  followMouse = true,
  proximity = 250,
  autoAnimate = false,
}: SpecularEdgeProps) {
  const hostRef = useRef<HTMLSpanElement>(null);
  const propsRef = useRef<ShaderProps>({
    radius,
    lineColor,
    baseColor,
    baseIntensity,
    intensity,
    shineSize,
    shineFade,
    thickness,
    speed,
    followMouse,
    proximity,
    autoAnimate,
  });
  const propsVersionRef = useRef(0);

  useEffect(() => {
    propsRef.current = {
      radius,
      lineColor,
      baseColor,
      baseIntensity,
      intensity,
      shineSize,
      shineFade,
      thickness,
      speed,
      followMouse,
      proximity,
      autoAnimate,
    };
    propsVersionRef.current += 1;
  }, [
    radius,
    lineColor,
    baseColor,
    baseIntensity,
    intensity,
    shineSize,
    shineFade,
    thickness,
    speed,
    followMouse,
    proximity,
    autoAnimate,
  ]);

  useEffect(() => {
    const host = hostRef.current;
    const element = host?.parentElement;
    if (!host || !element) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    warnIfTargetNotPositioned(element);

    return startSpecularEdge(
      host,
      element,
      () => propsRef.current,
      () => propsVersionRef.current
    );
  }, []);

  return (
    <span
      ref={hostRef}
      aria-hidden="true"
      className="pointer-events-none absolute -inset-5 z-0 [&_canvas]:block [&_canvas]:h-full [&_canvas]:w-full"
    />
  );
}
