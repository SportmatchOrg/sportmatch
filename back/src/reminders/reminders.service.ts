import { Injectable, Logger } from '@nestjs/common';
import type { CreateNotificationInput } from '../notifications/notifications.repository';
import { NotificationsService } from '../notifications/notifications.service';
import { MS_PER_DAY } from '../utils/time/milliseconds';
import { RemindersRepository } from './reminders.repository';

const REMINDER_LEAD_MS = MS_PER_DAY;

type ReminderMatch = Awaited<
  ReturnType<RemindersRepository['findPending']>
>[number];

const wasPlannedAhead = ({ date, createdAt }: ReminderMatch): boolean =>
  date.getTime() - createdAt.getTime() >= REMINDER_LEAD_MS;

const recipients = ({ organizerId, participants }: ReminderMatch): string[] => [
  ...new Set([organizerId, ...participants.map(({ userId }) => userId)]),
];

@Injectable()
export class RemindersService {
  private readonly logger = new Logger(RemindersService.name);

  constructor(
    private readonly remindersRepository: RemindersRepository,
    private readonly notificationsService: NotificationsService,
  ) {}

  async sendDueReminders(now = new Date()): Promise<number> {
    const until = new Date(now.getTime() + REMINDER_LEAD_MS);
    const matches = await this.remindersRepository.findPending(now, until);
    let sent = 0;

    for (const match of matches.filter(wasPlannedAhead)) {
      if (await this.remind(match, now)) {
        sent += 1;
      }
    }

    if (sent > 0) {
      this.logger.log(`Sent the 24 h reminder for ${sent} match(es)`);
    }

    return sent;
  }

  private async remind(match: ReminderMatch, sentAt: Date): Promise<boolean> {
    if (!(await this.remindersRepository.claim(match.id, sentAt))) {
      return false;
    }

    const notification: Omit<CreateNotificationInput, 'userId'> = {
      type: 'MATCH_REMINDER',
      matchId: match.id,
    };

    await this.notificationsService.notifyMany(
      recipients(match).map((userId) => ({ ...notification, userId })),
    );

    return true;
  }
}
