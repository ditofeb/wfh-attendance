import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import {
  CreateEmployeeDto, DEPARTMENT_PATTERNS, EMPLOYEE_PATTERNS, QueryEmployeeDto,
} from '@app/common';
import type {
  DeactivateEmployeePayload, FindEmployeePayload, UpdateEmployeePayload,
} from '@app/common';
import { DepartmentService } from './department.service';
import { EmployeeService } from './employee.service';

@Controller()
export class EmployeeController {
  constructor(
    private readonly employeeService: EmployeeService,
    private readonly departmentService: DepartmentService,
  ) {}

  @MessagePattern(EMPLOYEE_PATTERNS.PING)
  ping() {
    return { service: 'employee-service', status: 'ok', time: new Date().toISOString() };
  }

  @MessagePattern(EMPLOYEE_PATTERNS.FIND_ALL)
  findAll(@Payload() query: QueryEmployeeDto) {
    return this.employeeService.findAll(query);
  }

  @MessagePattern(EMPLOYEE_PATTERNS.FIND_ONE)
  findOne(@Payload() { id }: FindEmployeePayload) {
    return this.employeeService.findOne(id);
  }

  @MessagePattern(EMPLOYEE_PATTERNS.CREATE)
  create(@Payload() dto: CreateEmployeeDto) {
    return this.employeeService.create(dto);
  }

  @MessagePattern(EMPLOYEE_PATTERNS.UPDATE)
  update(@Payload() { id, dto, requesterId }: UpdateEmployeePayload) {
    return this.employeeService.update(id, dto, requesterId);
  }

  @MessagePattern(EMPLOYEE_PATTERNS.DEACTIVATE)
  deactivate(@Payload() { id, requesterId }: DeactivateEmployeePayload) {
    return this.employeeService.deactivate(id, requesterId);
  }

  @MessagePattern(DEPARTMENT_PATTERNS.FIND_ALL)
  findAllDepartments() {
    return this.departmentService.findAll();
  }
}
