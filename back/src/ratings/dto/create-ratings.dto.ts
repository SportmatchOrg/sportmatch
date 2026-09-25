import { Type } from 'class-transformer';
import {
  ArrayUnique,
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

export class RatingItemDto {
  @IsString()
  ratedUserId: string;

  @IsInt()
  @Min(1)
  @Max(5)
  score: number;

  @IsOptional()
  @IsString()
  @MaxLength(280)
  comment?: string;
}

export class CreateRatingsDto {
  // Empty when every assigned target was reported as a no-show.
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RatingItemDto)
  ratings: RatingItemDto[];

  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsString({ each: true })
  noShowUserIds?: string[];
}
