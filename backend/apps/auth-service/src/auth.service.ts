import { HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { compare } from 'bcryptjs';
import { Repository } from 'typeorm';
import { Employee, JwtPayload, LoginDto, LoginResponse, rpcError } from '@app/common';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Employee) private readonly employees: Repository<Employee>,
    private readonly jwt: JwtService,
  ) {}

  async login(dto: LoginDto): Promise<LoginResponse> {
    const email = dto.email.trim().toLowerCase();

    const employee = await this.employees
      .createQueryBuilder('e')
      .addSelect('e.passwordHash')
      .where('e.email = :email', { email })
      .getOne();

    const passwordOk = employee ? await compare(dto.password, employee.passwordHash) : false;

    if (!employee || !passwordOk) {
      throw rpcError(HttpStatus.UNAUTHORIZED, 'Invalid email or password');
    }

    if (!employee.isActive) {
      throw rpcError(HttpStatus.FORBIDDEN, 'Account is inactive. Please contact HR.');
    }

    const payload: JwtPayload = {
      sub: employee.id,
      email: employee.email,
      name: employee.name,
      role: employee.role,
      employeeCode: employee.employeeCode,
    };

    return {
      accessToken: await this.jwt.signAsync(payload),
      user: {
        id: employee.id,
        employeeCode: employee.employeeCode,
        name: employee.name,
        email: employee.email,
        role: employee.role,
      },
    };
  }
}
