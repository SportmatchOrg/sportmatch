import { Module } from '@nestjs/common';
import { MatchesModule } from '../matches/matches.module';
import { SportsModule } from '../sports/sports.module';
import { UsersModule } from '../users/users.module';
import { AiTextProviders } from './ai-text-providers';
import { AiController } from './ai.controller';
import { AiRepository } from './ai.repository';
import { AiService } from './ai.service';
import { CloudflareImageClient } from './cloudflare-image.client';
import { ImageGenerationService } from './image-generation.service';
import { MatchDraftService } from './match-draft.service';

@Module({
  imports: [UsersModule, SportsModule, MatchesModule],
  controllers: [AiController],
  providers: [
    AiService,
    AiRepository,
    AiTextProviders,
    CloudflareImageClient,
    MatchDraftService,
    ImageGenerationService,
  ],
})
export class AiModule {}
