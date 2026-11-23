import type { UpdateEmployeeDto } from '../dto/employee/update-employee.dto';

export interface FindEmployeePayload {
  id: string;
}

export interface UpdateEmployeePayload {
  id: string;
  dto: UpdateEmployeeDto;
  requesterId: string;
}

export interface DeactivateEmployeePayload {
  id: string;
  requesterId: string;
}
