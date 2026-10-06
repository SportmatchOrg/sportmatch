import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CreateKpiSnapshotDto } from './dto/create-kpi-snapshot.dto';
import { KpiKeyGuard } from './kpi-key.guard';
import { KpisService } from './kpis.service';

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
