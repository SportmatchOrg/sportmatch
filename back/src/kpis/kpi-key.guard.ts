import { timingSafeEqual } from 'node:crypto';
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';

const KEY_HEADER = 'x-kpi-key';

const isSameKey = (provided: string, expected: string): boolean => {
  const providedBytes = Buffer.from(provided);
  const expectedBytes = Buffer.from(expected);

  return (
    providedBytes.length === expectedBytes.length &&
    timingSafeEqual(providedBytes, expectedBytes)
  );
};

@Injectable()
export class KpiKeyGuard implements CanActivate {
  constructor(private readonly config: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const expected = this.config.get<string>('KPI_API_KEY');

    if (!expected) {
      throw new ServiceUnavailableException('KPI snapshots are not configured');
    }

    const provided = context.switchToHttp().getRequest<Request>().headers[
      KEY_HEADER
    ];

    if (typeof provided !== 'string' || !isSameKey(provided, expected)) {
      throw new UnauthorizedException('Missing or invalid KPI key');
    }

    return true;
  }
}
