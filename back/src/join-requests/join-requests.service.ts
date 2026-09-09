import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '../generated/prisma/client';
import { UsersService } from '../users/users.service';
import { JoinRequestsRepository } from './join-requests.repository';

@Injectable()
export class JoinRequestsService {
  constructor(
    private readonly joinRequestsRepository: JoinRequestsRepository,
    private readonly usersService: UsersService,
  ) {}

  async create(firebaseUid: string, matchId: string) {
    const user = await this.usersService.findByFirebaseUid(firebaseUid);
    const match = await this.joinRequestsRepository.findMatchById(
      matchId,
      user.id,
    );

    if (!match) {
      throw new NotFoundException(`Partido with id ${matchId} was not found`);
    }

    if (match.organizadorId === user.id) {
      throw new BadRequestException('The organizer cannot request to join');
    }

    this.assertNotPlayed(match.fecha);

    if (match.participantes.length > 0) {
      throw new ConflictException('You already joined this partido');
    }

    if (match._count.participantes >= match.cupo) {
      throw new ConflictException('The partido is full');
    }

    const existingRequest =
      await this.joinRequestsRepository.findByMatchAndUser(matchId, user.id);

    if (existingRequest?.status === 'PENDING') {
      throw new ConflictException('You already requested to join this partido');
    }

    try {
      if (existingRequest) {
        return await this.joinRequestsRepository.resetToPending(
          existingRequest.id,
        );
      }

      return await this.joinRequestsRepository.create(matchId, user.id);
    } catch (error) {
      throw this.toHttpException(error);
    }
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

  private assertNotPlayed(date: Date) {
    if (date.getTime() <= Date.now()) {
      throw new BadRequestException('The partido has already been played');
    }
  }

  private toHttpException(error: unknown): Error {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      return new ConflictException(
        'You already requested to join this partido',
      );
    }

    return error instanceof Error ? error : new Error(String(error));
  }
}
