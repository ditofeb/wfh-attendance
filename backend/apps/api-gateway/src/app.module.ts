import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { ClientsModule, ClientsProviderAsyncOptions, Transport } from '@nestjs/microservices';
import { SERVICES } from '@app/common';
import { AuthController } from './auth/auth.controller';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { RolesGuard } from './auth/guards/roles.guard';
import { HealthController } from './health/health.controller';
import { DepartmentsController } from './departments/departments.controller';
import { EmployeesController } from './employees/employees.controller';
import { MulterModule } from '@nestjs/platform-express';
import { attendancePhotoMulterOptions } from './attendances/attendance-photo.upload';
import { AttendancesController } from './attendances/attendances.controller';

const tcpClient = (name: string, envPrefix: string): ClientsProviderAsyncOptions => ({
  name,
  inject: [ConfigService],
  useFactory: (config: ConfigService) => ({
    transport: Transport.TCP,
    options: {
      host: config.get<string>(`${envPrefix}_HOST`, '127.0.0.1'),
      port: Number(config.get(`${envPrefix}_PORT`)),
    },
  }),
});

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ClientsModule.registerAsync([
      tcpClient(SERVICES.AUTH, 'AUTH_SERVICE'),
      tcpClient(SERVICES.EMPLOYEE, 'EMPLOYEE_SERVICE'),
      tcpClient(SERVICES.ATTENDANCE, 'ATTENDANCE_SERVICE'),
    ]),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>('JWT_SECRET'),
      }),
    }),

    MulterModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => attendancePhotoMulterOptions(config),
    }),
  ],
  controllers: [
    HealthController, AuthController, EmployeesController, DepartmentsController, AttendancesController,
  ],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
