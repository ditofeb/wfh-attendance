import type { PaginationMeta } from '../../types/api'
import { Button } from './Button'

interface PaginationProps {
  meta: PaginationMeta
  itemLabel: string
  onPageChange: (page: number) => void
  disabled?: boolean
}

export function Pagination({ meta, itemLabel, onPageChange, disabled = false }: PaginationProps) {
  const { page, limit, total, totalPages } = meta
  if (total === 0) return null

  const from = (page - 1) * limit + 1
  const to = Math.min(page * limit, total)
  const summary =
    totalPages > 1
      ? `Halaman ${page} dari ${totalPages}, ${from}-${to} dari ${total} ${itemLabel}`
      : `${total} ${itemLabel}`

  return (
    <nav aria-label="Navigasi halaman" className="flex flex-wrap items-center justify-between gap-3 text-sm">
      <p aria-live="polite" className="text-muted tabular-nums">
        {summary}
      </p>
      {totalPages > 1 && (
        <div className="flex gap-2">
          <Button disabled={disabled || page <= 1} onClick={() => onPageChange(page - 1)}>
            Sebelumnya
          </Button>
          <Button disabled={disabled || page >= totalPages} onClick={() => onPageChange(page + 1)}>
            Berikutnya
          </Button>
        </div>
      )}
    </nav>
  )
}
