import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'
import { AlertIcon, CheckIcon } from './icons'

type Tone = 'error' | 'success'

const toneClass: Record<Tone, string> = {
  error: 'border-brand/40 bg-brand-soft text-brand',
  success: 'border-ok/40 bg-ok-soft text-ok',
}

interface AlertProps {
  tone: Tone
  title?: string
  children: ReactNode
  action?: ReactNode
  className?: string
}

export function Alert({ tone, title, children, action, className }: AlertProps) {
  const Icon = tone === 'error' ? AlertIcon : CheckIcon

  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      className={cn('flex items-start gap-3 rounded-control border p-4 text-sm', toneClass[tone], className)}
    >
      <Icon className="mt-0.5 size-4 shrink-0" />
      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <div>
          {title && <p className="font-medium">{title}</p>}
          <div>{children}</div>
        </div>
        {action && <div>{action}</div>}
      </div>
    </div>
  )
}
