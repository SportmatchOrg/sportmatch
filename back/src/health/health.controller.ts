import { Controller, Get, Logger, Res } from '@nestjs/common';
import type { Response } from 'express';
import { PrismaService } from '../prisma/prisma.service';

const DB_TIMEOUT_MS = 2000;

@Controller('health')
export class HealthController {
  private readonly logger = new Logger(HealthController.name);

  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async check(@Res({ passthrough: true }) response: Response) {
    response.setHeader('Cache-Control', 'no-store');

    try {
      await this.withTimeout(this.prisma.$queryRaw`SELECT 1`);

      return { ok: true, db: 'up' };
    } catch (error) {
      this.logger.error('Health check failed', error);
      response.status(503);

      return { ok: false, db: 'down' };
    }
  }

  private withTimeout<T>(query: Promise<T>): Promise<T> {
    const timeout = new Promise<never>((_, reject) =>
      setTimeout(
        () =>
          reject(new Error(`Database did not answer in ${DB_TIMEOUT_MS}ms`)),
        DB_TIMEOUT_MS,
      ),
    );

    return Promise.race([query, timeout]);
  }
}
