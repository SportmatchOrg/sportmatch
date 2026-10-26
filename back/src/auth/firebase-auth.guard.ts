import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { FIREBASE_ADMIN } from '../firebase/firebase.module';
import { UsersService } from '../users/users.service';
import { isBlocked } from '../utils/blocks/account-block';
import { AccountBlockedException } from './account-blocked.exception';
import { AuthenticatedRequest, FirebaseIdToken, FirebaseUser } from './types';

@Injectable()
export class FirebaseAuthGuard implements CanActivate {
  constructor(
    @Inject(FIREBASE_ADMIN) private readonly firebaseApp: App,
    private readonly usersService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = this.extractBearerToken(request.headers.authorization);

    if (!token) {
      throw new UnauthorizedException('Missing bearer token');
    }

    const user = this.toFirebaseUser(await this.decodeToken(token));
    const account = await this.usersService.ensureExists(user);

    if (isBlocked(account)) {
      throw new AccountBlockedException(account.blockedUntil);
    }

    await this.usersService.recordActivity(account.id);

    request.user = user;

    return true;
  }

  private extractBearerToken(
    authorizationHeader: string | undefined,
  ): string | undefined {
    const [scheme, token] = authorizationHeader?.split(' ') ?? [];

    return scheme === 'Bearer' && token ? token : undefined;
  }

  private async decodeToken(token: string): Promise<FirebaseIdToken> {
    const checkRevoked = true;

    try {
      return await getAuth(this.firebaseApp).verifyIdToken(token, checkRevoked);
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
    };
  }
}
