const LOCALE = 'id-ID'
const TIME_ZONE = 'Asia/Jakarta'

const shortDate = new Intl.DateTimeFormat(LOCALE, { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' })
const longDate = new Intl.DateTimeFormat(LOCALE, {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
})
const clockTime = new Intl.DateTimeFormat(LOCALE, { hour: '2-digit', minute: '2-digit', timeZone: TIME_ZONE })

function fromDateOnly(date: string): Date {
  const [year, month, day] = date.split('-').map(Number)
  return new Date(Date.UTC(year, month - 1, day))
}

export const formatDate = (date: string): string => shortDate.format(fromDateOnly(date))

export const formatLongDate = (date: string): string => longDate.format(fromDateOnly(date))

export const formatTime = (iso: string): string => clockTime.format(new Date(iso))

const decimal = new Intl.NumberFormat(LOCALE, { maximumFractionDigits: 1 })

export const formatFileSize = (bytes: number): string =>
  bytes < 1024 * 1024
    ? `${Math.max(1, Math.round(bytes / 1024))} KB`
    : `${decimal.format(bytes / (1024 * 1024))} MB`

const isoDay = new Intl.DateTimeFormat('en-CA', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  timeZone: TIME_ZONE,
})

export const todayInJakarta = (): string => isoDay.format(new Date())

const weekdayName = new Intl.DateTimeFormat(LOCALE, { weekday: 'long', timeZone: 'UTC' })
const dayNumber = new Intl.DateTimeFormat(LOCALE, { day: 'numeric', timeZone: 'UTC' })
const monthYear = new Intl.DateTimeFormat(LOCALE, { month: 'long', year: 'numeric', timeZone: 'UTC' })
const clockWithSeconds = new Intl.DateTimeFormat(LOCALE, {
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  timeZone: TIME_ZONE,
})

export const formatWeekday = (date: string): string => weekdayName.format(fromDateOnly(date))

export const formatDay = (date: string): string => dayNumber.format(fromDateOnly(date))

export const formatMonthYear = (date: string): string => monthYear.format(fromDateOnly(date))

export const formatClock = (moment: Date): string => clockWithSeconds.format(moment)

export function formatDuration(fromIso: string, toIso: string): string {
  const minutes = Math.max(0, Math.round((new Date(toIso).getTime() - new Date(fromIso).getTime()) / 60000))
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  if (hours === 0) return `${rest} menit`
  return rest === 0 ? `${hours} jam` : `${hours} jam ${rest} menit`
}
