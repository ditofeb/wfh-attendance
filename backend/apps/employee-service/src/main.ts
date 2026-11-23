import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { EmployeeServiceModule } from './employee-service.module';

async function bootstrap() {
  const app = await NestFactory.create(EmployeeServiceModule);
  const config = app.get(ConfigService);

  const host = config.get<string>('EMPLOYEE_SERVICE_HOST', '127.0.0.1');
  const port = Number(config.get('EMPLOYEE_SERVICE_PORT', 3002));

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.TCP,
    options: { host, port },
  });

  await app.startAllMicroservices();
  await app.init();
  Logger.log(`employee-service listening on tcp://${host}:${port}`, 'Bootstrap');
}
bootstrap();
