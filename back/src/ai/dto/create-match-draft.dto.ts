import { Transform } from 'class-transformer';
import { IsString, Length } from 'class-validator';

export class CreateMatchDraftDto {
  @IsString()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @Length(3, 500)
  text: string;
}
