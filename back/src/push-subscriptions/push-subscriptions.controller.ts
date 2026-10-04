import {
  Body,
  Controller,
  Delete,
  HttpCode,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../auth/current-user.decorator';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';
import type { FirebaseUser } from '../auth/types';
import { CreatePushSubscriptionDto } from './dto/create-push-subscription.dto';
import { DeletePushSubscriptionDto } from './dto/delete-push-subscription.dto';
import { PushSubscriptionsService } from './push-subscriptions.service';

@UseGuards(FirebaseAuthGuard)
@Controller('push-subscriptions')
export class PushSubscriptionsController {
  constructor(
    private readonly pushSubscriptionsService: PushSubscriptionsService,
  ) {}

  @Post()
  subscribe(
    @CurrentUser() user: FirebaseUser,
    @Body() subscription: CreatePushSubscriptionDto,
  ) {
    return this.pushSubscriptionsService.subscribe(user.uid, subscription);
  }

  @Delete()
  @HttpCode(204)
  async unsubscribe(
    @CurrentUser() user: FirebaseUser,
    @Body() subscription: DeletePushSubscriptionDto,
  ) {
    await this.pushSubscriptionsService.unsubscribe(
      user.uid,
      subscription.endpoint,
    );
  }
}
