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
import { isFull } from '../utils/matches/player-count';
import { toPrismaHttpException } from '../utils/prisma/to-http-exception';
import { CreateInvitationDto } from './dto/create-invitation.dto';
import { JoinRequestsRepository } from './join-requests.repository';

type InvitableMatch = {
  status: MatchStatus;
  date: Date;
  capacity: number;
  _count: { participants: number };
};

@Injectable()
export class InvitationsService {
  constructor(
    private readonly joinRequestsRepository: JoinRequestsRepository,
    private readonly usersService: UsersService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async create(
    firebaseUid: string,
    matchId: string,
    { userId }: CreateInvitationDto,
  ) {
    const organizer = await this.usersService.findByFirebaseUid(firebaseUid);
    const match = await this.getOrganizerMatch(organizer.id, matchId, userId);

    if (userId === organizer.id) {
      throw new BadRequestException('You cannot invite yourself');
    }

    this.assertInvitable(match);

    await this.usersService.assertExists(userId);

    if (match.participants.length > 0) {
      throw new ConflictException('The player already joined this match');
    }

    const existingRequest =
      await this.joinRequestsRepository.findByMatchAndUser(matchId, userId);

    if (existingRequest?.status === 'PENDING') {
      throw new ConflictException(
        existingRequest.origin === 'INVITATION'
          ? 'The player already has a pending invitation to this match'
          : 'The player already requested to join this match',
      );
    }

    if (await this.usersService.getSuspendedUntil(userId)) {
      throw new ConflictException('The player is suspended');
    }

    const invitation = await (
      existingRequest
        ? this.joinRequestsRepository.resetToPending(
            existingRequest.id,
            'INVITATION',
          )
        : this.joinRequestsRepository.create(matchId, userId, 'INVITATION')
    ).catch((error: unknown) => {
      throw toPrismaHttpException(error, {
        P2002: 'The player already has a pending request or invitation',
      });
    });

    await this.notificationsService.notify({
      userId,
      actorId: organizer.id,
      matchId,
      type: 'INVITATION_RECEIVED',
    });

    return invitation;
  }

  async findByMatch(firebaseUid: string, matchId: string) {
    const organizer = await this.usersService.findByFirebaseUid(firebaseUid);

    await this.getOrganizerMatch(organizer.id, matchId, organizer.id);

    return this.joinRequestsRepository.findByMatch(matchId, 'INVITATION');
  }

  private async getOrganizerMatch(
    organizerId: string,
    matchId: string,
    invitedUserId: string,
  ) {
    const match = await this.joinRequestsRepository.findMatchById(
      matchId,
      invitedUserId,
    );

    if (!match) {
      throw new NotFoundException(`Match with id ${matchId} was not found`);
    }

    if (match.organizerId !== organizerId) {
      throw new ForbiddenException('Only the organizer can manage invitations');
    }

    return match;
  }

  private assertInvitable(match: InvitableMatch) {
    if (match.status === 'CANCELED') {
      throw new ConflictException('The match is canceled');
    }

    if (match.date.getTime() <= Date.now()) {
      throw new ConflictException('The match has already started');
    }

    if (isFull(match._count.participants, match.capacity)) {
      throw new ConflictException('The match is full');
    }
  }
}
