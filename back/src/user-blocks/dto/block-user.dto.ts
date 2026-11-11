import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import {
  BLOCK_DURATIONS,
  type BlockDuration,
} from '../../utils/blocks/account-block';

export class BlockUserDto {
  @IsIn(BLOCK_DURATIONS)
  duration: BlockDuration;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  reportId?: string;
}
