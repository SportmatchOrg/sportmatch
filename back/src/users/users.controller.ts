import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';
import { CompleteOnboardingDto } from './dto/complete-onboarding.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { SearchUsersQueryDto } from './dto/search-users-query.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';
import { CurrentUser } from '../auth/current-user.decorator';
import type { FirebaseUser } from '../auth/types';
import { OwnAccountGuard } from '../auth/own-account.guard';

@ApiTags('Usuarios')
@ApiBearerAuth()
@UseGuards(FirebaseAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get('me')
  me(@CurrentUser() user: FirebaseUser) {
    return this.usersService.upsertFromFirebase(user);
  }

  @Get('search')
  search(
    @CurrentUser() user: FirebaseUser,
    @Query() { q }: SearchUsersQueryDto,
  ) {
    return this.usersService.search(user.uid, q);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id/onboarding')
  @UseGuards(OwnAccountGuard)
  completeOnboarding(
    @Param('id') id: string,
    @Body() completeOnboardingDto: CompleteOnboardingDto,
  ) {
    return this.usersService.completeOnboarding(id, completeOnboardingDto);
  }

  @Patch(':id')
  @UseGuards(OwnAccountGuard)
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @UseGuards(OwnAccountGuard)
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
