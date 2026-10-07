import { Module } from '@nestjs/common';
import { KpiKeyGuard } from './kpi-key.guard';
import { KpisController } from './kpis.controller';
import { KpisRepository } from './kpis.repository';
import { KpisService } from './kpis.service';

@Module({
  controllers: [KpisController],
  providers: [KpisService, KpisRepository, KpiKeyGuard],
})
export class KpisModule {}
