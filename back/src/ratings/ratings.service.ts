import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { PublicUser } from '../users/types';
import { UsersService } from '../users/users.service';
import { assignRatingTargets } from '../utils/ratings/assign-rating-targets';
import { RatingsRepository } from './ratings.repository';

@Injectable()
export class RatingsService {
  constructor(
    private readonly ratingsRepository: RatingsRepository,
    private readonly usersService: UsersService,
  ) {}

  async findPending(firebaseUid: string, matchId: string) {
    const user = await this.usersService.findByFirebaseUid(firebaseUid);
    const match = await this.ratingsRepository.findMatchWithPlayers(matchId);

    if (!match) {
      throw new NotFoundException(`Partido with id ${matchId} was not found`);
    }

    if (match.fecha.getTime() > Date.now()) {
      throw new BadRequestException('The match has not been played yet');
    }

    const players: PublicUser[] = [
      match.organizador,
      ...match.participantes.map(({ usuario }) => usuario),
    ];

    if (!players.some((player) => player.id === user.id)) {
      throw new ForbiddenException('You are not a player of this match');
    }

    const alreadyRated = await this.ratingsRepository.countGivenBy(
      matchId,
      user.id,
    );

    if (alreadyRated > 0) {
      return { matchId, targets: [] };
    }

    const playersById = new Map(players.map((player) => [player.id, player]));

    const targets = assignRatingTargets(
      matchId,
      players.map(({ id }) => id),
      user.id,
    )
      .map((id) => playersById.get(id))
      .filter((player): player is PublicUser => player !== undefined);

    return { matchId, targets };
  }
}
