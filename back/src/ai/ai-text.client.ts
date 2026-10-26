import Anthropic from '@anthropic-ai/sdk';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

const DEFAULT_TEXT_MODEL = 'claude-opus-5-5';
const REQUEST_TIMEOUT_MS = 60_000;

@Injectable()
export class AiTextClient {
  readonly model: string;
  readonly sdk: Anthropic | null;

  constructor(config: ConfigService) {
    const apiKey = config.get<string>('ANTHROPIC_API_KEY');

    this.model = config.get<string>('AI_TEXT_MODEL') || DEFAULT_TEXT_MODEL;
    this.sdk = apiKey
      ? new Anthropic({ apiKey, timeout: REQUEST_TIMEOUT_MS })
      : null;
  }
}
