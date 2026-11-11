import {
  ArrayMaxSize,
  ArrayMinSize,
  ArrayUnique,
  IsArray,
  IsEnum,
  IsString,
  Length,
} from 'class-validator';
import { Level } from '../../generated/prisma/client';

const MAX_USER_SPORTS = 5;

export class CompleteOnboardingDto {
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(MAX_USER_SPORTS)
  @ArrayUnique()
  @IsString({ each: true })
  sportIds: string[];

  @IsEnum(Level)
  level: Level;

  @IsString()
  @Length(2, 80)
  city: string;
}
