import { Module } from '@nestjs/common';
import { NotificationsModule } from '../notifications/notifications.module';
import { UsersModule } from '../users/users.module';
import { RatingsController } from './ratings.controller';
import { RatingsRepository } from './ratings.repository';
import { RatingsService } from './ratings.service';

@Module({
  imports: [UsersModule, NotificationsModule],
  controllers: [RatingsController],
  providers: [RatingsService, RatingsRepository],
})
export class RatingsModule {}
