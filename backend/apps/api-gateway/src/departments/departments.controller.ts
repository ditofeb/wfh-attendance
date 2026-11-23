import { Controller, Get, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { DEPARTMENT_PATTERNS, SERVICES } from '@app/common';
import type { Department } from '@app/common';
import { callService } from '../common/rpc.util';

@Controller('departments')
export class DepartmentsController {
  constructor(@Inject(SERVICES.EMPLOYEE) private readonly employeeClient: ClientProxy) {}

  @Get()
  findAll() {
    return callService<Department[]>(this.employeeClient, DEPARTMENT_PATTERNS.FIND_ALL);
  }
}
