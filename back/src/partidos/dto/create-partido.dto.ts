import { Type } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Max,
  Min,
} from 'class-validator';
import { Level } from '../../generated/prisma/client';

export class CreatePartidoDto {
  @IsString()
  @IsNotEmpty()
  sportId: string;

  @IsEnum(Level)
  level: Level;

  @Type(() => Date)
  @IsDate()
  date: Date;

  @IsString()
  @Length(3, 120)
  location: string;

  @IsInt()
  @Min(2)
  @Max(30)
  capacity: number;

  @IsOptional()
  @IsString()
  @Length(0, 500)
  description?: string;
}
