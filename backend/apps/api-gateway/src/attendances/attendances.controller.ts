import {
  BadRequestException, Body, Controller, Get, HttpCode, HttpStatus, Inject, Post, Query, UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ATTENDANCE_PATTERNS, AttendanceHistoryQueryDto, AttendanceQueryDto, Role, SERVICES,
  SubmitAttendanceDto,
} from '@app/common';
import type {
  Attendance, ClockOutPayload, FindMyAttendancePayload, FindTodayAttendancePayload, Paginated,
  SubmitAttendancePayload, TodayAttendanceStatus,
} from '@app/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { callService } from '../common/rpc.util';
import { DeleteUploadOnErrorInterceptor } from './attendance-photo.upload';

@Controller('attendances')
export class AttendancesController {
  constructor(@Inject(SERVICES.ATTENDANCE) private readonly attendanceClient: ClientProxy) {}

  @Post()
  @UseInterceptors(FileInterceptor('photo'), DeleteUploadOnErrorInterceptor)
  submit(
    @UploadedFile() photo: Express.Multer.File | undefined,
    @Body() dto: SubmitAttendanceDto,
    @CurrentUser('sub') employeeId: string,
  ) {
    if (!photo) throw new BadRequestException('Photo is required (form-data field "photo")');

    const payload: SubmitAttendancePayload = {
      employeeId,
      photoPath: photo.path.replace(/\\/g, '/'),
      notes: dto.notes ?? null,
    };
    return callService<Attendance>(this.attendanceClient, ATTENDANCE_PATTERNS.SUBMIT, payload);
  }

  @Post('clock-out')
  @HttpCode(HttpStatus.OK)
  clockOut(@CurrentUser('sub') employeeId: string) {
    const payload: ClockOutPayload = { employeeId };
    return callService<Attendance>(this.attendanceClient, ATTENDANCE_PATTERNS.CLOCK_OUT, payload);
  }

  @Get('me/today')
  findToday(@CurrentUser('sub') employeeId: string) {
    const payload: FindTodayAttendancePayload = { employeeId };
    return callService<TodayAttendanceStatus>(this.attendanceClient, ATTENDANCE_PATTERNS.FIND_TODAY, payload);
  }

  @Get('me')
  findMine(@CurrentUser('sub') employeeId: string, @Query() query: AttendanceHistoryQueryDto) {
    const payload: FindMyAttendancePayload = { employeeId, query };
    return callService<Paginated<Attendance>>(this.attendanceClient, ATTENDANCE_PATTERNS.FIND_MINE, payload);
  }

  @Roles(Role.HR)
  @Get()
  findAll(@Query() query: AttendanceQueryDto) {
    return callService<Paginated<Attendance>>(this.attendanceClient, ATTENDANCE_PATTERNS.FIND_ALL, query);
  }
}
