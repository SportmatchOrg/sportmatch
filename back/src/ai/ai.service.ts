import {
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type OpenAI from 'openai';
import { AiProvider, AiUsageKind } from '../generated/prisma/client';
import {
  startOfArgentinaDay,
  toArgentinaDate,
} from '../utils/time/argentina-date';
import {
  AiModelSelection,
  AiTextProviders,
  describeProviderError,
} from './ai-text-providers';
import { AiRepository } from './ai.repository';

const UNAVAILABLE_MESSAGE = 'El asistente no está disponible';
const DAILY_LIMIT_MESSAGE =
  'Llegaste al límite diario del asistente. Probá de nuevo mañana';

const DEFAULT_DAILY_LIMITS: Record<AiUsageKind, number> = {
  MATCH_DRAFT: 20,
  IMAGE: 5,
};

export type AiCompletionRequest<T> = (
  client: OpenAI,
  selection: AiModelSelection,
) => Promise<T>;

export type AiCompletion<T> = {
  result: T;
  provider: AiProvider;
};

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly dailyLimits: Record<AiUsageKind, number>;

  constructor(
    private readonly aiRepository: AiRepository,
    private readonly aiTextProviders: AiTextProviders,
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

  async complete<T>(request: AiCompletionRequest<T>): Promise<AiCompletion<T>> {
    for (const { name, client, selection } of this.aiTextProviders.available) {
      try {
        return { result: await request(client, selection), provider: name };
      } catch (error) {
        this.logger.warn(
          `AI provider ${name} failed (${describeProviderError(error)})`,
        );
      }
    }

    throw new ServiceUnavailableException(UNAVAILABLE_MESSAGE);
  }

  async withQuota<T>(
    userId: string,
    kind: AiUsageKind,
    run: () => Promise<AiCompletion<T>>,
  ): Promise<AiCompletion<T>> {
    const usageId = await this.reserveQuota(userId, kind);

    try {
      const completion = await run();

      await this.aiRepository.confirmUsage(usageId, completion.provider);

      return completion;
    } catch (error) {
      await this.aiRepository.releaseUsage(usageId);

      throw error;
    }
  }

  private async reserveQuota(userId: string, kind: AiUsageKind) {
    const usageId = await this.aiRepository.reserveUsage(
      userId,
      kind,
      startOfArgentinaDay(toArgentinaDate(new Date())),
      this.dailyLimits[kind],
    );

    if (!usageId) {
      throw new HttpException(
        DAILY_LIMIT_MESSAGE,
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    return usageId;
  }
}
