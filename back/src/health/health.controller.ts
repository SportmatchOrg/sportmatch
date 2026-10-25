import { Controller, Get, Res } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { HealthService } from './health.service';

@ApiTags('Estado')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  async check(@Res({ passthrough: true }) response: Response) {
    response.setHeader('Cache-Control', 'no-store');

    if (await this.healthService.isDatabaseUp()) {
      return { ok: true, db: 'up' };
    }

    response.status(503);

    return { ok: false, db: 'down' };
  }
}
