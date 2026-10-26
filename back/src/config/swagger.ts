import type { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { KPI_KEY_HEADER, KPI_KEY_SECURITY } from '../kpis/kpi-key.guard';

export const SWAGGER_PATH = 'docs';

export const isSwaggerEnabled = (config: ConfigService): boolean =>
  config.get<string>('SWAGGER_ENABLED') === 'true';

const buildDocumentConfig = () =>
  new DocumentBuilder()
    .setTitle('Sportmatch API')
    .setDescription('API REST de Sportmatch')
    .setVersion('1.0')
    .addBearerAuth({
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      description: 'ID token de Firebase',
    })
    .addApiKey(
      { type: 'apiKey', in: 'header', name: KPI_KEY_HEADER },
      KPI_KEY_SECURITY,
    )
    .build();

export function setupSwagger(app: INestApplication): void {
  const document = SwaggerModule.createDocument(app, buildDocumentConfig());

  SwaggerModule.setup(SWAGGER_PATH, app, document, {
    swaggerOptions: { persistAuthorization: true },
  });
}
