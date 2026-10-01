import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { MatchStatus } from '../generated/prisma/client';
import { NotificationsService } from '../notifications/notifications.service';
import { UsersService } from '../users/users.service';
import { toPrismaHttpException } from '../utils/prisma/to-http-exception';
import { UpdateJoinRequestDto } from './dto/update-join-request.dto';
import { JoinRequestsRepository } from './join-requests.repository';

@Injectable()
export class JoinRequestsService {
  constructor(
    private readonly joinRequestsRepository: JoinRequestsRepository,
    private readonly usersService: UsersService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async create(firebaseUid: string, matchId: string) {
    const user = await this.usersService.findByFirebaseUid(firebaseUid);
    const match = await this.joinRequestsRepository.findMatchById(
      matchId,
      user.id,
    );

    if (!match) {
      throw new NotFoundException(`Match with id ${matchId} was not found`);
    }

    this.assertNotCanceled(match.status);

    if (match.organizerId === user.id) {
      throw new BadRequestException('The organizer cannot request to join');
    }

    this.assertNotPlayed(match.date);

    if (match.participants.length > 0) {
      throw new ConflictException('You already joined this match');
    }

    if (match._count.participants >= match.capacity) {
      throw new ConflictException('The match is full');
    }

    const existingRequest =
      await this.joinRequestsRepository.findByMatchAndUser(matchId, user.id);

    if (existingRequest?.status === 'PENDING') {
      throw new ConflictException('You already requested to join this match');
    }

    const joinRequest = await (
      existingRequest
        ? this.joinRequestsRepository.resetToPending(existingRequest.id)
        : this.joinRequestsRepository.create(matchId, user.id)
    ).catch((error: unknown) => {
      throw toPrismaHttpException(error, {
        P2002: 'You already requested to join this match',
      });
    });

    await this.notificationsService.notify({
      userId: match.organizerId,
      actorId: user.id,
      matchId,
      type: 'JOIN_REQUEST_RECEIVED',
    });

    return joinRequest;
  }

  async cancel(firebaseUid: string, matchId: string) {
    const user = await this.usersService.findByFirebaseUid(firebaseUid);
    const result = await this.joinRequestsRepository.deletePending(
      matchId,
      user.id,
    );

    if (result.count === 0) {
      throw new NotFoundException('Pending join request was not found');
    }
  }

  async findByMatch(firebaseUid: string, matchId: string) {
    await this.getOrganizerMatch(firebaseUid, matchId);

    return this.joinRequestsRepository.findByMatch(matchId);
  }

  async update(
    firebaseUid: string,
    matchId: string,
    id: string,
    updateJoinRequestDto: UpdateJoinRequestDto,
  ) {
    const { user, match } = await this.getOrganizerMatch(firebaseUid, matchId);

    this.assertNotCanceled(match.status);

    if (updateJoinRequestDto.status === 'PENDING') {
      throw new BadRequestException('A join request cannot return to pending');
    }

    const joinRequest = await this.joinRequestsRepository.findByIdAndMatch(
      id,
      matchId,
    );

    if (!joinRequest) {
      throw new NotFoundException(`Join request with id ${id} was not found`);
    }

    if (joinRequest.status !== 'PENDING') {
      throw new ConflictException('The join request is already resolved');
    }

    this.assertNotPlayed(match.date);

    try {
      if (updateJoinRequestDto.status === 'REJECTED') {
        const rejectedRequest = await this.joinRequestsRepository.reject(id);

        await this.notificationsService.notify({
          userId: joinRequest.userId,
          actorId: user.id,
          matchId,
          type: 'JOIN_REQUEST_REJECTED',
        });

        return rejectedRequest;
      }

      if (match._count.participants >= match.capacity) {
        throw new ConflictException('The match is full');
      }

      const acceptedRequest = await this.joinRequestsRepository.accept(
        id,
        matchId,
        joinRequest.userId,
      );

      if (!acceptedRequest) {
        throw new ConflictException('The match is full');
      }

      await this.notificationsService.notify({
        userId: joinRequest.userId,
        actorId: user.id,
        matchId,
        type: 'JOIN_REQUEST_ACCEPTED',
      });

      return acceptedRequest;
    } catch (error) {
      throw toPrismaHttpException(error, {
        P2002: 'The user is already a participant',
      });
    }
  }

  private assertNotPlayed(date: Date) {
    if (date.getTime() <= Date.now()) {
      throw new BadRequestException('The match has already been played');
    }
  }

  private assertNotCanceled(status: MatchStatus) {
    if (status === 'CANCELED') {
      throw new ConflictException('The match is canceled');
    }
  }

  private async getOrganizerMatch(firebaseUid: string, matchId: string) {
    const user = await this.usersService.findByFirebaseUid(firebaseUid);
    const match = await this.joinRequestsRepository.findMatchById(
      matchId,
      user.id,
    );

    if (!match) {
      throw new NotFoundException(`Match with id ${matchId} was not found`);
    }

    if (match.organizerId !== user.id) {
      throw new ForbiddenException(
        'Only the organizer can manage join requests',
      );
    }

    return { user, match };
  }
}
