import { Injectable } from '@nestjs/common';
import { SportsRepository } from './sports.repository';

@Injectable()
export class SportsService {
  constructor(private readonly sportsRepository: SportsRepository) {}

  findAll() {
    return this.sportsRepository.findAll();
  }

  async findIdByName(name: string): Promise<string | null> {
    return (await this.sportsRepository.findByName(name))?.id ?? null;
  }
}
