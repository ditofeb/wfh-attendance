import { useEffect, useState } from 'react'
import { formatClock } from '../lib/format'

export function LiveClock() {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <time dateTime={now.toISOString()} className="tabular-nums">
      {formatClock(now)}
    </time>
  )
}
