import { Transform, Type, type TransformFnParams } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsLatitude,
  IsLongitude,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { Level } from '../../generated/prisma/client';

const toArray = ({ value }: TransformFnParams): unknown =>
  value == null || Array.isArray(value) ? value : [value];

export class FindMatchesQueryDto {
  @IsOptional()
  @IsString({ each: true })
  @Transform(toArray)
  sportId?: string[];

  @IsOptional()
  @IsEnum(Level, { each: true })
  @Transform(toArray)
  level?: Level[];

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  from?: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  to?: Date;

  @IsOptional()
  @Type(() => Number)
  @IsLatitude()
  lat?: number;

  @IsOptional()
  @Type(() => Number)
  @IsLongitude()
  lng?: number;

  @IsOptional()
  @Type(() => Number)
  @Min(0.5)
  @Max(50)
  radiusKm?: number;
}
