import { Injectable, NotFoundException } from '@nestjs/common';
import { ModerationActionsRepository } from './moderation-actions.repository';

@Injectable()
export class ModerationActionsService {
  constructor(
    private readonly moderationActionsRepository: ModerationActionsRepository,
  ) {}

  async findAllByUser(userId: string) {
    if (!(await this.moderationActionsRepository.findUserById(userId))) {
      throw new NotFoundException(`User with id ${userId} was not found`);
    }

    return this.moderationActionsRepository.findAllByTargetUser(userId);
  }
}
