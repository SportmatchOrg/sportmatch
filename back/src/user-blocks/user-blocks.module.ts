import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { UserBlocksController } from './user-blocks.controller';
import { UserBlocksRepository } from './user-blocks.repository';
import { UserBlocksService } from './user-blocks.service';

@Module({
  imports: [UsersModule],
  controllers: [UserBlocksController],
  providers: [UserBlocksService, UserBlocksRepository],
})
export class UserBlocksModule {}
