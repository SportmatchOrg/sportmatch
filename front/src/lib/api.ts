import { requireEnv } from './env';
import { auth } from './firebase';

const BASE_URL = requireEnv(process.env.NEXT_PUBLIC_API_URL, 'NEXT_PUBLIC_API_URL');

const NO_CONTENT = 204;

export class ApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
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
  const token = await auth.currentUser?.getIdToken();

  const response = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init.headers,
    },
  });

  if (!response.ok) {
    throw new ApiError(await readErrorMessage(response, path), response.status);
  }

  if (response.status === NO_CONTENT) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}
