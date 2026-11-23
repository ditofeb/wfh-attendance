import type { ReactNode } from 'react'
import { Alert } from './Alert'
import { Button } from './Button'
import { Spinner } from './Spinner'
import { cn } from '../../lib/cn'

export interface Column<T> {
  key: string
  header: string
  cell: (row: T) => ReactNode
  primary?: boolean
  className?: string
}

interface TableProps<T> {
  caption: string
  columns: Column<T>[]
  rows: T[]
  rowKey: (row: T) => string
  loading?: boolean
  loadingText: string
  error?: string | null
  onRetry?: () => void
  empty: ReactNode
}

export function Table<T>({
  caption,
  columns,
  rows,
  rowKey,
  loading = false,
  loadingText,
  error = null,
  onRetry,
  empty,
}: TableProps<T>) {
  const errorAlert = error ? (
    <Alert tone="error" action={onRetry && <Button onClick={onRetry}>Coba lagi</Button>}>
      {error}
    </Alert>
  ) : null

  const loadingLine = (
    <p role="status" className="inline-flex items-center gap-2 text-sm text-body">
      <Spinner />
      {loadingText}
    </p>
  )

  if (rows.length === 0) {
    if (errorAlert) return errorAlert
    return <StatePanel>{loading ? loadingLine : empty}</StatePanel>
  }

  const primary = columns.find((column) => column.primary)
  const details = columns.filter((column) => column !== primary)

  return (
    <div className="flex flex-col gap-3" aria-busy={loading || undefined}>
      {errorAlert}
      {loading && loadingLine}

      <div className="overflow-hidden rounded-control border border-line bg-surface">
        <table className="hidden w-full text-left text-sm md:table">
          <caption className="sr-only">{caption}</caption>
          <thead className="bg-canvas">
            <tr>
              {columns.map((column) => (
                <th key={column.key} scope="col" className={cn('px-4 py-3 font-medium text-muted', column.className)}>
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={rowKey(row)} className="border-t border-line">
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={cn('px-4 py-3 align-middle text-body', column.primary && 'font-medium text-ink', column.className)}
                  >
                    {column.cell(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>

        <ul aria-label={caption} className="divide-y divide-line md:hidden">
          {rows.map((row) => (
            <li key={rowKey(row)} className="flex flex-col gap-2 p-4">
              {primary && <div className="font-medium text-ink">{primary.cell(row)}</div>}
              <dl className="grid grid-cols-[minmax(0,7rem)_minmax(0,1fr)] gap-x-3 gap-y-1.5 text-sm">
                {details.map((column) => (
                  <div key={column.key} className="contents">
                    <dt className="text-muted">{column.header}</dt>
                    <dd className="min-w-0 text-body">{column.cell(row)}</dd>
                  </div>
                ))}
              </dl>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

function StatePanel({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-control border border-line bg-surface px-4 py-10 text-center text-sm text-body">
      {children}
    </div>
  )
}
