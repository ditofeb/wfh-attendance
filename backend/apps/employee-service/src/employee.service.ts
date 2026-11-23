import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { hash } from 'bcryptjs';
import { Repository } from 'typeorm';
import {
  CreateEmployeeDto, Department, Employee, isDuplicateKey, paginate, QueryEmployeeDto,
  Role, rpcError, UpdateEmployeeDto,
} from '@app/common';
import type { Paginated } from '@app/common';

const BCRYPT_ROUNDS = 10;

type EmployeeChanges = Partial<
  Pick<Employee, 'name' | 'email' | 'role' | 'position' | 'departmentId' | 'phone' | 'isActive' | 'passwordHash'>
>;

@Injectable()
export class EmployeeService {
  constructor(
    @InjectRepository(Employee) private readonly employees: Repository<Employee>,
    @InjectRepository(Department) private readonly departments: Repository<Department>,
  ) {}

  async findAll(query: QueryEmployeeDto): Promise<Paginated<Employee>> {
    const { page = 1, limit = 10, search, departmentId, role, isActive } = query;

    const qb = this.employees
      .createQueryBuilder('e')
      .leftJoinAndSelect('e.department', 'd')
      .orderBy('e.createdAt', 'DESC')
      .addOrderBy('e.employeeCode', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (search) {
      qb.andWhere('(e.name LIKE :s OR e.email LIKE :s OR e.employeeCode LIKE :s)', { s: `%${search}%` });
    }
    if (departmentId) qb.andWhere('e.departmentId = :departmentId', { departmentId });
    if (role) qb.andWhere('e.role = :role', { role });
    if (isActive !== undefined) qb.andWhere('e.isActive = :isActive', { isActive });

    const [data, total] = await qb.getManyAndCount();
    return paginate(data, total, page, limit);
  }

  async findOne(id: string): Promise<Employee> {
    const employee = await this.employees.findOne({
      where: { id },
      relations: { department: true },
    });
    if (!employee) throw rpcError(HttpStatus.NOT_FOUND, 'Employee not found');
    return employee;
  }

  async create(dto: CreateEmployeeDto): Promise<Employee> {
    await this.ensureEmailAvailable(dto.email);
    if (dto.departmentId) await this.ensureDepartmentExists(dto.departmentId);

    const passwordHash = await hash(dto.password, BCRYPT_ROUNDS);

    for (let attempt = 1; attempt <= 3; attempt++) {
      const employeeCode = await this.generateEmployeeCode();
      try {
        const saved = await this.employees.save(
          this.employees.create({
            employeeCode,
            name: dto.name,
            email: dto.email,
            passwordHash,
            role: dto.role ?? Role.EMPLOYEE,
            position: dto.position ?? null,
            departmentId: dto.departmentId ?? null,
            phone: dto.phone ?? null,
            isActive: true,
          }),
        );
        return this.findOne(saved.id);
      } catch (err) {
        if (isDuplicateKey(err, 'uq_employees_code') && attempt < 3) continue;
        if (isDuplicateKey(err, 'uq_employees_email')) {
          throw rpcError(HttpStatus.CONFLICT, 'Email is already registered');
        }
        throw err;
      }
    }
    throw rpcError(HttpStatus.CONFLICT, 'Could not generate a unique employee code, please retry');
  }

  async update(id: string, dto: UpdateEmployeeDto, requesterId: string): Promise<Employee> {
    const current = await this.findOne(id);

    if (id === requesterId && (dto.isActive === false || (dto.role && dto.role !== Role.HR))) {
      throw rpcError(HttpStatus.BAD_REQUEST, 'You cannot deactivate yourself or remove your own HR role');
    }
    if (dto.email && dto.email !== current.email) await this.ensureEmailAvailable(dto.email);
    if (dto.departmentId) await this.ensureDepartmentExists(dto.departmentId);

    const { password, ...fields } = dto;
    const changes: EmployeeChanges = { ...fields };
    if (password) changes.passwordHash = await hash(password, BCRYPT_ROUNDS);

    if (Object.keys(changes).length > 0) {
      try {
        await this.employees.update(id, changes);
      } catch (err) {
        if (isDuplicateKey(err, 'uq_employees_email')) {
          throw rpcError(HttpStatus.CONFLICT, 'Email is already registered');
        }
        throw err;
      }
    }
    return this.findOne(id);
  }

  async deactivate(id: string, requesterId: string): Promise<Employee> {
    if (id === requesterId) {
      throw rpcError(HttpStatus.BAD_REQUEST, 'You cannot deactivate your own account');
    }
    const employee = await this.findOne(id);
    if (!employee.isActive) return employee;

    await this.employees.update(id, { isActive: false });
    return this.findOne(id);
  }

  private async generateEmployeeCode(): Promise<string> {
    const prefix = `EMP-${new Date().getFullYear()}-`;
    const last = await this.employees
      .createQueryBuilder('e')
      .select('e.employeeCode', 'code')
      .where('e.employeeCode LIKE :prefix', { prefix: `${prefix}%` })
      .orderBy('e.employeeCode', 'DESC')
      .limit(1)
      .getRawOne<{ code: string }>();

    const next = last ? Number(last.code.slice(prefix.length)) + 1 : 1;
    return `${prefix}${String(next).padStart(4, '0')}`;
  }

  private async ensureEmailAvailable(email: string): Promise<void> {
    const count = await this.employees.count({ where: { email } });
    if (count > 0) throw rpcError(HttpStatus.CONFLICT, 'Email is already registered');
  }

  private async ensureDepartmentExists(departmentId: string): Promise<void> {
    const count = await this.departments.count({ where: { id: departmentId } });
    if (count === 0) throw rpcError(HttpStatus.BAD_REQUEST, 'Department not found');
  }
}
