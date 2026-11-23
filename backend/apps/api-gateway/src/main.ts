import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'node:path';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const config = app.get(ConfigService);

  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
  );
  app.enableCors({ origin: config.get<string>('CORS_ORIGIN', 'http://localhost:5173') });

  app.useStaticAssets(join(process.cwd(), config.get<string>('UPLOAD_DIR', 'uploads')), {
    prefix: '/uploads/',
  });

  const port = Number(config.get('GATEWAY_PORT', 3000));
  await app.listen(port);
  Logger.log(`api-gateway running on http://localhost:${port}/api`, 'Bootstrap');
}
bootstrap();
