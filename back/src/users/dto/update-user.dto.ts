import { OmitType, PartialType } from '@nestjs/mapped-types';
import {
  ArrayMaxSize,
  ArrayUnique,
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';
import { Level } from '../../generated/prisma/client';
import { CreateUserDto } from './create-user.dto';

const MAX_USER_SPORTS = 5;

export class UpdateUserDto extends PartialType(
  OmitType(CreateUserDto, ['firebaseUid', 'email'] as const),
) {
  @IsOptional()
  @IsString()
  @Length(2, 80)
  city?: string;

  @IsOptional()
  @IsEnum(Level)
  level?: Level;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(MAX_USER_SPORTS)
  @IsString({ each: true })
  @ArrayUnique()
  sportIds?: string[];
}
