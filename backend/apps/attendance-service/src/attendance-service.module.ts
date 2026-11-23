import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Attendance, DatabaseModule, Employee } from '@app/common';
import { AttendanceController } from './attendance.controller';
import { AttendanceService } from './attendance.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    TypeOrmModule.forFeature([Attendance, Employee]),
  ],
  controllers: [AttendanceController],
  providers: [AttendanceService],
})
export class AttendanceServiceModule {}
