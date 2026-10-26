import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiSecurity, ApiTags } from '@nestjs/swagger';
import { CreateKpiSnapshotDto } from './dto/create-kpi-snapshot.dto';
import { KPI_KEY_SECURITY, KpiKeyGuard } from './kpi-key.guard';
import { KpisService } from './kpis.service';

@ApiTags('KPIs')
@ApiSecurity(KPI_KEY_SECURITY)
@UseGuards(KpiKeyGuard)
@Controller('kpis')
export class KpisController {
  constructor(private readonly kpisService: KpisService) {}

  @Post('snapshots')
  @HttpCode(HttpStatus.OK)
  createSnapshot(@Body() body?: CreateKpiSnapshotDto) {
    return this.kpisService.createSnapshot(body?.date);
  }
}
