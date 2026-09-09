import { IsEnum } from 'class-validator';
import { JoinRequestStatus } from '../../generated/prisma/client';

export class UpdateJoinRequestDto {
  @IsEnum(JoinRequestStatus)
  status: JoinRequestStatus;
}
