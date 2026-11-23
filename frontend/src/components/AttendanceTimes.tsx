import { formatDuration, formatTime, todayInJakarta } from '../lib/format'
import type { Attendance } from '../types/api'

export function ClockOutText({ attendance }: { attendance: Attendance }) {
  if (attendance.clockOutTime) return <>{formatTime(attendance.clockOutTime)} WIB</>
  const isToday = attendance.attendanceDate === todayInJakarta()
  return <span className="text-muted">{isToday ? 'Belum pulang' : 'Tidak dicatat'}</span>
}

export function DurationText({ attendance }: { attendance: Attendance }) {
  if (!attendance.clockOutTime) return <span className="text-muted">-</span>
  return <>{formatDuration(attendance.attendanceTime, attendance.clockOutTime)}</>
}
