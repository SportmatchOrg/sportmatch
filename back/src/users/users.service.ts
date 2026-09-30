import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { isLateWithdrawal } from '../utils/matches/late-withdrawal';
import { confirmedNoShowIds } from '../utils/ratings/confirmed-no-shows';
import { UsersRepository } from './users.repository';
import { FirebaseUser } from '../auth/types';
import { toPrismaHttpException } from '../utils/prisma/to-http-exception';
import { weekStreak } from '../utils/time/week-streak';

const NO_SHOW_SCORE = 1;
const LATE_WITHDRAWAL_SCORE = 2;

type UserScore = {
  rating: number | null;
  ratingCount: number;
};

const EMPTY_SCORE: UserScore = { rating: null, ratingCount: 0 };

const countByUser = (userIds: string[]): Map<string, number> => {
  const counts = new Map<string, number>();

  for (const userId of userIds) {
    counts.set(userId, (counts.get(userId) ?? 0) + 1);
  }

  return counts;
};

const toScore = (
  stars: number[],
  noShows: number,
  lates: number,
): UserScore => {
  const scores = [
    ...stars,
    ...Array<number>(noShows).fill(NO_SHOW_SCORE),
    ...Array<number>(lates).fill(LATE_WITHDRAWAL_SCORE),
  ];

  if (scores.length === 0) {
    return EMPTY_SCORE;
  }

  const total = scores.reduce((sum, score) => sum + score, 0);

  return {
    rating: Math.round((total / scores.length) * 10) / 10,
    ratingCount: stars.length,
  };
};

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  findAll() {
    return this.usersRepository.findAll();
  }

  async findOne(id: string) {
    const user = await this.usersRepository.findById(id);

    if (!user) {
      throw new NotFoundException(`User with id ${id} was not found`);
    }

    return this.withStats(user);
  }

  async findByFirebaseUid(firebaseUid: string) {
    const user = await this.usersRepository.findByFirebaseUid(firebaseUid);

    if (!user) {
      throw new NotFoundException(
        `User with firebaseUid ${firebaseUid} was not found`,
      );
    }

    return user;
  }

  async create(createUserDto: CreateUserDto) {
    const existingUser = await this.usersRepository.findByFirebaseUid(
      createUserDto.firebaseUid,
    );

    if (existingUser) {
      return existingUser;
    }

    try {
      return await this.usersRepository.create(createUserDto);
    } catch (error) {
      throw this.toHttpException(error, createUserDto.email);
    }
  }

  ensureExists(user: FirebaseUser) {
    return this.usersRepository.ensureExists(user);
  }

  async upsertFromFirebase(user: FirebaseUser) {
    const saved = await this.usersRepository.upsertByFirebaseUid(user);

    return this.withStats(saved);
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    try {
      return await this.usersRepository.update(id, updateUserDto);
    } catch (error) {
      throw this.toHttpException(error, id);
    }
  }

  async remove(id: string) {
    try {
      return await this.usersRepository.remove(id);
    } catch (error) {
      throw this.toHttpException(error, id);
    }
  }

  async findEffectiveReceivedScores(userId: string): Promise<number[]> {
    return (await this.findEffectiveScoresBy([userId])).get(userId) ?? [];
  }

  async getScores(userIds: string[]): Promise<Map<string, UserScore>> {
    if (userIds.length === 0) {
      return new Map();
    }

    const [effectiveScores, reportedMatches, lateWithdrawals, canceledMatches] =
      await Promise.all([
        this.findEffectiveScoresBy(userIds),
        this.usersRepository.findMatchesReportedIn(userIds),
        this.usersRepository.countLateWithdrawalsBy(userIds),
        this.usersRepository.findCanceledMatchDates(userIds),
      ]);

    const noShowsByUser = countByUser(
      reportedMatches.flatMap((match) =>
        confirmedNoShowIds(match.noShowReports, match.organizerId),
      ),
    );

    const lateWithdrawalsByUser = new Map(
      lateWithdrawals.map(({ userId, _count }) => [userId, _count._all]),
    );

    const lateCancelsByUser = countByUser(
      canceledMatches
        .filter(
          ({ date, canceledAt }) =>
            canceledAt !== null && isLateWithdrawal(date, canceledAt.getTime()),
        )
        .map(({ organizerId }) => organizerId),
    );

    return new Map(
      userIds.map((userId) => {
        const stars = effectiveScores.get(userId) ?? [];
        const noShows = noShowsByUser.get(userId) ?? 0;
        const lates =
          (lateWithdrawalsByUser.get(userId) ?? 0) +
          (lateCancelsByUser.get(userId) ?? 0);

        return [userId, toScore(stars, noShows, lates)];
      }),
    );
  }

  private async findEffectiveScoresBy(
    userIds: string[],
  ): Promise<Map<string, number[]>> {
    const ratings = await this.usersRepository.findReceivedRatings(userIds);
    const scoresByUser = new Map(
      userIds.map((userId) => [userId, [] as number[]]),
    );

    if (ratings.length === 0) {
      return scoresByUser;
    }

    const matchIds = [...new Set(ratings.map(({ matchId }) => matchId))];
    const matches =
      await this.usersRepository.findNoShowReportsByMatch(matchIds);

    const confirmedByMatch = new Map(
      matches.map((match) => [
        match.id,
        new Set(confirmedNoShowIds(match.noShowReports, match.organizerId)),
      ]),
    );

    for (const { score, matchId, raterId, ratedUserId } of ratings) {
      const confirmed = confirmedByMatch.get(matchId);

      if (confirmed?.has(ratedUserId) || confirmed?.has(raterId)) {
        continue;
      }

      scoresByUser.get(ratedUserId)?.push(score);
    }

    return scoresByUser;
  }

  private async withStats<T extends { id: string }>(user: T) {
    const [scores, playedDates] = await Promise.all([
      this.getScores([user.id]),
      this.usersRepository.findPlayedDates(user.id),
    ]);

    return {
      ...user,
      stats: {
        ...(scores.get(user.id) ?? EMPTY_SCORE),
        playedCount: playedDates.length,
        weekStreak: weekStreak(playedDates.map(({ date }) => date)),
      },
    };
  }

  private toHttpException(error: unknown, reference: string): Error {
    return toPrismaHttpException(error, {
      P2002: 'A user with that email or firebaseUid already exists',
      P2025: `User with id ${reference} was not found`,
    });
  }
}
