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

const FREE_MODEL_LIST = /^\s*[^,\s]+:free(\s*,\s*[^,\s]+:free)*\s*,?\s*$/;

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
  AZURE_STORAGE_CONNECTION_STRING: string;

  @IsString()
  @IsNotEmpty()
  AZURE_STORAGE_CONTAINER: string;

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
  GEMINI_API_KEY?: string;

  @ValidateIf((_, value) => value !== undefined && value !== '')
  @IsString()
  OPENROUTER_API_KEY?: string;

  @ValidateIf((_, value) => value !== undefined && value !== '')
  @IsString()
  AI_TEXT_MODEL?: string;

  @ValidateIf((_, value) => value !== undefined && value !== '')
  @IsString()
  @Matches(FREE_MODEL_LIST)
  AI_FALLBACK_MODEL?: string;

  @ValidateIf((_, value) => value !== undefined && value !== '')
  @IsString()
  CF_ACCOUNT_ID?: string;

  @ValidateIf((_, value) => value !== undefined && value !== '')
  @IsString()
  CF_API_TOKEN?: string;

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
    const details = errors
      .map(
        (error) =>
          `  - ${error.property}: ${Object.values(error.constraints ?? {}).join(', ')}`,
      )
      .join('\n');
    throw new Error(`Invalid environment configuration:\n${details}`);
  }

  return variables;
}
