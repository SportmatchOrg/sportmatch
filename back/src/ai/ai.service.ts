import {
  HttpException,
  HttpStatus,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AiUsageKind } from '../generated/prisma/client';
import {
  startOfArgentinaDay,
  toArgentinaDate,
} from '../utils/time/argentina-date';
import { AiTextClient } from './ai-text.client';
import { AiRepository } from './ai.repository';

const UNAVAILABLE_MESSAGE = 'El asistente no está disponible';
const DAILY_LIMIT_MESSAGE =
  'Llegaste al límite diario del asistente. Probá de nuevo mañana';

const DEFAULT_DAILY_LIMITS: Record<AiUsageKind, number> = {
  MATCH_DRAFT: 20,
  IMAGE: 5,
};

@Injectable()
export class AiService {
  private readonly dailyLimits: Record<AiUsageKind, number>;

  constructor(
    private readonly aiRepository: AiRepository,
    private readonly aiTextClient: AiTextClient,
    config: ConfigService,
  ) {
    this.dailyLimits = {
      MATCH_DRAFT:
        config.get<number>('AI_MATCH_DRAFT_DAILY_LIMIT') ??
        DEFAULT_DAILY_LIMITS.MATCH_DRAFT,
      IMAGE:
        config.get<number>('AI_IMAGE_DAILY_LIMIT') ??
        DEFAULT_DAILY_LIMITS.IMAGE,
    };
  }

  getTextClient() {
    const { sdk, model } = this.aiTextClient;

    if (!sdk) {
      throw new ServiceUnavailableException(UNAVAILABLE_MESSAGE);
    }

    return { sdk, model };
  }

  async assertQuota(userId: string, kind: AiUsageKind) {
    const startOfToday = startOfArgentinaDay(toArgentinaDate(new Date()));
    const used = await this.aiRepository.countUsagesSince(
      userId,
      kind,
      startOfToday,
    );

    if (used >= this.dailyLimits[kind]) {
      throw new HttpException(
        DAILY_LIMIT_MESSAGE,
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
  }

  async recordUsage(userId: string, kind: AiUsageKind) {
    await this.aiRepository.recordUsage(userId, kind);
  }
}
