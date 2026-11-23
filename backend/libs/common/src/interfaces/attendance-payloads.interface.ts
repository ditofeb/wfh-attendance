import type { AttendanceHistoryQueryDto } from '../dto/attendance/query-attendance.dto';
import type { Attendance } from '../entities/attendance.entity';

export interface SubmitAttendancePayload {
  employeeId: string;
  photoPath: string;
  notes: string | null;
}

export interface FindMyAttendancePayload {
  employeeId: string;
  query: AttendanceHistoryQueryDto;
}

export interface FindTodayAttendancePayload {
  employeeId: string;
}

export interface ClockOutPayload {
  employeeId: string;
}

export interface TodayAttendanceStatus {
  date: string;
  submitted: boolean;
  attendance: Attendance | null;
}
