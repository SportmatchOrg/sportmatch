import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import type { AuthenticatedRequest } from './types';

@Injectable()
export class OwnAccountGuard implements CanActivate {
  constructor(private readonly usersService: UsersService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const user = await this.usersService.findByFirebaseUid(request.user.uid);

    if (user.id !== request.params.id) {
      throw new ForbiddenException('You can only modify your own account');
    }

    return true;
  }
}
