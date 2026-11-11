import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { AdminReportsController } from './admin-reports.controller';
import { AdminReportsService } from './admin-reports.service';
import { ReportsController } from './reports.controller';
import { ReportsRepository } from './reports.repository';
import { ReportsService } from './reports.service';

@Module({
  imports: [UsersModule],
  controllers: [ReportsController, AdminReportsController],
  providers: [ReportsService, AdminReportsService, ReportsRepository],
})
export class ReportsModule {}
