import type { ComponentProps } from 'react'
import { cn } from '../../lib/cn'
import { Field } from './Field'
import { ChevronDownIcon } from './icons'
import { controlBorder, controlClass } from './styles'

export interface SelectOption {
  value: string
  label: string
}

interface SelectProps extends Omit<ComponentProps<'select'>, 'id' | 'children'> {
  label: string
  options: SelectOption[]
  placeholder?: string
  hint?: string
  error?: string
  optional?: boolean
}

export function Select({
  label,
  options,
  placeholder,
  hint,
  error,
  optional,
  className,
  ...selectProps
}: SelectProps) {
  return (
    <Field label={label} hint={hint} error={error} optional={optional} className={className}>
      {(control) => (
        <div className="relative">
          <select
            {...selectProps}
            {...control}
            className={cn(controlClass, controlBorder(Boolean(error)), 'appearance-none pr-10')}
          >
            {placeholder !== undefined && <option value="">{placeholder}</option>}
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDownIcon className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-body" />
        </div>
      )}
    </Field>
  )
}
