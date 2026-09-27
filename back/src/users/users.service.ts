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
    const ratings = await this.usersRepository.findReceivedRatings(userId);

    if (ratings.length === 0) {
      return [];
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

    return ratings
      .filter(({ matchId, raterId }) => {
        const confirmed = confirmedByMatch.get(matchId);

        return !confirmed?.has(userId) && !confirmed?.has(raterId);
      })
      .map(({ score }) => score);
  }

  async getScores(userIds: string[]): Promise<Map<string, UserScore>> {
    const scores = await Promise.all(
      userIds.map(
        async (userId) => [userId, await this.getScore(userId)] as const,
      ),
    );

    return new Map(scores);
  }

  private async getScore(userId: string): Promise<UserScore> {
    const [effectiveScores, reportedMatches, lateWithdrawals, canceledMatches] =
      await Promise.all([
        this.findEffectiveReceivedScores(userId),
        this.usersRepository.findMatchesReportedIn(userId),
        this.usersRepository.countLateWithdrawals(userId),
        this.usersRepository.findCanceledMatchDates(userId),
      ]);

    const noShows = reportedMatches.filter((match) =>
      confirmedNoShowIds(match.noShowReports, match.organizerId).includes(
        userId,
      ),
    ).length;

    const lateCancels = canceledMatches.filter(
      ({ date, canceledAt }) =>
        canceledAt !== null && isLateWithdrawal(date, canceledAt.getTime()),
    ).length;

    const penalties = [
      ...Array<number>(noShows).fill(NO_SHOW_SCORE),
      ...Array<number>(lateWithdrawals + lateCancels).fill(
        LATE_WITHDRAWAL_SCORE,
      ),
    ];
    const scores = [...effectiveScores, ...penalties];
    const total = scores.reduce((sum, score) => sum + score, 0);

    return {
      rating:
        scores.length === 0
          ? null
          : Math.round((total / scores.length) * 10) / 10,
      ratingCount: effectiveScores.length,
    };
  }

  private async withStats<T extends { id: string }>(user: T) {
    const [score, playedDates] = await Promise.all([
      this.getScore(user.id),
      this.usersRepository.findPlayedDates(user.id),
    ]);

    return {
      ...user,
      stats: {
        ...score,
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
