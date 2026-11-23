import {
  Body, Controller, Delete, Get, Inject, Param, ParseUUIDPipe, Patch, Post, Query,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  CreateEmployeeDto, EMPLOYEE_PATTERNS, QueryEmployeeDto, Role, SERVICES, UpdateEmployeeDto,
} from '@app/common';
import type {
  DeactivateEmployeePayload, Employee, FindEmployeePayload, Paginated, UpdateEmployeePayload,
} from '@app/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { callService } from '../common/rpc.util';

@Roles(Role.HR)
@Controller('employees')
export class EmployeesController {
  constructor(@Inject(SERVICES.EMPLOYEE) private readonly employeeClient: ClientProxy) {}

  @Get()
  findAll(@Query() query: QueryEmployeeDto) {
    return callService<Paginated<Employee>>(this.employeeClient, EMPLOYEE_PATTERNS.FIND_ALL, query);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    const payload: FindEmployeePayload = { id };
    return callService<Employee>(this.employeeClient, EMPLOYEE_PATTERNS.FIND_ONE, payload);
  }

  @Post()
  create(@Body() dto: CreateEmployeeDto) {
    return callService<Employee>(this.employeeClient, EMPLOYEE_PATTERNS.CREATE, dto);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateEmployeeDto,
    @CurrentUser('sub') requesterId: string,
  ) {
    const payload: UpdateEmployeePayload = { id, dto, requesterId };
    return callService<Employee>(this.employeeClient, EMPLOYEE_PATTERNS.UPDATE, payload);
  }

  @Delete(':id')
  deactivate(@Param('id', ParseUUIDPipe) id: string, @CurrentUser('sub') requesterId: string) {
    const payload: DeactivateEmployeePayload = { id, requesterId };
    return callService<Employee>(this.employeeClient, EMPLOYEE_PATTERNS.DEACTIVATE, payload);
  }
}
