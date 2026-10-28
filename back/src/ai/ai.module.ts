import { Module } from '@nestjs/common';
import { SportsModule } from '../sports/sports.module';
import { UsersModule } from '../users/users.module';
import { AiTextProviders } from './ai-text-providers';
import { AiController } from './ai.controller';
import { AiRepository } from './ai.repository';
import { AiService } from './ai.service';
import { MatchDraftService } from './match-draft.service';

@Module({
  imports: [UsersModule, SportsModule],
  controllers: [AiController],
  providers: [AiService, AiRepository, AiTextProviders, MatchDraftService],
})
export class AiModule {}
