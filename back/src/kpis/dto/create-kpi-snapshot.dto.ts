import { IsOptional, Matches } from 'class-validator';

export class CreateKpiSnapshotDto {
  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'date must have the format YYYY-MM-DD',
  })
  date?: string;
}
