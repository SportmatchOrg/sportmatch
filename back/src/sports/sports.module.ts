import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { SportsController } from './sports.controller';
import { SportsRepository } from './sports.repository';
import { SportsService } from './sports.service';

@Module({
  imports: [UsersModule],
  controllers: [SportsController],
  providers: [SportsService, SportsRepository],
  exports: [SportsService],
})
export class SportsModule {}
