import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AttendanceServiceModule } from './attendance-service.module';

async function bootstrap() {
  const app = await NestFactory.create(AttendanceServiceModule);
  const config = app.get(ConfigService);

  const host = config.get<string>('ATTENDANCE_SERVICE_HOST', '127.0.0.1');
  const port = Number(config.get('ATTENDANCE_SERVICE_PORT', 3003));

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.TCP,
    options: { host, port },
  });

  await app.startAllMicroservices();
  await app.init();
  Logger.log(`attendance-service listening on tcp://${host}:${port}`, 'Bootstrap');
}
bootstrap();
