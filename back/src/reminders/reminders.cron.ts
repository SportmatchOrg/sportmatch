import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { RemindersService } from './reminders.service';

const EVERY_15_MINUTES = '0 */15 * * * *';

@Injectable()
export class RemindersCron {
  private readonly logger = new Logger(RemindersCron.name);

  constructor(private readonly remindersService: RemindersService) {}

  @Cron(EVERY_15_MINUTES, { name: 'match-reminders', waitForCompletion: true })
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
