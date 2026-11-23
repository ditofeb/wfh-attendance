import { formatDay, formatMonthYear, formatWeekday } from '../lib/format'
import { LiveClock } from './LiveClock'
import { Badge } from './ui/Badge'
import { CheckIcon } from './ui/icons'

export type DayStatus = 'none' | 'in' | 'done'

interface DateBlockProps {
  date: string
  status?: DayStatus
}

export function DateBlock({ date, status }: DateBlockProps) {
  return (
    <div className="rounded-control border border-line bg-surface p-5">
      <p className="text-sm text-muted">{formatWeekday(date)}</p>
      <p className="mt-1 text-6xl/none font-medium text-ink tabular-nums">{formatDay(date)}</p>
      <p className="mt-2 text-sm text-body">{formatMonthYear(date)}</p>

      <div className="mt-4 flex flex-col items-start gap-2 border-t border-line pt-3 text-sm">
        <p className="text-body">
          <LiveClock /> WIB
        </p>
        {status === 'none' && <p className="text-muted">Belum tercatat</p>}
        {status === 'in' && <Badge>Sudah masuk, belum pulang</Badge>}
        {status === 'done' && (
          <Badge tone="ok" icon={<CheckIcon className="size-3.5" />}>
            Masuk dan pulang tercatat
          </Badge>
        )}
      </div>
    </div>
  )
}
