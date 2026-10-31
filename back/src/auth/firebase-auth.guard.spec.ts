import {
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';
import type { App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import type { UsersService } from '../users/users.service';
import { FirebaseAuthGuard } from './firebase-auth.guard';
import { SESSION_COOKIE_NAME } from './session-cookie';

jest.mock('firebase-admin/auth', () => ({ getAuth: jest.fn() }));
jest.mock('../users/users.service', () => ({ UsersService: class {} }));

const FRONT_URL = 'https://sportmatch.vercel.app';
const DECODED_TOKEN = {
  uid: 'uid-1',
  email: 'ana@example.com',
  name: 'Ana',
  firebase: { sign_in_provider: 'password' },
};

type RequestStub = {
  method: string;
  headers: Record<string, string | undefined>;
  cookies?: Record<string, string>;
  user?: unknown;
};

function contextFor(request: RequestStub): ExecutionContext {
  return {
    switchToHttp: () => ({ getRequest: () => request }),
  } as unknown as ExecutionContext;
}

describe('FirebaseAuthGuard', () => {
  const verifySessionCookie = jest.fn();
  const verifyIdToken = jest.fn();
  const usersService = {
    ensureExists: jest.fn().mockResolvedValue({ id: 'user-1' }),
    recordActivity: jest.fn().mockResolvedValue(undefined),
  };
  const config = { getOrThrow: () => FRONT_URL } as unknown as ConfigService;
  let guard: FirebaseAuthGuard;

  beforeEach(() => {
    jest.clearAllMocks();
    (getAuth as jest.Mock).mockReturnValue({
      verifySessionCookie,
      verifyIdToken,
    });
    guard = new FirebaseAuthGuard(
      {} as App,
      usersService as unknown as UsersService,
      config,
    );
  });

  it('accepts a valid session cookie', async () => {
    verifySessionCookie.mockResolvedValue(DECODED_TOKEN);
    const request: RequestStub = {
      method: 'GET',
      headers: {},
      cookies: { [SESSION_COOKIE_NAME]: 'cookie' },
    };

    await expect(guard.canActivate(contextFor(request))).resolves.toBe(true);
    expect(verifySessionCookie).toHaveBeenCalledWith('cookie', true);
    expect(request.user).toMatchObject({ uid: 'uid-1' });
  });

  it('rejects an expired session cookie', async () => {
    verifySessionCookie.mockRejectedValue(new Error('expired'));
    const request: RequestStub = {
      method: 'GET',
      headers: {},
      cookies: { [SESSION_COOKIE_NAME]: 'cookie' },
    };

    await expect(guard.canActivate(contextFor(request))).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('accepts a bearer token when there is no cookie', async () => {
    verifyIdToken.mockResolvedValue(DECODED_TOKEN);
    const request: RequestStub = {
      method: 'POST',
      headers: { authorization: 'Bearer token' },
    };

    await expect(guard.canActivate(contextFor(request))).resolves.toBe(true);
    expect(verifyIdToken).toHaveBeenCalledWith('token', true);
  });

  it('rejects a request without cookie or bearer token', async () => {
    const request: RequestStub = { method: 'GET', headers: {} };

    await expect(guard.canActivate(contextFor(request))).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('rejects a cookie POST from a foreign origin', async () => {
    verifySessionCookie.mockResolvedValue(DECODED_TOKEN);
    const request: RequestStub = {
      method: 'POST',
      headers: { origin: 'https://evil.example' },
      cookies: { [SESSION_COOKIE_NAME]: 'cookie' },
    };

    await expect(guard.canActivate(contextFor(request))).rejects.toThrow(
      ForbiddenException,
    );
    expect(verifySessionCookie).not.toHaveBeenCalled();
  });

  it('accepts a cookie POST from the front origin', async () => {
    verifySessionCookie.mockResolvedValue(DECODED_TOKEN);
    const request: RequestStub = {
      method: 'POST',
      headers: { origin: FRONT_URL },
      cookies: { [SESSION_COOKIE_NAME]: 'cookie' },
    };

    await expect(guard.canActivate(contextFor(request))).resolves.toBe(true);
  });
});
