import {
  CanActivate,
  ExecutionContext,
  Inject,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { App } from 'firebase-admin/app';
import { getAuth, type Auth } from 'firebase-admin/auth';
import { FIREBASE_ADMIN } from '../firebase/firebase.module';
import { UsersService } from '../users/users.service';
import { isBlocked } from '../utils/blocks/account-block';
import { AccountBlockedException } from './account-blocked.exception';
import { extractBearerToken } from './bearer-token';
import { isAllowedOrigin } from './same-origin';
import { SESSION_COOKIE_NAME } from './session-cookie';
import { AuthenticatedRequest, FirebaseIdToken, FirebaseUser } from './types';

@Injectable()
export class FirebaseAuthGuard implements CanActivate {
  constructor(
    @Inject(FIREBASE_ADMIN) private readonly firebaseApp: App,
    private readonly usersService: UsersService,
    private readonly config: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const decodedToken = await this.authenticate(request);
    const user = this.toFirebaseUser(decodedToken);
    const account = await this.usersService.ensureExists(user);

    if (isBlocked(account)) {
      throw new AccountBlockedException(account.blockedUntil);
    }

    await this.usersService.recordActivity(account.id);

    request.user = user;

    return true;
  }

  private async authenticate(
    request: AuthenticatedRequest,
  ): Promise<FirebaseIdToken> {
    const sessionCookie = (
      request.cookies as Record<string, string> | undefined
    )?.[SESSION_COOKIE_NAME];

    if (sessionCookie) {
      this.assertAllowedOrigin(request);

      return this.verify((auth) =>
        auth.verifySessionCookie(sessionCookie, true),
      );
    }

    const token = extractBearerToken(request.headers.authorization);

    if (!token) {
      throw new UnauthorizedException('Missing session');
    }

    return this.verify((auth) => auth.verifyIdToken(token, true));
  }

  private assertAllowedOrigin(request: AuthenticatedRequest): void {
    const frontUrl = this.config.getOrThrow<string>('FRONT_URL');

    if (!isAllowedOrigin(request, frontUrl)) {
      throw new ForbiddenException('Origin not allowed');
    }
  }

  private async verify(
    run: (auth: Auth) => Promise<FirebaseIdToken>,
  ): Promise<FirebaseIdToken> {
    try {
      return await run(getAuth(this.firebaseApp));
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  private toFirebaseUser(decodedToken: FirebaseIdToken): FirebaseUser {
    if (!decodedToken.email) {
      throw new UnauthorizedException('Token does not contain an email');
    }

    return {
      uid: decodedToken.uid,
      email: decodedToken.email,
      name: decodedToken.name ?? decodedToken.email.split('@')[0],
      photoUrl: decodedToken.picture,
      signInProvider: decodedToken.firebase.sign_in_provider,
    };
  }
}
