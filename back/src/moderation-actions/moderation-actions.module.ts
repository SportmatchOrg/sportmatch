import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { ModerationActionsController } from './moderation-actions.controller';
import { ModerationActionsRepository } from './moderation-actions.repository';
import { ModerationActionsService } from './moderation-actions.service';

@Module({
  imports: [UsersModule],
  controllers: [ModerationActionsController],
  providers: [ModerationActionsService, ModerationActionsRepository],
})
export class ModerationActionsModule {}
