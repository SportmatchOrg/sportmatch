import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { ModerationActionsRepository } from './moderation-actions.repository';

@Injectable()
export class ModerationActionsService {
  constructor(
    private readonly moderationActionsRepository: ModerationActionsRepository,
    private readonly usersService: UsersService,
  ) {}

  async findAllByUser(userId: string) {
    await this.usersService.assertExists(userId);

    return this.moderationActionsRepository.findAllByTargetUser(userId);
  }
}
