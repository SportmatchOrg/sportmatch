import { Controller, Get, UseGuards } from '@nestjs/common';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';
import { SportsService } from './sports.service';

@UseGuards(FirebaseAuthGuard)
@Controller('sports')
export class SportsController {
  constructor(private readonly sportsService: SportsService) {}

  @Get()
  findAll() {
    return this.sportsService.findAll();
  }
}
