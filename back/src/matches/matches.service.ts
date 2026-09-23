import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { toPrismaHttpException } from '../utils/prisma/to-http-exception';
import { CreateMatchDto } from './dto/create-match.dto';
import { UpdateMatchDto } from './dto/update-match.dto';
import { MatchesRepository } from './matches.repository';
import type { DetailedMatch, ListedMatch } from './types';

@Injectable()
export class MatchesService {
  constructor(
    private readonly matchesRepository: MatchesRepository,
    private readonly usersService: UsersService,
  ) {}

  async findUpcoming(firebaseUid: string) {
    const user = await this.usersService.findByFirebaseUid(firebaseUid);
    const matches = await this.matchesRepository.findUpcoming(user.id);

    return matches
      .filter((match) => match._count.participants < match.capacity)
      .map((match) => this.toListResponse(match, user.id));
  }

  async findOne(firebaseUid: string, id: string) {
    const user = await this.usersService.findByFirebaseUid(firebaseUid);
    const match = await this.matchesRepository.findDetailById(id, user.id);

    if (!match) {
      throw new NotFoundException(`Match with id ${id} was not found`);
    }

    return this.toDetailResponse(match, user.id);
  }

  async findMine(firebaseUid: string) {
    const user = await this.usersService.findByFirebaseUid(firebaseUid);

    const [organizing, playing, played, requested] = await Promise.all([
      this.matchesRepository.findOrganizedBy(user.id),
      this.matchesRepository.findJoinedBy(user.id),
      this.matchesRepository.findPlayedBy(user.id),
      this.matchesRepository.findRequestedBy(user.id),
    ]);

    return {
      organizing: organizing.map((match) =>
        this.toListResponse(match, user.id),
      ),
      playing: playing.map((match) => this.toListResponse(match, user.id)),
      played: played.map((match) => this.toListResponse(match, user.id)),
      requested: requested.map((match) => this.toListResponse(match, user.id)),
    };
  }

  async findPlayedByUser(firebaseUid: string, userId: string) {
    const viewer = await this.usersService.findByFirebaseUid(firebaseUid);

    await this.usersService.findOne(userId);

    const matches = await this.matchesRepository.findPlayedBy(
      userId,
      viewer.id,
    );

    return matches.map((match) => this.toListResponse(match, viewer.id));
  }

  async create(firebaseUid: string, createMatchDto: CreateMatchDto) {
    this.assertFutureDate(createMatchDto.date);

    const organizer = await this.usersService.findByFirebaseUid(firebaseUid);

    try {
      const match = await this.matchesRepository.create(
        organizer.id,
        createMatchDto,
      );

      return this.toListResponse(match, organizer.id);
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  async update(
    firebaseUid: string,
    id: string,
    updateMatchDto: UpdateMatchDto,
  ) {
    const user = await this.usersService.findByFirebaseUid(firebaseUid);
    const match = await this.assertIsOrganizer(user.id, id);

    this.assertNotPlayed(match.date);

    if (updateMatchDto.date) {
      this.assertFutureDate(updateMatchDto.date);
    }

    if (
      updateMatchDto.capacity !== undefined &&
      updateMatchDto.capacity < match._count.participants
    ) {
      throw new BadRequestException(
        `capacity cannot be lower than the ${match._count.participants} participants already joined`,
      );
    }

    try {
      const updated = await this.matchesRepository.update(
        id,
        user.id,
        updateMatchDto,
      );

      return this.toListResponse(updated, user.id);
    } catch (error) {
      throw this.toHttpException(error, id);
    }
  }

  async remove(firebaseUid: string, id: string) {
    const user = await this.usersService.findByFirebaseUid(firebaseUid);
    await this.assertIsOrganizer(user.id, id);

    try {
      return await this.matchesRepository.remove(id);
    } catch (error) {
      throw this.toHttpException(error, id);
    }
  }

  async leave(firebaseUid: string, matchId: string) {
    const user = await this.usersService.findByFirebaseUid(firebaseUid);
    const match = await this.getOrFail(matchId, user.id);

    this.assertNotPlayed(match.date);

    if (match.participants.length === 0) {
      throw new NotFoundException('You are not joined to this match');
    }

    try {
      await this.matchesRepository.removeParticipant(matchId, user.id);
    } catch (error) {
      throw this.toHttpException(error, matchId);
    }
  }

  private async getOrFail(id: string, userId: string) {
    const match = await this.matchesRepository.findById(id, userId);

    if (!match) {
      throw new NotFoundException(`Match with id ${id} was not found`);
    }

    return match;
  }

  private toListResponse<T extends ListedMatch>(match: T, userId: string) {
    const { _count, participants, joinRequests, ratings, ...rest } = match;
    const isJoined = participants.length > 0;

    return {
      ...rest,
      joinedCount: _count.participants,
      isJoined,
      myJoinRequest: joinRequests[0]?.status ?? null,
      pendingRequests: rest.organizerId === userId ? _count.joinRequests : null,
      ratingPending: this.toRatingPending({
        date: rest.date,
        isPlayer: rest.organizerId === userId || isJoined,
        participants: _count.participants,
        ratings: ratings.length,
      }),
    };
  }

  private toDetailResponse<T extends DetailedMatch>(match: T, userId: string) {
    const { _count, participants, joinRequests, ratings, ...rest } = match;
    const isJoined = participants.some(({ user }) => user.id === userId);

    return {
      ...rest,
      joinedCount: _count.participants,
      isJoined,
      myJoinRequest: joinRequests[0]?.status ?? null,
      pendingRequests: rest.organizerId === userId ? _count.joinRequests : null,
      ratingPending: this.toRatingPending({
        date: rest.date,
        isPlayer: rest.organizerId === userId || isJoined,
        participants: _count.participants,
        ratings: ratings.length,
      }),
      participants: participants.map(({ user }) => user),
    };
  }

  private toRatingPending(input: {
    date: Date;
    isPlayer: boolean;
    participants: number;
    ratings: number;
  }): boolean | null {
    const played = input.date.getTime() <= Date.now();

    if (!played || !input.isPlayer) {
      return null;
    }

    return input.participants >= 1 && input.ratings === 0;
  }

  private assertFutureDate(date: Date) {
    if (date.getTime() <= Date.now()) {
      throw new BadRequestException('date must be in the future');
    }
  }

  private assertNotPlayed(date: Date) {
    if (date.getTime() <= Date.now()) {
      throw new BadRequestException('The match has already been played');
    }
  }

  private async assertIsOrganizer(userId: string, matchId: string) {
    const match = await this.getOrFail(matchId, userId);

    if (match.organizerId !== userId) {
      throw new ForbiddenException('Only the organizer can modify this match');
    }

    return match;
  }

  private toHttpException(error: unknown, reference?: string): Error {
    return toPrismaHttpException(error, {
      P2002: 'You already joined this match',
      P2003: 'sportId does not match a known sport',
      P2025: reference
        ? `Match with id ${reference} was not found`
        : 'Match was not found',
    });
  }
}
