import {
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../auth/current-user.decorator';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';
import type { FirebaseUser } from '../auth/types';
import { JoinRequestsService } from './join-requests.service';

@UseGuards(FirebaseAuthGuard)
@Controller('partidos/:matchId/join-requests')
export class JoinRequestsController {
  constructor(private readonly joinRequestsService: JoinRequestsService) {}

  @Post()
  create(@CurrentUser() user: FirebaseUser, @Param('matchId') matchId: string) {
    return this.joinRequestsService.create(user.uid, matchId);
  }

  @Delete('me')
  @HttpCode(HttpStatus.NO_CONTENT)
  cancel(@CurrentUser() user: FirebaseUser, @Param('matchId') matchId: string) {
    return this.joinRequestsService.cancel(user.uid, matchId);
  }
}
