import { Color, Mesh, Program, Renderer, Triangle } from 'ogl';

import { FRAG, VERT } from './specular-edge.shaders';

const PAD = 20;

export type SpecularEdgeProps = {
  radius?: number;
  lineColor?: string;
  baseColor?: string;
  baseIntensity?: number;
  intensity?: number;
  shineSize?: number;
  shineFade?: number;
  thickness?: number;
  speed?: number;
  followMouse?: boolean;
  proximity?: number;
  autoAnimate?: boolean;
};

export type ShaderProps = Required<SpecularEdgeProps>;

type Scene = {
  renderer: Renderer;
  program: Program;
  mesh: Mesh;
  gl: Renderer['gl'];
};

type ElementBox = {
  getRect: () => DOMRect;
  getWidth: () => number;
  getHeight: () => number;
  dispose: () => void;
};

type PointerTracker = {
  getAngle: () => number | null;
  getProximity: () => number;
  dispose: () => void;
};

function createScene(dpr: number): Scene | null {
  let renderer: Renderer;
  try {
    renderer = new Renderer({ alpha: true, premultipliedAlpha: true, antialias: true, dpr });
  } catch {
    return null;
  }

  const gl = renderer.gl;
  gl.clearColor(0, 0, 0, 0);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

  const geometry = new Triangle(gl);
  if (geometry.attributes.uv) delete geometry.attributes.uv;

  const program = new Program(gl, {
    vertex: VERT,
    fragment: FRAG,
    uniforms: {
      uCenter: { value: [0, 0] },
      uHalfSize: { value: [1, 1] },
      uRadius: { value: 0 },
      uAngle: { value: 2.4 },
      uPx: { value: dpr },
      uLineColor: { value: [1, 1, 1] },
      uBaseColor: { value: [0.32, 0.32, 0.32] },
      uIntensity: { value: 1 },
      uShineSize: { value: 0.17 },
      uShineFade: { value: 0.7 },
      uThickness: { value: 1 },
      uBaseWidth: { value: dpr },
      uBaseIntensity: { value: 1 },
    },
  });

  return { renderer, program, mesh: new Mesh(gl, { geometry, program }), gl };
}

function trackElementBox(
  element: HTMLElement,
  onResize: (width: number, height: number) => void
): ElementBox {
  let rect = element.getBoundingClientRect();
  let width = rect.width;
  let height = rect.height;

  const readRect = () => {
    rect = element.getBoundingClientRect();
  };

  const handleResize = () => {
    readRect();
    width = rect.width;
    height = rect.height;
    onResize(width, height);
  };

  const observer = new ResizeObserver(handleResize);
  observer.observe(element);
  handleResize();

  window.addEventListener('scroll', readRect, { passive: true, capture: true });

  return {
    getRect: () => rect,
    getWidth: () => width,
    getHeight: () => height,
    dispose: () => {
      observer.disconnect();
      window.removeEventListener('scroll', readRect, { capture: true });
    },
  };
}

function trackPointer(getRect: () => DOMRect, getRadius: () => number): PointerTracker {
  let angle: number | null = null;
  let proximity = 0;

  const onPointerMove = (event: PointerEvent) => {
    const rect = getRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = Math.max(rect.left - event.clientX, 0, event.clientX - rect.right);
    const dy = Math.max(rect.top - event.clientY, 0, event.clientY - rect.bottom);
    const distance = Math.hypot(dx, dy);

    if (distance === 0) {
      const nx = (event.clientX - cx) / (rect.width / 2);
      const ny = (cy - event.clientY) / (rect.height / 2);
      angle = Math.atan2(2 / rect.height, -2 / rect.width) + nx * 0.3 + ny * 0.15;
    } else {
      angle = Math.atan2(cy - event.clientY, event.clientX - cx);
    }

    const t = Math.max(0, 1 - distance / Math.max(getRadius(), 1));
    proximity = t * t * (3 - 2 * t);
  };

  window.addEventListener('pointermove', onPointerMove);

  return {
    getAngle: () => angle,
    getProximity: () => proximity,
    dispose: () => window.removeEventListener('pointermove', onPointerMove),
  };
}

function createUniformWriter(program: Program, dpr: number) {
  const lineC = new Color();
  const baseC = new Color();

  return (p: ShaderProps, angle: number, bright: number, width: number, height: number) => {
    lineC.set(p.lineColor);
    baseC.set(p.baseColor);

    const u = program.uniforms;
    u.uAngle.value = angle;
    u.uRadius.value = Math.min(p.radius, Math.min(width, height) / 2) * dpr;
    u.uLineColor.value = [lineC.r, lineC.g, lineC.b];
    u.uBaseColor.value = [baseC.r, baseC.g, baseC.b];
    u.uIntensity.value = p.intensity * bright;
    u.uShineSize.value = (p.shineSize * Math.PI) / 180;
    u.uShineFade.value = (p.shineFade * Math.PI) / 180;
    u.uThickness.value = p.thickness * dpr;
    u.uBaseIntensity.value = p.baseIntensity;
  };
}

export function startSpecularEdge(
  host: HTMLElement,
  element: HTMLElement,
  readProps: () => ShaderProps,
  readPropsVersion: () => number
): (() => void) | undefined {
  const dpr = window.devicePixelRatio || 1;
  const scene = createScene(dpr);
  if (!scene) return;

  const { renderer, program, mesh, gl } = scene;
  host.appendChild(gl.canvas);

  let needsRender = true;

  const box = trackElementBox(element, (width, height) => {
    renderer.setSize(width + PAD * 2, height + PAD * 2);
    program.uniforms.uCenter.value = [(PAD + width / 2) * dpr, (PAD + height / 2) * dpr];
    program.uniforms.uHalfSize.value = [(width / 2) * dpr, (height / 2) * dpr];
    needsRender = true;
  });

  const pointer = trackPointer(box.getRect, () => readProps().proximity);
  const writeUniforms = createUniformWriter(program, dpr);

  let angle = 2.4;
  let idleAngle = 2.4;
  let bright = 0;
  let last = performance.now();
  let seenPropsVersion = readPropsVersion();
  let raf = 0;

  const update = (now: number) => {
    raf = requestAnimationFrame(update);

    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    const p = readProps();

    if (seenPropsVersion !== readPropsVersion()) {
      seenPropsVersion = readPropsVersion();
      needsRender = true;
    }

    const proximity = pointer.getProximity();
    const pointerAngle = pointer.getAngle();

    idleAngle += p.speed * dt;
    const steer = p.followMouse && (!p.autoAnimate || proximity > 0);
    const targetAngle = steer && pointerAngle != null ? pointerAngle : idleAngle;
    const diff = ((targetAngle - angle + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
    angle += diff * (1 - Math.exp(-dt * 7));

    const brightTarget = p.autoAnimate ? 1 : proximity;
    bright += (brightTarget - bright) * (1 - Math.exp(-dt * 8));

    const idle = brightTarget === 0 && bright < 0.001;
    if (idle) {
      if (!needsRender) return;
      bright = 0;
      needsRender = false;
    } else {
      needsRender = true;
    }

    writeUniforms(p, angle, bright, box.getWidth(), box.getHeight());
    renderer.render({ scene: mesh });
  };
  raf = requestAnimationFrame(update);

  return () => {
    cancelAnimationFrame(raf);
    box.dispose();
    pointer.dispose();
    if (gl.canvas.parentNode === host) host.removeChild(gl.canvas);
    gl.getExtension('WEBGL_lose_context')?.loseContext();
  };
}
