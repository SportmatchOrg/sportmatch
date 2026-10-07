import { Transform, type TransformFnParams } from 'class-transformer';
import { IsString, Length } from 'class-validator';

const trim = ({ value }: TransformFnParams): unknown =>
  typeof value === 'string' ? value.trim() : value;

export class SearchUsersQueryDto {
  @Transform(trim)
  @IsString()
  @Length(2, 50)
  q: string;
}
