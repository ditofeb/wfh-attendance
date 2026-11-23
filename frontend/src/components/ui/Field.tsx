import { useId } from 'react'
import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'
import { AlertIcon } from './icons'

export interface FieldControlProps {
  id: string
  'aria-describedby'?: string
  'aria-invalid'?: true
}

interface FieldProps {
  label: string
  hint?: string
  error?: string
  optional?: boolean
  className?: string
  children: (control: FieldControlProps) => ReactNode
}

export function Field({ label, hint, error, optional, className, children }: FieldProps) {
  const id = useId()
  const hintId = `${id}-hint`
  const errorId = `${id}-error`
  const describedBy = [hint && hintId, error && errorId].filter(Boolean).join(' ') || undefined

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label htmlFor={id} className="text-sm font-medium text-ink">
        {label}
        {optional && <span className="font-normal text-muted"> (opsional)</span>}
      </label>

      {children({ id, 'aria-describedby': describedBy, 'aria-invalid': error ? true : undefined })}

      {hint && (
        <p id={hintId} className="text-sm text-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="flex items-start gap-1.5 text-sm text-brand">
          <AlertIcon className="mt-0.5 size-4 shrink-0" />
          {error}
        </p>
      )}
    </div>
  )
}
