import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Attendance } from '../entities/attendance.entity';
import { Department } from '../entities/department.entity';
import { Employee } from '../entities/employee.entity';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'mysql',
        host: config.get<string>('DB_HOST'),
        port: Number(config.get('DB_PORT')),
        username: config.get<string>('DB_USER'),
        password: config.get<string>('DB_PASS'),
        database: config.get<string>('DB_NAME'),
        timezone: config.get<string>('DB_TIMEZONE', '+07:00'),
        entities: [Department, Employee, Attendance],
        synchronize: false,
        logging: ['error'],
      }),
    }),
  ],
})
export class DatabaseModule {}
