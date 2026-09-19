import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { DeportesController } from './deportes.controller';
import { DeportesRepository } from './deportes.repository';
import { DeportesService } from './deportes.service';

@Module({
  imports: [UsersModule],
  controllers: [DeportesController],
  providers: [DeportesService, DeportesRepository],
  exports: [DeportesService],
})
export class DeportesModule {}
