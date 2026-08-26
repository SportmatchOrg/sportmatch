import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePartidoDto } from './dto/create-partido.dto';
import { UpdatePartidoDto } from './dto/update-partido.dto';

const ORGANIZADOR_PUBLICO = {
  select: { id: true, nombre: true, fotoUrl: true },
} as const;

@Injectable()
export class PartidosRepository {
  constructor(private readonly prisma: PrismaService) {}

  findUpcoming() {
    return this.prisma.partido.findMany({
      where: { fecha: { gte: new Date() } },
      orderBy: { fecha: 'asc' },
      include: { organizador: ORGANIZADOR_PUBLICO },
    });
  }

  findById(id: string) {
    return this.prisma.partido.findUnique({
      where: { id },
      include: { organizador: ORGANIZADOR_PUBLICO },
    });
  }

  create(organizadorId: string, data: CreatePartidoDto) {
    return this.prisma.partido.create({
      data: { ...data, organizadorId },
      include: { organizador: ORGANIZADOR_PUBLICO },
    });
  }

  update(id: string, data: UpdatePartidoDto) {
    return this.prisma.partido.update({
      where: { id },
      data,
      include: { organizador: ORGANIZADOR_PUBLICO },
    });
  }

  remove(id: string) {
    return this.prisma.partido.delete({ where: { id } });
  }
}
