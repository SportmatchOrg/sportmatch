import {
  Controller,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../auth/current-user.decorator';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';
import type { FirebaseUser } from '../auth/types';
import { ListNotificationsDto } from './dto/list-notifications.dto';
import { NotificationsService } from './notifications.service';

@UseGuards(FirebaseAuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get('unread-count')
  unreadCount(@CurrentUser() user: FirebaseUser) {
    return this.notificationsService.unreadCount(user.uid);
  }

  @Get()
  findMine(
    @CurrentUser() user: FirebaseUser,
    @Query() query: ListNotificationsDto,
  ) {
    return this.notificationsService.findMine(user.uid, query.limit ?? 30);
  }

  @Patch('read-all')
  readAll(@CurrentUser() user: FirebaseUser) {
    return this.notificationsService.readAll(user.uid);
  }

  @Patch(':id/read')
  read(@CurrentUser() user: FirebaseUser, @Param('id') id: string) {
    return this.notificationsService.read(user.uid, id);
  }
}
