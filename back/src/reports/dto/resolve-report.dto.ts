import { IsIn } from 'class-validator';
import { ReportStatus } from '../../generated/prisma/client';

export const REPORT_RESOLUTIONS = [
  ReportStatus.REVIEWED,
  ReportStatus.DISMISSED,
] as const;

export type ReportResolution = (typeof REPORT_RESOLUTIONS)[number];

export class ResolveReportDto {
  @IsIn(REPORT_RESOLUTIONS)
  status: ReportResolution;
}
