import type { Request } from 'express';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

export function isAllowedOrigin(request: Request, frontUrl: string): boolean {
  if (SAFE_METHODS.has(request.method)) {
    return true;
  }

  return request.headers.origin === new URL(frontUrl).origin;
}
