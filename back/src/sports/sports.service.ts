import { Injectable } from '@nestjs/common';
import { SportsRepository } from './sports.repository';

@Injectable()
export class SportsService {
  constructor(private readonly sportsRepository: SportsRepository) {}

  findAll() {
    return this.sportsRepository.findAll();
  }
}
