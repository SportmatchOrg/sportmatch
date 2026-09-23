import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SportsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.sport.findMany({
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    });
  }
}
