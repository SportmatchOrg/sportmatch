import { Controller, Get, Param } from '@nestjs/common';
import { MatchesService } from './matches.service';

@Controller('public/matches')
export class PublicMatchesController {
  constructor(private readonly matchesService: MatchesService) {}

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.matchesService.findPublic(id);
  }
}
