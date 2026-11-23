import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AuthServiceModule } from './auth-service.module';

async function bootstrap() {
  const app = await NestFactory.create(AuthServiceModule);
  const config = app.get(ConfigService);

  const host = config.get<string>('AUTH_SERVICE_HOST', '127.0.0.1');
  const port = Number(config.get('AUTH_SERVICE_PORT', 3001));

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.TCP,
    options: { host, port },
  });

  await app.startAllMicroservices();
  await app.init();
  Logger.log(`auth-service listening on tcp://${host}:${port}`, 'Bootstrap');
}
bootstrap();
