import { OmitType, PartialType } from '@nestjs/mapped-types';
import { IsOptional, IsString, Length } from 'class-validator';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(
  OmitType(CreateUserDto, ['firebaseUid', 'email'] as const),
) {
  @IsOptional()
  @IsString()
  @Length(2, 80)
  city?: string;
}
