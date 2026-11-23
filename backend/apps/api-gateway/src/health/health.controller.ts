import { Controller, Get, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, timeout } from 'rxjs';
import { ATTENDANCE_PATTERNS, AUTH_PATTERNS, EMPLOYEE_PATTERNS, SERVICES } from '@app/common';
import { Public } from '../auth/decorators/public.decorator';

@Public()
@Controller('health')
export class HealthController {
  constructor(
    @Inject(SERVICES.AUTH) private readonly authClient: ClientProxy,
    @Inject(SERVICES.EMPLOYEE) private readonly employeeClient: ClientProxy,
    @Inject(SERVICES.ATTENDANCE) private readonly attendanceClient: ClientProxy,
  ) {}

  @Get()
  async check() {
    const [auth, employee, attendance] = await Promise.all([
      this.ping(this.authClient, AUTH_PATTERNS.PING),
      this.ping(this.employeeClient, EMPLOYEE_PATTERNS.PING),
      this.ping(this.attendanceClient, ATTENDANCE_PATTERNS.PING),
    ]);
    return { gateway: 'ok', services: { auth, employee, attendance } };
  }

  private async ping(client: ClientProxy, pattern: string) {
    try {
      return await firstValueFrom(client.send(pattern, {}).pipe(timeout(2000)));
    } catch {
      return { status: 'down' };
    }
  }
}
