export const AUTH_PATTERNS = {
  PING: 'auth.ping',
  LOGIN: 'auth.login',
} as const;

export const EMPLOYEE_PATTERNS = {
  PING: 'employee.ping',
  FIND_ALL: 'employee.findAll',
  FIND_ONE: 'employee.findOne',
  CREATE: 'employee.create',
  UPDATE: 'employee.update',
  DEACTIVATE: 'employee.deactivate',
} as const;

export const DEPARTMENT_PATTERNS = {
  FIND_ALL: 'department.findAll',
} as const;

export const ATTENDANCE_PATTERNS = {
  PING: 'attendance.ping',
  SUBMIT: 'attendance.submit',
  FIND_MINE: 'attendance.findMine',
  FIND_TODAY: 'attendance.findToday',
  FIND_ALL: 'attendance.findAll',
  CLOCK_OUT: 'attendance.clockOut',
} as const;
