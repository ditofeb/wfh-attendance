import { useEffect, useId, useRef, useState } from 'react'
import type { DragEvent } from 'react'
import { cn } from '../../lib/cn'
import { formatFileSize } from '../../lib/format'
import { Button } from './Button'
import { AlertIcon, CameraIcon } from './icons'

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_BYTES = 2 * 1024 * 1024

function validate(file: File): string | null {
  if (!ACCEPTED_TYPES.includes(file.type)) return 'Format foto tidak didukung. Gunakan JPG, PNG, atau WebP.'
  if (file.size > MAX_BYTES) return `Ukuran foto ${formatFileSize(file.size)}, maksimal 2 MB.`
  return null
}

interface PhotoUploaderProps {
  label: string
  file: File | null
  onChange: (file: File | null) => void
  error?: string
  disabled?: boolean
}

export function PhotoUploader({ label, file, onChange, error, disabled = false }: PhotoUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const hintId = useId()
  const errorId = useId()
  const [localError, setLocalError] = useState<string | null>(null)
  const [dragging, setDragging] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null)
      return
    }
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [file])

  const shownError = localError ?? error
  const describedBy = [hintId, shownError ? errorId : null].filter(Boolean).join(' ')

  function accept(candidate: File | undefined) {
    if (!candidate) return
    const problem = validate(candidate)
    setLocalError(problem)
    if (!problem) onChange(candidate)
  }

  function openPicker() {
    inputRef.current?.click()
  }

  function remove() {
    setLocalError(null)
    onChange(null)
  }

  function handleDragOver(event: DragEvent<HTMLDivElement>) {
    if (disabled) return
    event.preventDefault()
    setDragging(true)
  }

  function handleDragLeave(event: DragEvent<HTMLDivElement>) {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setDragging(false)
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault()
    setDragging(false)
    if (!disabled) accept(event.dataTransfer.files[0])
  }

  return (
    <fieldset disabled={disabled} className="min-w-0">
      <legend className="mb-1.5 text-sm font-medium text-ink">{label}</legend>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(',')}
        tabIndex={-1}
        className="hidden"
        onChange={(event) => {
          accept(event.target.files?.[0])
          event.target.value = ''
        }}
      />

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          'rounded-control border-[1.5px] bg-surface transition-colors',
          file ? 'border-solid p-3' : 'border-dashed px-4 py-8',
          dragging ? 'border-brand bg-brand-soft' : shownError ? 'border-brand' : file ? 'border-line' : 'border-line-strong',
        )}
      >
        {file ? (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            {previewUrl ? (
              <img
                src={previewUrl}
                alt={`Pratinjau foto ${file.name}`}
                width={192}
                height={144}
                className="aspect-[4/3] w-full rounded-badge bg-canvas object-cover sm:w-48"
              />
            ) : (
              <div className="aspect-[4/3] w-full rounded-badge bg-canvas sm:w-48" />
            )}
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <p className="truncate text-sm font-medium text-ink">{file.name}</p>
              <p id={hintId} className="text-sm text-muted">
                {formatFileSize(file.size)}
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                <Button onClick={openPicker} aria-describedby={describedBy}>
                  Ganti foto
                </Button>
                <Button onClick={remove}>Hapus</Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 text-center">
            <CameraIcon className="size-6 text-body" />
            <Button onClick={openPicker} aria-describedby={describedBy}>
              Pilih foto
            </Button>
            <p id={hintId} className="text-sm text-muted">
              JPG, PNG, atau WebP, maksimal 2 MB.
              <span className="hidden md:inline"> Bisa juga diseret ke sini.</span>
            </p>
          </div>
        )}
      </div>

      {shownError && (
        <p id={errorId} role="alert" className="mt-1.5 flex items-start gap-1.5 text-sm text-brand">
          <AlertIcon className="mt-0.5 size-4 shrink-0" />
          {shownError}
        </p>
      )}
    </fieldset>
  )
}
