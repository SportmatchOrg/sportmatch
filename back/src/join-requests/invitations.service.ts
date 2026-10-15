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
import {
  RespondInvitationDto,
  type InvitationResponse,
} from './dto/respond-invitation.dto';
import { JoinRequestsRepository } from './join-requests.repository';

type OpenMatch = {
  status: MatchStatus;
  date: Date;
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

    this.assertOpen(match);

    if (isFull(match._count.participants, match.capacity)) {
      throw new ConflictException('The match is full');
    }

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

  async respond(
    firebaseUid: string,
    matchId: string,
    { status }: RespondInvitationDto,
  ) {
    const user = await this.usersService.findByFirebaseUid(firebaseUid);
    const match = await this.joinRequestsRepository.findMatchById(
      matchId,
      user.id,
    );

    if (!match) {
      throw new NotFoundException(`Match with id ${matchId} was not found`);
    }

    const invitation = await this.joinRequestsRepository.findByMatchAndUser(
      matchId,
      user.id,
    );

    if (
      invitation?.origin !== 'INVITATION' ||
      invitation.status !== 'PENDING'
    ) {
      throw new NotFoundException('Pending invitation was not found');
    }

    this.assertOpen(match);

    if (status === 'REJECTED') {
      const rejected = await this.joinRequestsRepository.reject(invitation.id);

      await this.notifyOrganizer(match.organizerId, user.id, matchId, status);

      return rejected;
    }

    await this.usersService.assertNotSuspended(user.id);

    const accepted = await this.joinRequestsRepository
      .accept(invitation.id, matchId, user.id)
      .catch((error: unknown) => {
        throw toPrismaHttpException(error, {
          P2002: 'You already joined this match',
        });
      });

    if (!accepted) {
      throw new ConflictException('The match is full');
    }

    await this.notifyOrganizer(match.organizerId, user.id, matchId, status);

    return accepted;
  }

  private notifyOrganizer(
    organizerId: string,
    invitedUserId: string,
    matchId: string,
    status: InvitationResponse,
  ) {
    return this.notificationsService.notify({
      userId: organizerId,
      actorId: invitedUserId,
      matchId,
      type:
        status === 'ACCEPTED' ? 'INVITATION_ACCEPTED' : 'INVITATION_REJECTED',
    });
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

  private assertOpen(match: OpenMatch) {
    if (match.status === 'CANCELED') {
      throw new ConflictException('The match is canceled');
    }

    if (match.date.getTime() <= Date.now()) {
      throw new ConflictException('The match has already started');
    }
  }
}
