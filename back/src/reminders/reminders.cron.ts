import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { RemindersService } from './reminders.service';

@Injectable()
export class RemindersCron {
  private readonly logger = new Logger(RemindersCron.name);

  constructor(private readonly remindersService: RemindersService) {}

  @Cron(CronExpression.EVERY_HOUR, {
    name: 'match-reminders',
    waitForCompletion: true,
  })
  async sendDueReminders() {
    try {
      await this.remindersService.sendDueReminders();
    } catch (error) {
      this.logger.error(
        `Reminder run failed: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }
}
