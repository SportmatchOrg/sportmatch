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
import { CreateMatchDto } from './dto/create-match.dto';
import { UpdateMatchDto } from './dto/update-match.dto';
import { MatchesService } from './matches.service';

@UseGuards(FirebaseAuthGuard)
@Controller('matches')
export class MatchesController {
  constructor(private readonly matchesService: MatchesService) {}

  @Post()
  create(
    @CurrentUser() user: FirebaseUser,
    @Body() createMatchDto: CreateMatchDto,
  ) {
    return this.matchesService.create(user.uid, createMatchDto);
  }

  @Delete(':id/participants/me')
  @HttpCode(HttpStatus.NO_CONTENT)
  leave(@CurrentUser() user: FirebaseUser, @Param('id') id: string) {
    return this.matchesService.leave(user.uid, id);
  }

  @Get()
  findAll(@CurrentUser() user: FirebaseUser) {
    return this.matchesService.findUpcoming(user.uid);
  }

  @Get('mine')
  findMine(@CurrentUser() user: FirebaseUser) {
    return this.matchesService.findMine(user.uid);
  }

  @Get('played-by/:userId')
  findPlayedByUser(
    @CurrentUser() user: FirebaseUser,
    @Param('userId') userId: string,
  ) {
    return this.matchesService.findPlayedByUser(user.uid, userId);
  }

  @Get(':id')
  findOne(@CurrentUser() user: FirebaseUser, @Param('id') id: string) {
    return this.matchesService.findOne(user.uid, id);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: FirebaseUser,
    @Param('id') id: string,
    @Body() updateMatchDto: UpdateMatchDto,
  ) {
    return this.matchesService.update(user.uid, id, updateMatchDto);
  }

  @Delete(':id')
  remove(@CurrentUser() user: FirebaseUser, @Param('id') id: string) {
    return this.matchesService.remove(user.uid, id);
  }
}
