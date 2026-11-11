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
import { CreateImageDto } from './dto/create-image.dto';
import { CreateMatchDraftDto } from './dto/create-match-draft.dto';
import { ImageGenerationService } from './image-generation.service';
import { MatchDraftService } from './match-draft.service';

@ApiTags('Asistente')
@ApiBearerAuth()
@UseGuards(FirebaseAuthGuard)
@Controller('ai')
export class AiController {
  constructor(
    private readonly matchDraftService: MatchDraftService,
    private readonly imageGenerationService: ImageGenerationService,
  ) {}

  @Post('match-draft')
  @HttpCode(HttpStatus.OK)
  createMatchDraft(
    @CurrentUser() user: FirebaseUser,
    @Body() createMatchDraftDto: CreateMatchDraftDto,
  ) {
    return this.matchDraftService.create(user.uid, createMatchDraftDto);
  }

  @Post('images')
  @HttpCode(HttpStatus.OK)
  createImage(
    @CurrentUser() user: FirebaseUser,
    @Body() createImageDto: CreateImageDto,
  ) {
    return this.imageGenerationService.create(user.uid, createImageDto);
  }
}
