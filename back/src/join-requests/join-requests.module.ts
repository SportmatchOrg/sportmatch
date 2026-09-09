import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { JoinRequestsController } from './join-requests.controller';
import { JoinRequestsRepository } from './join-requests.repository';
import { JoinRequestsService } from './join-requests.service';

@Module({
  imports: [UsersModule],
  controllers: [JoinRequestsController],
  providers: [JoinRequestsService, JoinRequestsRepository],
})
export class JoinRequestsModule {}
