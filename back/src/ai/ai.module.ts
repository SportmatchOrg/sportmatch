import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { AiTextClient } from './ai-text.client';
import { AiController } from './ai.controller';
import { AiRepository } from './ai.repository';
import { AiService } from './ai.service';

@Module({
  imports: [UsersModule],
  controllers: [AiController],
  providers: [AiService, AiRepository, AiTextClient],
})
export class AiModule {}
