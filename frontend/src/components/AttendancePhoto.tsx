import { fileUrl } from '../lib/api'
import { formatDate, formatDuration, formatLongDate, formatTime } from '../lib/format'
import type { Attendance } from '../types/api'
import { Modal } from './ui/Modal'

interface PhotoThumbProps {
  attendance: Attendance
  onOpen: (attendance: Attendance) => void
}

export function PhotoThumb({ attendance, onOpen }: PhotoThumbProps) {
  return (
    <button
      type="button"
      onClick={() => onOpen(attendance)}
      aria-label={`Lihat foto kehadiran ${formatDate(attendance.attendanceDate)}`}
      className="block overflow-hidden rounded-badge border border-line-strong hover:border-ink"
    >
      <img
        src={fileUrl(attendance.photoPath)}
        alt=""
        width={64}
        height={48}
        loading="lazy"
        className="h-12 w-16 bg-canvas object-cover"
      />
    </button>
  )
}

interface PhotoViewerProps {
  attendance: Attendance | null
  onClose: () => void
}

export function PhotoViewer({ attendance, onClose }: PhotoViewerProps) {
  const who = attendance?.employee ? `${attendance.employee.name}, ` : ''
  const title = attendance ? `Foto kehadiran ${who}${formatLongDate(attendance.attendanceDate)}` : 'Foto kehadiran'

  return (
    <Modal open={attendance !== null} onClose={onClose} title={title} size="lg">
      {attendance && (
        <>
          <img
            src={fileUrl(attendance.photoPath)}
            alt={`Foto bukti kerja ${who}${formatLongDate(attendance.attendanceDate)}`}
            width={960}
            height={720}
            className="h-auto max-h-[70dvh] w-full rounded-badge bg-canvas object-contain"
          />
          <p className="mt-3 text-sm text-body">
            Masuk pukul {formatTime(attendance.attendanceTime)} WIB
            {attendance.clockOutTime
              ? `, pulang pukul ${formatTime(attendance.clockOutTime)} WIB (${formatDuration(attendance.attendanceTime, attendance.clockOutTime)}).`
              : ', jam pulang belum dicatat.'}
            {attendance.notes && <> Catatan: {attendance.notes}</>}
          </p>
        </>
      )}
    </Modal>
  )
}
