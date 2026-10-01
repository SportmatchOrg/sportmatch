import { Module } from '@nestjs/common';
import { NotificationsModule } from '../notifications/notifications.module';
import { UsersModule } from '../users/users.module';
import { MatchesController } from './matches.controller';
import { MatchesRepository } from './matches.repository';
import { MatchesService } from './matches.service';

@Module({
  imports: [UsersModule, NotificationsModule],
  controllers: [MatchesController],
  providers: [MatchesService, MatchesRepository],
})
export class MatchesModule {}
