import { IsEmail, IsOptional, IsString, IsUrl, Length } from 'class-validator';

export class CreateUserDto {
  @IsString()
  firebaseUid: string;

  @IsEmail()
  email: string;

  @IsString()
  @Length(2, 60)
  name: string;

  @IsOptional()
  @IsUrl()
  photoUrl?: string;
}
