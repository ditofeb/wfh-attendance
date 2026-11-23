import type { ComponentProps } from 'react'
import { cn } from '../../lib/cn'
import { Field } from './Field'
import { controlBorder } from './styles'

interface TextAreaProps extends Omit<ComponentProps<'textarea'>, 'id'> {
  label: string
  hint?: string
  error?: string
  optional?: boolean
}

export function TextArea({ label, hint, error, optional, className, ...textareaProps }: TextAreaProps) {
  return (
    <Field label={label} hint={hint} error={error} optional={optional} className={className}>
      {(control) => (
        <textarea
          {...textareaProps}
          {...control}
          className={cn(
            'min-h-24 w-full rounded-control border bg-surface px-3 py-2 text-base text-ink placeholder:text-muted',
            'disabled:cursor-not-allowed disabled:bg-canvas disabled:text-muted',
            controlBorder(Boolean(error)),
          )}
        />
      )}
    </Field>
  )
}
