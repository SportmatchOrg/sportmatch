import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { UserRole } from '../generated/prisma/client';
import { UsersService } from '../users/users.service';
import type { AuthenticatedRequest } from './types';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private readonly usersService: UsersService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const user = await this.usersService.findByFirebaseUid(request.user.uid);

    if (user.role !== UserRole.ADMIN) {
      throw new ForbiddenException(
        'Only administrators can access this resource',
      );
    }

    return true;
  }
}
