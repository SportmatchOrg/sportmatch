import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AdminGuard } from '../auth/admin.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';
import type { FirebaseUser } from '../auth/types';
import { AdminReportsService } from './admin-reports.service';
import { ListReportsQueryDto } from './dto/list-reports-query.dto';
import { ResolveReportDto } from './dto/resolve-report.dto';

@UseGuards(FirebaseAuthGuard, AdminGuard)
@Controller('admin/reports')
export class AdminReportsController {
  constructor(private readonly adminReportsService: AdminReportsService) {}

  @Get()
  findAll(@Query() listReportsQueryDto: ListReportsQueryDto) {
    return this.adminReportsService.findAll(listReportsQueryDto);
  }

  @Patch(':id')
  resolve(
    @CurrentUser() user: FirebaseUser,
    @Param('id') id: string,
    @Body() resolveReportDto: ResolveReportDto,
  ) {
    return this.adminReportsService.resolve(user.uid, id, resolveReportDto);
  }
}
