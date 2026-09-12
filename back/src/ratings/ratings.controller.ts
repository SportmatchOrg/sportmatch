import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/current-user.decorator';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';
import type { FirebaseUser } from '../auth/types';
import { RatingsService } from './ratings.service';

@UseGuards(FirebaseAuthGuard)
@Controller('partidos/:matchId/ratings')
export class RatingsController {
  constructor(private readonly ratingsService: RatingsService) {}

  @Get('pending')
  findPending(
    @CurrentUser() user: FirebaseUser,
    @Param('matchId') matchId: string,
  ) {
    return this.ratingsService.findPending(user.uid, matchId);
  }
}
