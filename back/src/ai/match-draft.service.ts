import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import type OpenAI from 'openai';
import { zodResponseFormat } from 'openai/helpers/zod';
import { AiUsageKind, Level } from '../generated/prisma/client';
import { SportsService } from '../sports/sports.service';
import { UsersService } from '../users/users.service';
import {
  CAPACITY_MAX,
  CAPACITY_MIN,
  DESCRIPTION_MAX,
  LOCATION_MAX,
  LOCATION_MIN,
} from '../utils/matches/match-limits';
import { parseArgentinaDateTime } from '../utils/time/argentina-date';
import type { AiModelSelection } from './ai-text-providers';
import { AiService } from './ai.service';
import { CreateMatchDraftDto } from './dto/create-match-draft.dto';
import { matchDraftInstructions } from './match-draft.prompt';
import { MatchDraftOutput, matchDraftSchema } from './match-draft.schema';

const NOT_UNDERSTOOD_MESSAGE =
  'No pudimos entender el partido. Probá con otras palabras';

export type MatchDraft = {
  sportId: string | null;
  level: Level | null;
  date: Date | null;
  location: string | null;
  capacity: number | null;
  description: string | null;
};

const extractJson = (content: string | null): unknown => {
  if (!content) {
    return null;
  }

  try {
    return JSON.parse(
      content.slice(content.indexOf('{'), content.lastIndexOf('}') + 1),
    );
  } catch {
    return null;
  }
};

const toText = (value: string | null, max: number, min = 1): string | null => {
  const text = value?.trim() ?? '';

  return text.length < min ? null : text.slice(0, max);
};

const toCapacity = (value: number | null): number | null =>
  value === null
    ? null
    : Math.min(CAPACITY_MAX, Math.max(CAPACITY_MIN, Math.round(value)));

const toFutureDate = (value: string | null, now: Date): Date | null => {
  const date = value ? parseArgentinaDateTime(value) : null;

  return date && date > now ? date : null;
};

@Injectable()
export class MatchDraftService {
  constructor(
    private readonly aiService: AiService,
    private readonly usersService: UsersService,
    private readonly sportsService: SportsService,
  ) {}

  async create(
    firebaseUid: string,
    { text }: CreateMatchDraftDto,
  ): Promise<MatchDraft> {
    const user = await this.usersService.findByFirebaseUid(firebaseUid);
    const now = new Date();
    const { result: content } = await this.aiService.withQuota(
      user.id,
      AiUsageKind.MATCH_DRAFT,
      () =>
        this.aiService.complete((client, selection) =>
          this.requestDraft(client, selection, text, now),
        ),
    );
    const draft = await this.toDraft(this.parse(content), now);

    if (Object.values(draft).every((value) => value === null)) {
      throw new UnprocessableEntityException(NOT_UNDERSTOOD_MESSAGE);
    }

    return draft;
  }

  private async requestDraft(
    client: OpenAI,
    selection: AiModelSelection,
    text: string,
    now: Date,
  ): Promise<string | null> {
    const completion = await client.chat.completions.create({
      ...selection,
      messages: [
        { role: 'system', content: matchDraftInstructions(now) },
        { role: 'user', content: text },
      ],
      response_format: zodResponseFormat(matchDraftSchema, 'match_draft'),
    });

    return completion.choices[0]?.message.content ?? null;
  }

  private parse(content: string | null): MatchDraftOutput {
    const parsed = matchDraftSchema.safeParse(extractJson(content));

    if (!parsed.success) {
      throw new UnprocessableEntityException(NOT_UNDERSTOOD_MESSAGE);
    }

    return parsed.data;
  }

  private async toDraft(
    output: MatchDraftOutput,
    now: Date,
  ): Promise<MatchDraft> {
    return {
      sportId: output.sport
        ? await this.sportsService.findIdByName(output.sport)
        : null,
      level: output.level,
      date: toFutureDate(output.date, now),
      location: toText(output.location, LOCATION_MAX, LOCATION_MIN),
      capacity: toCapacity(output.capacity),
      description: toText(output.description, DESCRIPTION_MAX),
    };
  }
}
