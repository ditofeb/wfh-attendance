import {
  Body, Controller, Get, HttpCode, HttpStatus, Inject, Post, UnauthorizedException,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { AUTH_PATTERNS, EMPLOYEE_PATTERNS, LoginDto, SERVICES } from '@app/common';
import type { Employee, FindEmployeePayload, LoginResponse, UserProfile } from '@app/common';
import { callService } from '../common/rpc.util';
import { CurrentUser } from './decorators/current-user.decorator';
import { Public } from './decorators/public.decorator';

@Controller('auth')
export class AuthController {
  constructor(
    @Inject(SERVICES.AUTH) private readonly authClient: ClientProxy,
    @Inject(SERVICES.EMPLOYEE) private readonly employeeClient: ClientProxy,
  ) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() dto: LoginDto) {
    return callService<LoginResponse>(this.authClient, AUTH_PATTERNS.LOGIN, dto);
  }

  @Get('me')
  async me(@CurrentUser('sub') id: string): Promise<UserProfile> {
    const payload: FindEmployeePayload = { id };
    const employee = await callService<Employee>(this.employeeClient, EMPLOYEE_PATTERNS.FIND_ONE, payload);

    if (!employee.isActive) {
      throw new UnauthorizedException('Account is inactive. Please contact HR.');
    }

    return {
      id: employee.id,
      employeeCode: employee.employeeCode,
      name: employee.name,
      email: employee.email,
      role: employee.role,
      position: employee.position,
      department: employee.department?.name ?? null,
    };
  }
}
