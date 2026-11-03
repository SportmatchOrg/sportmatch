import {
  Injectable,
  Logger,
  ServiceUnavailableException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

const MODEL = '@cf/black-forest-labs/flux-1-schnell';
const API_BASE_URL = 'https://api.cloudflare.com/client/v4/accounts';
const TIMEOUT_MS = 30_000;
const STEPS = 4;
const REJECTED_STATUSES = [400, 422];
const UNAVAILABLE_MESSAGE = 'La generación de imágenes no está disponible';
const REJECTED_MESSAGE =
  'No pudimos generar una imagen con esa descripción. Probá con otras palabras';

type CloudflareImageResponse = { result?: { image?: string } | null };

@Injectable()
export class CloudflareImageClient {
  private readonly logger = new Logger(CloudflareImageClient.name);
  private readonly accountId: string | undefined;
  private readonly apiToken: string | undefined;

  constructor(config: ConfigService) {
    this.accountId = config.get<string>('CF_ACCOUNT_ID') || undefined;
    this.apiToken = config.get<string>('CF_API_TOKEN') || undefined;

    if (!this.accountId || !this.apiToken) {
      this.logger.warn(
        'CF_ACCOUNT_ID or CF_API_TOKEN is not set: image generation is disabled',
      );
    }
  }

  async generate(prompt: string): Promise<Buffer> {
    if (!this.accountId || !this.apiToken) {
      throw new ServiceUnavailableException(UNAVAILABLE_MESSAGE);
    }

    const response = await this.request(this.accountId, this.apiToken, prompt);

    if (REJECTED_STATUSES.includes(response.status)) {
      throw new UnprocessableEntityException(REJECTED_MESSAGE);
    }

    if (!response.ok) {
      this.logger.warn(
        `Cloudflare image request failed (HTTP ${response.status})`,
      );
      throw new ServiceUnavailableException(UNAVAILABLE_MESSAGE);
    }

    const body = (await response
      .json()
      .catch(() => null)) as CloudflareImageResponse | null;
    const image = body?.result?.image;

    if (!image) {
      this.logger.warn('Cloudflare image response had no image');
      throw new ServiceUnavailableException(UNAVAILABLE_MESSAGE);
    }

    return Buffer.from(image, 'base64');
  }

  private async request(
    accountId: string,
    apiToken: string,
    prompt: string,
  ): Promise<Response> {
    try {
      return await fetch(`${API_BASE_URL}/${accountId}/ai/run/${MODEL}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt, steps: STEPS }),
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });
    } catch (error) {
      this.logger.warn(
        `Cloudflare image request failed (${error instanceof Error ? error.name : 'unknown error'})`,
      );
      throw new ServiceUnavailableException(UNAVAILABLE_MESSAGE);
    }
  }
}
