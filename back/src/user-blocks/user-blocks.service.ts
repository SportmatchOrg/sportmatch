import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserRole } from '../generated/prisma/client';
import { UsersService } from '../users/users.service';
import { blockFor } from '../utils/blocks/account-block';
import { BlockUserDto } from './dto/block-user.dto';
import { UserBlocksRepository } from './user-blocks.repository';

@Injectable()
export class UserBlocksService {
  constructor(
    private readonly userBlocksRepository: UserBlocksRepository,
    private readonly usersService: UsersService,
  ) {}

  async block(
    firebaseUid: string,
    userId: string,
    { duration, reportId }: BlockUserDto,
  ) {
    const admin = await this.usersService.findByFirebaseUid(firebaseUid);
    const user = await this.getUser(userId);

    if (user.id === admin.id) {
      throw new BadRequestException('You cannot block yourself');
    }

    if (user.role === UserRole.ADMIN) {
      throw new BadRequestException('Administrators cannot be blocked');
    }

    if (reportId) {
      await this.assertReportAbout(reportId, userId);
    }

    const blocked = await this.userBlocksRepository.block(
      userId,
      blockFor(duration),
      reportId ? { reportId, reviewedById: admin.id } : undefined,
    );

    if (!blocked) {
      throw new ConflictException('Only open reports can be resolved');
    }

    return blocked;
  }

  async unblock(userId: string) {
    await this.getUser(userId);
    await this.userBlocksRepository.unblock(userId);
  }

  private async getUser(id: string) {
    const user = await this.userBlocksRepository.findUserById(id);

    if (!user) {
      throw new NotFoundException(`User with id ${id} was not found`);
    }

    return user;
  }

  private async assertReportAbout(reportId: string, userId: string) {
    const report = await this.userBlocksRepository.findReportById(reportId);

    if (!report) {
      throw new NotFoundException(`Report with id ${reportId} was not found`);
    }

    if (report.reportedUserId !== userId) {
      throw new BadRequestException('The report is not about this user');
    }
  }
}
