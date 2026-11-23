import type { ComponentProps } from 'react'
import { cn } from '../../lib/cn'
import { Field } from './Field'
import { controlBorder, controlClass } from './styles'

interface TextFieldProps extends Omit<ComponentProps<'input'>, 'id'> {
  label: string
  hint?: string
  error?: string
  optional?: boolean
}

export function TextField({ label, hint, error, optional, className, ...inputProps }: TextFieldProps) {
  return (
    <Field label={label} hint={hint} error={error} optional={optional} className={className}>
      {(control) => (
        <input {...inputProps} {...control} className={cn(controlClass, controlBorder(Boolean(error)))} />
      )}
    </Field>
  )
}
