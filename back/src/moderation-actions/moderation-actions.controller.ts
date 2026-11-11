import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AdminGuard } from '../auth/admin.guard';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';
import { ModerationActionsService } from './moderation-actions.service';

@ApiTags('Administración')
@ApiBearerAuth()
@UseGuards(FirebaseAuthGuard, AdminGuard)
@Controller('admin/users/:id/moderation')
export class ModerationActionsController {
  constructor(
    private readonly moderationActionsService: ModerationActionsService,
  ) {}

  @Get()
  findAll(@Param('id') id: string) {
    return this.moderationActionsService.findAllByUser(id);
  }
}
