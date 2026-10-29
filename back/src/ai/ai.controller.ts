import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/current-user.decorator';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';
import type { FirebaseUser } from '../auth/types';
import { CreateMatchDraftDto } from './dto/create-match-draft.dto';
import { MatchDraftService } from './match-draft.service';

@ApiTags('Asistente')
@ApiBearerAuth()
@UseGuards(FirebaseAuthGuard)
@Controller('ai')
export class AiController {
  constructor(private readonly matchDraftService: MatchDraftService) {}

  @Post('match-draft')
  @HttpCode(HttpStatus.OK)
  createMatchDraft(
    @CurrentUser() user: FirebaseUser,
    @Body() createMatchDraftDto: CreateMatchDraftDto,
  ) {
    return this.matchDraftService.create(user.uid, createMatchDraftDto);
  }
}
