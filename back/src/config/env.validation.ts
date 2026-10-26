import { plainToInstance } from 'class-transformer';
import {
  IsEmail,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
  Min,
  ValidateIf,
  validateSync,
} from 'class-validator';

class EnvironmentVariables {
  @IsOptional()
  @IsNumber()
  PORT?: number;

  @IsUrl({ require_tld: false })
  FRONT_URL: string;

  @IsString()
  @IsNotEmpty()
  DATABASE_URL: string;

  @IsString()
  @IsNotEmpty()
  FIREBASE_PROJECT_ID: string;

  @IsEmail()
  FIREBASE_CLIENT_EMAIL: string;

  @IsString()
  @IsNotEmpty()
  FIREBASE_PRIVATE_KEY: string;

  @IsString()
  @IsNotEmpty()
  VAPID_PUBLIC_KEY: string;

  @IsString()
  @IsNotEmpty()
  VAPID_PRIVATE_KEY: string;

  @IsString()
  @Matches(/^(mailto:[^\s@]+@[^\s@]+\.[^\s@]+|https:\/\/\S+)$/)
  VAPID_SUBJECT: string;

  @ValidateIf((_, value) => value !== undefined && value !== '')
  @IsEmail()
  SEED_DEMO_EMAIL?: string;

  @ValidateIf((_, value) => value !== undefined && value !== '')
  @IsEmail()
  SEED_ADMIN_EMAIL?: string;

  @ValidateIf((_, value) => value !== undefined && value !== '')
  @IsString()
  KPI_API_KEY?: string;

  @ValidateIf((_, value) => value !== undefined && value !== '')
  @IsIn(['true', 'false'])
  SWAGGER_ENABLED?: string;

  @ValidateIf((_, value) => value !== undefined && value !== '')
  @IsString()
  ANTHROPIC_API_KEY?: string;

  @ValidateIf((_, value) => value !== undefined && value !== '')
  @IsString()
  AI_TEXT_MODEL?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  AI_MATCH_DRAFT_DAILY_LIMIT?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  AI_IMAGE_DAILY_LIMIT?: number;
}

export function validateEnv(
  config: Record<string, unknown>,
): EnvironmentVariables {
  const variables = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(variables, { skipMissingProperties: false });

  if (errors.length > 0) {
    const details = errors.map((error) => `  - ${error.toString()}`).join('\n');
    throw new Error(`Invalid environment configuration:\n${details}`);
  }

  return variables;
}
