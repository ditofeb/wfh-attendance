import type { SelectOption } from '../components/ui/Select'
import { Role } from '../types/api'

export const ROLE_LABEL: Record<Role, string> = {
  [Role.EMPLOYEE]: 'Karyawan',
  [Role.HR]: 'HR',
}

export const ROLE_OPTIONS: SelectOption[] = [
  { value: Role.EMPLOYEE, label: ROLE_LABEL[Role.EMPLOYEE] },
  { value: Role.HR, label: ROLE_LABEL[Role.HR] },
]

export const STATUS_OPTIONS: SelectOption[] = [
  { value: 'true', label: 'Aktif' },
  { value: 'false', label: 'Nonaktif' },
]
