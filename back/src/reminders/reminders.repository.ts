import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const REMINDER_MATCH = {
  id: true,
  date: true,
  createdAt: true,
  organizerId: true,
  participants: { select: { userId: true } },
} as const;

@Injectable()
export class RemindersRepository {
  constructor(private readonly prisma: PrismaService) {}

  findPending(from: Date, until: Date) {
    return this.prisma.match.findMany({
      where: {
        status: 'ACTIVE',
        reminderSentAt: null,
        date: { gt: from, lte: until },
      },
      select: REMINDER_MATCH,
    });
  }

  async claim(matchId: string, sentAt: Date): Promise<boolean> {
    const { count } = await this.prisma.match.updateMany({
      where: { id: matchId, status: 'ACTIVE', reminderSentAt: null },
      data: { reminderSentAt: sentAt },
    });

    return count === 1;
  }
}
