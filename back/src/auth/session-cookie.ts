import type { CookieOptions } from 'express';

export const SESSION_COOKIE_NAME = '__session';

export const SESSION_DURATION_MS = 5 * 24 * 60 * 60 * 1000;

export function sessionCookieOptions(frontUrl: string): CookieOptions {
  return {
    httpOnly: true,
    secure: new URL(frontUrl).protocol === 'https:',
    sameSite: 'lax',
    path: '/',
  };
}
