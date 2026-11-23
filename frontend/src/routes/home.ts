import { Role } from '../types/api'

export function homePathFor(role: Role): string {
  return role === Role.HR ? '/hr/attendance' : '/clock-in'
}
