import { Injectable } from '@nestjs/common';
import { AiProvider, AiUsageKind } from '../generated/prisma/client';
import { MatchesService } from '../matches/matches.service';
import { UsersService } from '../users/users.service';
import { AiService } from './ai.service';
import { CloudflareImageClient } from './cloudflare-image.client';
import { CreateImageDto } from './dto/create-image.dto';

const IMAGE_CONTENT_TYPE = 'image/jpeg';

export type GeneratedImage = { image: string };

@Injectable()
export class ImageGenerationService {
  constructor(
    private readonly aiService: AiService,
    private readonly usersService: UsersService,
    private readonly matchesService: MatchesService,
    private readonly cloudflareImageClient: CloudflareImageClient,
  ) {}

  async create(
    firebaseUid: string,
    { prompt, target, matchId }: CreateImageDto,
  ): Promise<GeneratedImage> {
    const user = await this.usersService.findByFirebaseUid(firebaseUid);

    if (target === 'match' && matchId) {
      await this.matchesService.assertCanChangePhoto(user.id, matchId);
    }

    const { result } = await this.aiService.withQuota(
      user.id,
      AiUsageKind.IMAGE,
      async () => ({
        result: await this.cloudflareImageClient.generate(prompt),
        provider: AiProvider.CLOUDFLARE,
      }),
    );

    return {
      image: `data:${IMAGE_CONTENT_TYPE};base64,${result.toString('base64')}`,
    };
  }
}
