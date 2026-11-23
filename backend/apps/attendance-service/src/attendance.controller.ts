import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ATTENDANCE_PATTERNS, AttendanceQueryDto } from '@app/common';
import type {
  ClockOutPayload, FindMyAttendancePayload, FindTodayAttendancePayload, SubmitAttendancePayload,
} from '@app/common';
import { AttendanceService } from './attendance.service';

@Controller()
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @MessagePattern(ATTENDANCE_PATTERNS.PING)
  ping() {
    return { service: 'attendance-service', status: 'ok', time: new Date().toISOString() };
  }

  @MessagePattern(ATTENDANCE_PATTERNS.SUBMIT)
  submit(@Payload() payload: SubmitAttendancePayload) {
    return this.attendanceService.submit(payload);
  }

  @MessagePattern(ATTENDANCE_PATTERNS.CLOCK_OUT)
  clockOut(@Payload() payload: ClockOutPayload) {
    return this.attendanceService.clockOut(payload);
  }

  @MessagePattern(ATTENDANCE_PATTERNS.FIND_TODAY)
  findToday(@Payload() { employeeId }: FindTodayAttendancePayload) {
    return this.attendanceService.findToday(employeeId);
  }

  @MessagePattern(ATTENDANCE_PATTERNS.FIND_MINE)
  findMine(@Payload() { employeeId, query }: FindMyAttendancePayload) {
    return this.attendanceService.findMine(employeeId, query);
  }

  @MessagePattern(ATTENDANCE_PATTERNS.FIND_ALL)
  findAll(@Payload() query: AttendanceQueryDto) {
    return this.attendanceService.findAll(query);
  }
}
