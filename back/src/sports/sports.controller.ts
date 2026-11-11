import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';
import { SportsService } from './sports.service';

@ApiTags('Deportes')
@ApiBearerAuth()
@UseGuards(FirebaseAuthGuard)
@Controller('sports')
export class SportsController {
  constructor(private readonly sportsService: SportsService) {}

  @Get()
  findAll() {
    return this.sportsService.findAll();
  }
}
