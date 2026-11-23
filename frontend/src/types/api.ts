export const Role = { EMPLOYEE: 'EMPLOYEE', HR: 'HR' } as const
export type Role = (typeof Role)[keyof typeof Role]

export interface AuthUser {
  id: string
  employeeCode: string
  name: string
  email: string
  role: Role
  position: string | null
  department: string | null
}

export interface LoginResponse {
  accessToken: string
  user: Omit<AuthUser, 'position' | 'department'>
}

export interface Department {
  id: string
  name: string
  createdAt: string
}

export interface Employee {
  id: string
  employeeCode: string
  name: string
  email: string
  role: Role
  position: string | null
  departmentId: string | null
  department: Department | null
  phone: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface Attendance {
  id: string
  employeeId: string
  employee?: Employee
  attendanceDate: string
  attendanceTime: string
  clockOutTime: string | null
  photoPath: string
  notes: string | null
  createdAt: string
}

export interface TodayAttendanceStatus {
  date: string
  submitted: boolean
  attendance: Attendance | null
}

export interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface Paginated<T> {
  data: T[]
  meta: PaginationMeta
}

export interface ApiErrorBody {
  statusCode: number
  message: string | string[]
  error?: string
}
