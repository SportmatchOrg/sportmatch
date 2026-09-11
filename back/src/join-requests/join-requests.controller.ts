import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../auth/current-user.decorator';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';
import type { FirebaseUser } from '../auth/types';
import { UpdateJoinRequestDto } from './dto/update-join-request.dto';
import { JoinRequestsService } from './join-requests.service';

@UseGuards(FirebaseAuthGuard)
@Controller('partidos/:matchId/join-requests')
export class JoinRequestsController {
  constructor(private readonly joinRequestsService: JoinRequestsService) {}

  @Post()
  create(@CurrentUser() user: FirebaseUser, @Param('matchId') matchId: string) {
    return this.joinRequestsService.create(user.uid, matchId);
  }

  @Get()
  findByMatch(
    @CurrentUser() user: FirebaseUser,
    @Param('matchId') matchId: string,
  ) {
    return this.joinRequestsService.findByMatch(user.uid, matchId);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: FirebaseUser,
    @Param('matchId') matchId: string,
    @Param('id') id: string,
    @Body() updateJoinRequestDto: UpdateJoinRequestDto,
  ) {
    return this.joinRequestsService.update(
      user.uid,
      matchId,
      id,
      updateJoinRequestDto,
    );
  }

  @Delete('me')
  @HttpCode(HttpStatus.NO_CONTENT)
  cancel(@CurrentUser() user: FirebaseUser, @Param('matchId') matchId: string) {
    return this.joinRequestsService.cancel(user.uid, matchId);
  }
}
