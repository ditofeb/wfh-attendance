import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseModule, Department, Employee } from '@app/common';
import { DepartmentService } from './department.service';
import { EmployeeController } from './employee.controller';
import { EmployeeService } from './employee.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    TypeOrmModule.forFeature([Employee, Department]),
  ],
  controllers: [EmployeeController],
  providers: [EmployeeService, DepartmentService],
})
export class EmployeeServiceModule {}
