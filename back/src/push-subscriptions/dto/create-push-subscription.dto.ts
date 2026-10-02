import { Type } from 'class-transformer';
import {
  IsDefined,
  IsNotEmpty,
  IsString,
  IsUrl,
  ValidateNested,
} from 'class-validator';

class PushSubscriptionKeysDto {
  @IsString()
  @IsNotEmpty()
  p256dh: string;

  @IsString()
  @IsNotEmpty()
  auth: string;
}

export class CreatePushSubscriptionDto {
  @IsUrl({ protocols: ['https'], require_protocol: true })
  endpoint: string;

  @IsDefined()
  @ValidateNested()
  @Type(() => PushSubscriptionKeysDto)
  keys: PushSubscriptionKeysDto;
}
