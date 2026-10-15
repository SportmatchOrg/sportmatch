import { Module } from '@nestjs/common';
import { NotificationsModule } from '../notifications/notifications.module';
import { UsersModule } from '../users/users.module';
import { InvitationsController } from './invitations.controller';
import { InvitationsService } from './invitations.service';
import { JoinRequestsController } from './join-requests.controller';
import { JoinRequestsRepository } from './join-requests.repository';
import { JoinRequestsService } from './join-requests.service';

@Module({
  imports: [UsersModule, NotificationsModule],
  controllers: [JoinRequestsController, InvitationsController],
  providers: [JoinRequestsService, InvitationsService, JoinRequestsRepository],
})
export class JoinRequestsModule {}
