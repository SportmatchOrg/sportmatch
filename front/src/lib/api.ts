import { signOut } from 'firebase/auth';

import { requireEnv } from './env';
import { auth } from './firebase';

const BASE_URL = requireEnv(process.env.NEXT_PUBLIC_API_URL, 'NEXT_PUBLIC_API_URL');

const NO_CONTENT = 204;
const UNAUTHORIZED = 401;
const SESSION_EXPIRED_MESSAGE = 'Tu sesión expiró. Volvé a iniciar sesión.';

export class ApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

async function expireSession(): Promise<never> {
  await signOut(auth).catch(() => undefined);
  throw new ApiError(SESSION_EXPIRED_MESSAGE, UNAUTHORIZED);
}

async function readErrorMessage(response: Response, path: string): Promise<string> {
  const body: unknown = await response.json().catch(() => null);
  const message = (body as { message?: unknown } | null)?.message;

  if (typeof message === 'string') {
    return message;
  }

  return Array.isArray(message)
    ? message.join(' ')
    : `Request to ${path} failed with status ${response.status}`;
}

export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const user = auth.currentUser;

  if (!user) {
    return expireSession();
  }

  const token = await user.getIdToken();
  const headers = new Headers(init.headers);
  if (init.body instanceof FormData) {
    headers.delete('Content-Type');
  } else if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers,
  });

  if (response.status === UNAUTHORIZED) {
    // Token vencido, revocado o borrado: la sesión local ya no sirve (BUG-8).
    return expireSession();
  }

  if (!response.ok) {
    throw new ApiError(await readErrorMessage(response, path), response.status);
  }

  if (response.status === NO_CONTENT) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}
