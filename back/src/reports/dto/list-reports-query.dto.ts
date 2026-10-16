import { IsEnum, IsOptional } from 'class-validator';
import { ReportStatus } from '../../generated/prisma/client';

export class ListReportsQueryDto {
  @IsOptional()
  @IsEnum(ReportStatus)
  status: ReportStatus = ReportStatus.OPEN;
}
