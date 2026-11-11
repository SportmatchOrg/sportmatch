import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { isSwaggerEnabled, setupSwagger } from './config/swagger';
import { NEXT_CURSOR_HEADER } from './utils/matches/match-cursor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(compression());
  app.use(cookieParser());
  app.enableCors({
    origin: process.env.FRONT_URL ?? 'http://localhost:3000',
    credentials: true,
    exposedHeaders: [NEXT_CURSOR_HEADER],
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  if (isSwaggerEnabled(app.get(ConfigService))) {
    setupSwagger(app);
  }

  await app.listen(process.env.PORT ?? 3001);
}
void bootstrap();
