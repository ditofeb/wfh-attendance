import { useEffect, useId, useRef } from 'react'
import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'
import { XIcon } from './icons'

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  footer?: ReactNode
  size?: 'md' | 'lg'
}

export function Modal({ open, onClose, title, children, footer, size = 'md' }: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const returnFocusRef = useRef<HTMLElement | null>(null)
  const titleId = useId()

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (open) {
      if (!dialog.open) {
        returnFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null
        dialog.showModal()
      }
    } else {
      if (dialog.open) dialog.close()
      returnFocusRef.current?.focus()
      returnFocusRef.current = null
    }
  }, [open])

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      onClose={() => {
        if (open) onClose()
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
      className={cn(
        'm-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] rounded-control border border-line bg-surface p-0 text-body',
        'backdrop:bg-[rgb(31_31_32/0.5)]',
        size === 'lg' ? 'max-w-3xl' : 'max-w-lg',
      )}
    >
      <div className="flex max-h-[calc(100dvh-2rem)] flex-col">
        <div className="flex items-center gap-3 border-b border-line py-2 pr-2 pl-5">
          <h2 id={titleId} className="flex-1 text-base font-medium text-ink">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup"
            className="inline-flex size-11 items-center justify-center rounded-control text-body hover:bg-canvas active:bg-line"
          >
            <XIcon className="size-5" />
          </button>
        </div>

        <div className="overflow-y-auto px-5 py-4">{children}</div>

        {footer && <div className="flex flex-wrap justify-end gap-2 border-t border-line px-5 py-3">{footer}</div>}
      </div>
    </dialog>
  )
}
