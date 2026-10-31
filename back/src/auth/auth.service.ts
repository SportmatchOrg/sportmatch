import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import type { App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { FIREBASE_ADMIN } from '../firebase/firebase.module';
import { SESSION_DURATION_MS } from './session-cookie';

@Injectable()
export class AuthService {
  constructor(@Inject(FIREBASE_ADMIN) private readonly firebaseApp: App) {}

  async createSessionCookie(idToken: string): Promise<string> {
    try {
      return await getAuth(this.firebaseApp).createSessionCookie(idToken, {
        expiresIn: SESSION_DURATION_MS,
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  async revokeSession(sessionCookie: string | undefined): Promise<void> {
    if (!sessionCookie) {
      return;
    }

    const auth = getAuth(this.firebaseApp);

    try {
      const { uid } = await auth.verifySessionCookie(sessionCookie);
      await auth.revokeRefreshTokens(uid);
    } catch {
      return;
    }
  }
}
