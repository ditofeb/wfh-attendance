import type { ComponentProps } from 'react'
import { Link } from 'react-router'
import { cn } from '../../lib/cn'
import { buttonBase, buttonVariant } from './styles'
import type { ButtonVariant } from './styles'

type LinkButtonProps = ComponentProps<typeof Link> & { variant?: ButtonVariant }

export function LinkButton({ variant = 'secondary', className, ...props }: LinkButtonProps) {
  return <Link {...props} className={cn(buttonBase, 'active:translate-y-px', buttonVariant[variant], className)} />
}
