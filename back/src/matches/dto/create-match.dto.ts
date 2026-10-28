import { Type } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsInt,
  IsLatitude,
  IsLongitude,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Max,
  Min,
} from 'class-validator';
import { Level } from '../../generated/prisma/client';
import {
  CAPACITY_MAX,
  CAPACITY_MIN,
  DESCRIPTION_MAX,
  LOCATION_MAX,
  LOCATION_MIN,
} from '../../utils/matches/match-limits';

export class CreateMatchDto {
  @IsString()
  @IsNotEmpty()
  sportId: string;

  @IsEnum(Level)
  level: Level;

  @Type(() => Date)
  @IsDate()
  date: Date;

  @IsString()
  @Length(LOCATION_MIN, LOCATION_MAX)
  location: string;

  @IsNumber()
  @IsLatitude()
  latitude: number;

  @IsNumber()
  @IsLongitude()
  longitude: number;

  @IsInt()
  @Min(CAPACITY_MIN)
  @Max(CAPACITY_MAX)
  capacity: number;

  @IsOptional()
  @IsString()
  @Length(0, DESCRIPTION_MAX)
  description?: string;
}
