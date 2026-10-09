import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/current-user.decorator';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';
import type { FirebaseUser } from '../auth/types';
import { CreateReportDto } from './dto/create-report.dto';
import { ReportsService } from './reports.service';

@UseGuards(FirebaseAuthGuard)
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Post()
  create(
    @CurrentUser() user: FirebaseUser,
    @Body() createReportDto: CreateReportDto,
  ) {
    return this.reportsService.create(user.uid, createReportDto);
  }
}
