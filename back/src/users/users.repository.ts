import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { FirebaseUser } from '../auth/types';

const PUBLIC_USER = {
  id: true,
  nombre: true,
  fotoUrl: true,
} as const;

@Injectable()
export class UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.user.findMany({ select: PUBLIC_USER });
  }

  findById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      select: PUBLIC_USER,
    });
  }

  findByFirebaseUid(firebaseUid: string) {
    return this.prisma.user.findUnique({ where: { firebaseUid } });
  }

  create(data: CreateUserDto) {
    return this.prisma.user.create({ data });
  }

  upsertByFirebaseUid(user: FirebaseUser) {
    return this.prisma.user.upsert({
      where: { firebaseUid: user.uid },
      update: {
        email: user.email,
        nombre: user.nombre,
        fotoUrl: user.fotoUrl,
      },
      create: {
        firebaseUid: user.uid,
        email: user.email,
        nombre: user.nombre,
        fotoUrl: user.fotoUrl,
      },
    });
  }
  aggregateReceivedRatings(userId: string) {
    return this.prisma.rating.aggregate({
      where: { ratedUserId: userId },
      _avg: { score: true },
      _count: true,
    });
  }

  findPlayedDates(userId: string) {
    return this.prisma.partido.findMany({
      where: {
        fecha: { lt: new Date() },
        OR: [
          { organizadorId: userId },
          { participantes: { some: { usuarioId: userId } } },
        ],
      },
      select: { fecha: true },
    });
  }

  update(id: string, data: UpdateUserDto) {
    return this.prisma.user.update({ where: { id }, data });
  }

  remove(id: string) {
    return this.prisma.user.delete({ where: { id } });
  }
}
