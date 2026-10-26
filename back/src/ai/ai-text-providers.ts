import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI, { APIConnectionTimeoutError, APIError } from 'openai';
import { AiProvider } from '../generated/prisma/client';

const GEMINI_BASE_URL =
  'https://generativelanguage.googleapis.com/v1beta/openai/';
const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';
const GEMINI_TIMEOUT_MS = 8_000;
const OPENROUTER_TIMEOUT_MS = 30_000;
const DEFAULT_TEXT_MODEL = 'gemini-3.5-flash-lite';
const DEFAULT_FALLBACK_MODELS = [
  'dots-studio/dots-3-note-preview:free',
  'nvidia/nemotron-3.5-super-vl:free',
];

export type AiModelSelection = {
  model: string;
  models?: string[];
};

export type AiTextProvider = {
  name: AiProvider;
  client: OpenAI;
  selection: AiModelSelection;
};

const toModelList = (value: string | undefined): string[] =>
  (value ?? '')
    .split(',')
    .map((model) => model.trim())
    .filter(Boolean);

const createClient = (apiKey: string, baseURL: string, timeout: number) =>
  new OpenAI({ apiKey, baseURL, timeout, maxRetries: 0 });

export const describeProviderError = (error: unknown): string => {
  if (error instanceof APIConnectionTimeoutError) {
    return 'timeout';
  }

  if (error instanceof APIError) {
    return error.status ? `HTTP ${error.status}` : 'network error';
  }

  return error instanceof Error ? error.name : 'unknown error';
};

@Injectable()
export class AiTextProviders {
  private readonly logger = new Logger(AiTextProviders.name);

  readonly available: AiTextProvider[];

  constructor(config: ConfigService) {
    const providers = [this.gemini(config), this.openRouter(config)];

    this.available = providers.filter(
      (provider): provider is AiTextProvider => provider !== null,
    );
  }

  private gemini(config: ConfigService): AiTextProvider | null {
    const apiKey = config.get<string>('GEMINI_API_KEY');

    if (!apiKey) {
      this.logger.warn('GEMINI_API_KEY is not set: Gemini is disabled');
      return null;
    }

    return {
      name: AiProvider.GEMINI,
      client: createClient(apiKey, GEMINI_BASE_URL, GEMINI_TIMEOUT_MS),
      selection: {
        model: config.get<string>('AI_TEXT_MODEL') || DEFAULT_TEXT_MODEL,
      },
    };
  }

  private openRouter(config: ConfigService): AiTextProvider | null {
    const apiKey = config.get<string>('OPENROUTER_API_KEY');

    if (!apiKey) {
      this.logger.warn('OPENROUTER_API_KEY is not set: OpenRouter is disabled');
      return null;
    }

    const configured = toModelList(config.get<string>('AI_FALLBACK_MODEL'));
    const models = configured.length > 0 ? configured : DEFAULT_FALLBACK_MODELS;

    return {
      name: AiProvider.OPENROUTER,
      client: createClient(apiKey, OPENROUTER_BASE_URL, OPENROUTER_TIMEOUT_MS),
      selection: { model: models[0], models },
    };
  }
}
