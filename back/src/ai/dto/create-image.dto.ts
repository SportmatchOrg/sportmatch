import { Transform } from 'class-transformer';
import { IsIn, IsOptional, IsString, Length } from 'class-validator';

export const IMAGE_TARGETS = ['profile', 'match'] as const;

export type ImageTarget = (typeof IMAGE_TARGETS)[number];

export class CreateImageDto {
  @IsString()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @Length(3, 500)
  prompt: string;

  @IsIn(IMAGE_TARGETS)
  target: ImageTarget;

  @IsOptional()
  @IsString()
  matchId?: string;
}
