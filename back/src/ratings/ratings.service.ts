import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { CreateNotificationInput } from '../notifications/notifications.repository';
import { NotificationsService } from '../notifications/notifications.service';
import type { PublicUser } from '../users/types';
import { UsersService } from '../users/users.service';
import { toPrismaHttpException } from '../utils/prisma/to-http-exception';
import { assignRatingTargets } from '../utils/ratings/assign-rating-targets';
import { isRatingWindowOpen } from '../utils/ratings/rating-window';
import type { CreateRatingsDto, RatingItemDto } from './dto/create-ratings.dto';
import { RatingsRepository } from './ratings.repository';

@Injectable()
export class RatingsService {
  constructor(
    private readonly ratingsRepository: RatingsRepository,
    private readonly usersService: UsersService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async findPending(firebaseUid: string, matchId: string) {
    const { user, targets, otherPlayers } = await this.getAssignment(
      firebaseUid,
      matchId,
    );
    const alreadySubmitted = await this.hasSubmitted(matchId, user.id);

    return {
      matchId,
      targets: alreadySubmitted ? [] : targets,
      players: alreadySubmitted ? [] : otherPlayers,
    };
  }

  async create(
    firebaseUid: string,
    matchId: string,
    createRatingsDto: CreateRatingsDto,
  ) {
    const { user, targets, otherPlayers } = await this.getAssignment(
      firebaseUid,
      matchId,
    );

    if (await this.hasSubmitted(matchId, user.id)) {
      throw new ConflictException('You already rated this match');
    }

    const { ratings, noShowUserIds = [] } = createRatingsDto;
    const noShowIds = new Set(noShowUserIds);

    this.assertNoShowsArePlayers(noShowIds, otherPlayers);
    this.assertMatchesAssignment(
      ratings,
      targets.filter(({ id }) => !noShowIds.has(id)),
    );

    const reportsNoShows = noShowUserIds.length > 0;
    const [confirmedBefore, suspensionsBefore] = reportsNoShows
      ? await Promise.all([
          this.findConfirmedNoShows(matchId),
          this.usersService.getSuspensions(noShowUserIds),
        ])
      : [new Set<string>(), new Map<string, Date | null>()];

    try {
      const { count, noShowCount } =
        await this.ratingsRepository.createSubmission(
          matchId,
          user.id,
          ratings,
          noShowUserIds,
        );

      if (reportsNoShows) {
        await this.notifyNewNoShows(
          matchId,
          confirmedBefore,
          suspensionsBefore,
        );
      }

      return { matchId, count, noShowCount };
    } catch (error) {
      throw toPrismaHttpException(error, {
        P2002: 'You already rated this match',
      });
    }
  }

  private async findConfirmedNoShows(matchId: string): Promise<Set<string>> {
    const noShowsByMatch = await this.usersService.findConfirmedNoShows({
      matchIds: [matchId],
    });

    return new Set(noShowsByMatch.get(matchId)?.keys());
  }

  private async notifyNewNoShows(
    matchId: string,
    confirmedBefore: Set<string>,
    suspensionsBefore: Map<string, Date | null>,
  ) {
    const confirmedAfter = await this.findConfirmedNoShows(matchId);
    const newNoShowIds = [...confirmedAfter].filter(
      (userId) => !confirmedBefore.has(userId),
    );
    const suspensionsAfter =
      await this.usersService.getSuspensions(newNoShowIds);

    const noShowNotifications = newNoShowIds.map(
      (userId): CreateNotificationInput => ({
        userId,
        type: 'NO_SHOW_CONFIRMED',
        matchId,
      }),
    );

    const suspensionNotifications = newNoShowIds.flatMap(
      (userId): CreateNotificationInput[] => {
        const until = suspensionsAfter.get(userId);

        return suspensionsBefore.get(userId) || !until
          ? []
          : [
              {
                userId,
                type: 'USER_SUSPENDED',
                payload: { until: until.toISOString() },
              },
            ];
      },
    );

    await this.notificationsService.notifyMany([
      ...noShowNotifications,
      ...suspensionNotifications,
    ]);
  }

  private async hasSubmitted(matchId: string, userId: string) {
    const submitted = await this.ratingsRepository.countSubmittedBy(
      matchId,
      userId,
    );

    return submitted > 0;
  }

  private async getAssignment(firebaseUid: string, matchId: string) {
    const user = await this.usersService.findByFirebaseUid(firebaseUid);
    const match = await this.ratingsRepository.findMatchWithPlayers(matchId);

    if (!match) {
      throw new NotFoundException(`Match with id ${matchId} was not found`);
    }

    if (match.status === 'CANCELED') {
      throw new BadRequestException('The match is canceled');
    }

    if (match.date.getTime() > Date.now()) {
      throw new BadRequestException('The match has not been played yet');
    }

    if (!isRatingWindowOpen(match.date)) {
      throw new BadRequestException('The rating window is closed');
    }

    const players: PublicUser[] = [
      match.organizer,
      ...match.participants.map(({ user: participant }) => participant),
    ];

    if (!players.some((player) => player.id === user.id)) {
      throw new ForbiddenException('You are not a player of this match');
    }

    const playersById = new Map(players.map((player) => [player.id, player]));

    const targets = assignRatingTargets(
      matchId,
      players.map(({ id }) => id),
      user.id,
    )
      .map((id) => playersById.get(id))
      .filter((player): player is PublicUser => player !== undefined);

    const otherPlayers = players.filter(({ id }) => id !== user.id);

    return { user, targets, otherPlayers };
  }

  private assertNoShowsArePlayers(
    noShowIds: Set<string>,
    otherPlayers: PublicUser[],
  ) {
    const otherPlayerIds = new Set(otherPlayers.map(({ id }) => id));

    if ([...noShowIds].some((id) => !otherPlayerIds.has(id))) {
      throw new BadRequestException(
        'No-shows must be other players of this match',
      );
    }
  }

  private assertMatchesAssignment(
    ratings: RatingItemDto[],
    targets: PublicUser[],
  ) {
    const submitted = new Set(ratings.map(({ ratedUserId }) => ratedUserId));

    const isExactMatch =
      submitted.size === ratings.length &&
      submitted.size === targets.length &&
      targets.every(({ id }) => submitted.has(id));

    if (!isExactMatch) {
      throw new BadRequestException('Ratings must match the assigned players');
    }
  }
}
