import { Injectable, Logger } from '@nestjs/common';
import { HealthRepository } from './health.repository';

const DB_TIMEOUT_MS = 2000;

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);

  constructor(private readonly healthRepository: HealthRepository) {}

  async isDatabaseUp(): Promise<boolean> {
    try {
      await this.withTimeout(this.healthRepository.ping());

      return true;
    } catch (error) {
      this.logger.error('Health check failed', error);

      return false;
    }
  }

  private async withTimeout<T>(query: Promise<T>): Promise<T> {
    let timer: NodeJS.Timeout | undefined;

    const timeout = new Promise<never>((_, reject) => {
      timer = setTimeout(
        () =>
          reject(new Error(`Database did not answer in ${DB_TIMEOUT_MS}ms`)),
        DB_TIMEOUT_MS,
      );
    });

    try {
      return await Promise.race([query, timeout]);
    } finally {
      clearTimeout(timer);
    }
  }
}
