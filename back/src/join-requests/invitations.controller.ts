import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/current-user.decorator';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';
import type { FirebaseUser } from '../auth/types';
import { CreateInvitationDto } from './dto/create-invitation.dto';
import { InvitationsService } from './invitations.service';

@UseGuards(FirebaseAuthGuard)
@Controller('matches/:matchId/invitations')
export class InvitationsController {
  constructor(private readonly invitationsService: InvitationsService) {}

  @Post()
  create(
    @CurrentUser() user: FirebaseUser,
    @Param('matchId') matchId: string,
    @Body() createInvitationDto: CreateInvitationDto,
  ) {
    return this.invitationsService.create(
      user.uid,
      matchId,
      createInvitationDto,
    );
  }

  @Get()
  findByMatch(
    @CurrentUser() user: FirebaseUser,
    @Param('matchId') matchId: string,
  ) {
    return this.invitationsService.findByMatch(user.uid, matchId);
  }
}
