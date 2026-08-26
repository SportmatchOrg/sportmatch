import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '../generated/prisma/client';
import { UsersService } from '../users/users.service';
import { CreatePartidoDto } from './dto/create-partido.dto';
import { UpdatePartidoDto } from './dto/update-partido.dto';
import { PartidosRepository } from './partidos.repository';

@Injectable()
export class PartidosService {
  constructor(
    private readonly partidosRepository: PartidosRepository,
    private readonly usersService: UsersService,
  ) {}

  findUpcoming() {
    return this.partidosRepository.findUpcoming();
  }

  async findOne(id: string) {
    const partido = await this.partidosRepository.findById(id);

    if (!partido) {
      throw new NotFoundException(`Partido with id ${id} was not found`);
    }

    return partido;
  }

  async create(firebaseUid: string, createPartidoDto: CreatePartidoDto) {
    this.assertFutureDate(createPartidoDto.fecha);

    const organizador = await this.usersService.findByFirebaseUid(firebaseUid);

    try {
      return await this.partidosRepository.create(
        organizador.id,
        createPartidoDto,
      );
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  async update(
    firebaseUid: string,
    id: string,
    updatePartidoDto: UpdatePartidoDto,
  ) {
    if (updatePartidoDto.fecha) {
      this.assertFutureDate(updatePartidoDto.fecha);
    }

    await this.assertIsOrganizer(firebaseUid, id);

    try {
      return await this.partidosRepository.update(id, updatePartidoDto);
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  async remove(firebaseUid: string, id: string) {
    await this.assertIsOrganizer(firebaseUid, id);

    try {
      return await this.partidosRepository.remove(id);
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  private assertFutureDate(fecha: Date) {
    if (fecha.getTime() <= Date.now()) {
      throw new BadRequestException('fecha must be in the future');
    }
  }

  private async assertIsOrganizer(firebaseUid: string, partidoId: string) {
    const partido = await this.findOne(partidoId);
    const user = await this.usersService.findByFirebaseUid(firebaseUid);

    if (partido.organizadorId !== user.id) {
      throw new ForbiddenException(
        'Only the organizer can modify this partido',
      );
    }
  }

  private toHttpException(error: unknown): Error {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2003') {
        return new BadRequestException(
          'deporteId does not match a known sport',
        );
      }

      if (error.code === 'P2025') {
        return new NotFoundException('Partido was not found');
      }
    }

    return error instanceof Error ? error : new Error(String(error));
  }
}
