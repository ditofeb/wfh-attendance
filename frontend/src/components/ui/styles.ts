export const controlClass =
  'h-11 w-full rounded-control border bg-surface px-3 text-base text-ink placeholder:text-muted ' +
  'disabled:cursor-not-allowed disabled:bg-canvas disabled:text-muted'

export const controlBorder = (hasError: boolean): string =>
  hasError ? 'border-brand' : 'border-line-strong enabled:hover:border-body'

export type ButtonVariant = 'primary' | 'secondary' | 'danger'

export const buttonBase =
  'inline-flex h-11 items-center justify-center gap-2 whitespace-nowrap rounded-control px-4 text-sm font-medium transition-colors'

export const buttonVariant: Record<ButtonVariant, string> = {
  primary: 'bg-brand text-white hover:bg-brand-strong',
  secondary: 'border border-line-strong bg-surface text-ink hover:bg-canvas',
  danger: 'border border-brand bg-surface text-brand hover:bg-brand-soft',
}

export const buttonDisabled = 'cursor-not-allowed border border-line bg-canvas text-muted'
