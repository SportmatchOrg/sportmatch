import {
  Body,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AdminGuard } from '../auth/admin.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';
import type { FirebaseUser } from '../auth/types';
import { BlockUserDto } from './dto/block-user.dto';
import { UserBlocksService } from './user-blocks.service';

@UseGuards(FirebaseAuthGuard, AdminGuard)
@Controller('admin/users/:id/block')
export class UserBlocksController {
  constructor(private readonly userBlocksService: UserBlocksService) {}

  @Post()
  block(
    @CurrentUser() user: FirebaseUser,
    @Param('id') id: string,
    @Body() blockUserDto: BlockUserDto,
  ) {
    return this.userBlocksService.block(user.uid, id, blockUserDto);
  }

  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  unblock(@Param('id') id: string) {
    return this.userBlocksService.unblock(id);
  }
}
