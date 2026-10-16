import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { ListReportsQueryDto } from './dto/list-reports-query.dto';
import { ResolveReportDto } from './dto/resolve-report.dto';
import { ReportsRepository } from './reports.repository';

@Injectable()
export class AdminReportsService {
  constructor(
    private readonly reportsRepository: ReportsRepository,
    private readonly usersService: UsersService,
  ) {}

  findAll({ status }: ListReportsQueryDto) {
    return this.reportsRepository.findAllByStatus(status);
  }

  async resolve(firebaseUid: string, id: string, { status }: ResolveReportDto) {
    const admin = await this.usersService.findByFirebaseUid(firebaseUid);
    const report = await this.reportsRepository.findById(id);

    if (!report) {
      throw new NotFoundException(`Report with id ${id} was not found`);
    }

    if (report.reportedUserId === admin.id) {
      throw new ForbiddenException(
        'You cannot resolve a report made against yourself',
      );
    }

    if (!(await this.reportsRepository.resolveOpen(id, status, admin.id))) {
      throw new ConflictException('Only open reports can be resolved');
    }

    return this.reportsRepository.findWithDetailsById(id);
  }
}
