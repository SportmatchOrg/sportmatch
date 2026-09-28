import { Transform, Type, type TransformFnParams } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsLatitude,
  IsLongitude,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { Level } from '../../generated/prisma/client';

const toArray = ({ value }: TransformFnParams): unknown =>
  value == null || Array.isArray(value) ? value : [value];

const toOptionalNumber = ({ value }: TransformFnParams): unknown =>
  value === '' || value == null ? undefined : Number(value);

export class FindMatchesQueryDto {
  @IsOptional()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
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
  @Transform(toOptionalNumber)
  @IsLatitude()
  lat?: number;

  @IsOptional()
  @Transform(toOptionalNumber)
  @IsLongitude()
  lng?: number;

  @IsOptional()
  @Transform(toOptionalNumber)
  @Min(0.5)
  @Max(50)
  radiusKm?: number;
}
