import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { CreateReportDto } from './dto/create-report.dto';
import { ReportsRepository } from './reports.repository';

@Injectable()
export class ReportsService {
  constructor(
    private readonly reportsRepository: ReportsRepository,
    private readonly usersService: UsersService,
  ) {}

  async create(firebaseUid: string, createReportDto: CreateReportDto) {
    const reporter = await this.usersService.findByFirebaseUid(firebaseUid);
    const { reportedUserId, matchId } = createReportDto;

    if (reportedUserId === reporter.id) {
      throw new BadRequestException('You cannot report yourself');
    }

    if (!(await this.reportsRepository.findUserById(reportedUserId))) {
      throw new NotFoundException(
        `User with id ${reportedUserId} was not found`,
      );
    }

    if (matchId) {
      await this.assertBothPlayed(matchId, [reporter.id, reportedUserId]);
    }

    const openReport = await this.reportsRepository.findOpen(
      reporter.id,
      reportedUserId,
      matchId ?? null,
    );

    if (openReport) {
      throw new ConflictException(
        'You already have an open report for this player',
      );
    }

    return this.reportsRepository.create(reporter.id, createReportDto);
  }

  private async assertBothPlayed(matchId: string, playerIds: string[]) {
    const match = await this.reportsRepository.findMatchPlayers(
      matchId,
      playerIds,
    );

    if (!match) {
      throw new NotFoundException(`Match with id ${matchId} was not found`);
    }

    const players = new Set([
      match.organizerId,
      ...match.participants.map(({ userId }) => userId),
    ]);

    if (!playerIds.every((playerId) => players.has(playerId))) {
      throw new ForbiddenException(
        'Both players must have been part of this match',
      );
    }
  }
}
