import { Module } from '@nestjs/common';
import { NotificationsModule } from '../notifications/notifications.module';
import { RemindersCron } from './reminders.cron';
import { RemindersRepository } from './reminders.repository';
import { RemindersService } from './reminders.service';

@Module({
  imports: [NotificationsModule],
  providers: [RemindersCron, RemindersService, RemindersRepository],
})
export class RemindersModule {}
