import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { PushSubscriptionsController } from './push-subscriptions.controller';
import { PushSubscriptionsRepository } from './push-subscriptions.repository';
import { PushSubscriptionsService } from './push-subscriptions.service';

@Module({
  imports: [UsersModule],
  controllers: [PushSubscriptionsController],
  providers: [PushSubscriptionsService, PushSubscriptionsRepository],
  exports: [PushSubscriptionsService],
})
export class PushSubscriptionsModule {}
