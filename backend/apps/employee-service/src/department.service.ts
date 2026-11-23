import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Department } from '@app/common';

@Injectable()
export class DepartmentService {
  constructor(@InjectRepository(Department) private readonly departments: Repository<Department>) {}

  findAll(): Promise<Department[]> {
    return this.departments.find({ order: { name: 'ASC' } });
  }
}
