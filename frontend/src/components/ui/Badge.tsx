import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'

type Tone = 'ok' | 'neutral'

const toneClass: Record<Tone, string> = {
  ok: 'bg-ok-soft text-ok',
  neutral: 'border border-line-strong text-body',
}

interface BadgeProps {
  tone?: Tone
  icon?: ReactNode
  children: ReactNode
}

export function Badge({ tone = 'neutral', icon, children }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 whitespace-nowrap rounded-badge px-2 py-0.5 text-[13px] font-medium',
        toneClass[tone],
      )}
    >
      {icon}
      {children}
    </span>
  )
}
