import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { PushSubscriptionsModule } from '../push-subscriptions/push-subscriptions.module';
import { NotificationsController } from './notifications.controller';
import { NotificationsRepository } from './notifications.repository';
import { NotificationsService } from './notifications.service';

@Module({
  imports: [UsersModule, PushSubscriptionsModule],
  controllers: [NotificationsController],
  providers: [NotificationsService, NotificationsRepository],
  exports: [NotificationsService],
})
export class NotificationsModule {}
