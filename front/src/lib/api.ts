import { accountBlockedMessage, saveAccountBlockedNotice } from './account-block';
import { apiBaseUrl } from './api-url';
import { closeSession } from './session';
import { notifySessionEnded } from './session-events';

const NO_CONTENT = 204;
const UNAUTHORIZED = 401;
const FORBIDDEN = 403;
const ACCOUNT_BLOCKED = 'ACCOUNT_BLOCKED';
const SESSION_EXPIRED_MESSAGE = 'Tu sesión expiró. Volvé a iniciar sesión.';

export class ApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

type AccountBlock = { until: string | null };

type AccountBlockedBody = { code?: unknown; until?: unknown } | null;

function expireSession(): never {
  notifySessionEnded();
  throw new ApiError(SESSION_EXPIRED_MESSAGE, UNAUTHORIZED);
}

async function blockSession({ until }: AccountBlock): Promise<never> {
  const message = accountBlockedMessage(until);

  saveAccountBlockedNotice(message);
  await closeSession().catch(() => undefined);
  notifySessionEnded();
  throw new ApiError(message, FORBIDDEN);
}

async function readAccountBlock(response: Response): Promise<AccountBlock | null> {
  const body = (await response.json().catch(() => null)) as AccountBlockedBody;

  if (body?.code !== ACCOUNT_BLOCKED) {
    return null;
  }

  return { until: typeof body.until === 'string' ? body.until : null };
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
  const headers = new Headers(init.headers);
  if (init.body instanceof FormData) {
    headers.delete('Content-Type');
  } else if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${apiBaseUrl()}${path}`, {
    ...init,
    headers,
    credentials: 'include',
  });

  if (response.status === UNAUTHORIZED) {
    return expireSession();
  }

  if (response.status === FORBIDDEN) {
    const block = await readAccountBlock(response.clone());

    if (block) {
      return blockSession(block);
    }
  }

  if (!response.ok) {
    throw new ApiError(await readErrorMessage(response, path), response.status);
  }

  if (response.status === NO_CONTENT) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}
