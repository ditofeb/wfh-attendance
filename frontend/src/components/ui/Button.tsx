import type { ComponentProps } from 'react'
import { cn } from '../../lib/cn'
import { Spinner } from './Spinner'
import { buttonBase, buttonDisabled, buttonVariant } from './styles'
import type { ButtonVariant } from './styles'

interface ButtonProps extends ComponentProps<'button'> {
  variant?: ButtonVariant
  loading?: boolean
}

export function Button({
  variant = 'secondary',
  loading = false,
  disabled = false,
  type = 'button',
  className,
  children,
  ...props
}: ButtonProps) {
  const look = disabled && !loading ? buttonDisabled : buttonVariant[variant]

  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(buttonBase, 'enabled:active:translate-y-px', loading && 'cursor-wait', look, className)}
      {...props}
    >
      {loading && <Spinner />}
      {children}
    </button>
  )
}
