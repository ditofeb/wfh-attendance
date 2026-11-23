import axios from 'axios'
import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router'
import { DateBlock } from '../components/DateBlock'
import type { DayStatus } from '../components/DateBlock'
import { PageHeader } from '../components/PageHeader'
import { ProfileCard } from '../components/ProfileCard'
import { Alert } from '../components/ui/Alert'
import { Button } from '../components/ui/Button'
import { Modal } from '../components/ui/Modal'
import { PhotoUploader } from '../components/ui/PhotoUploader'
import { Spinner } from '../components/ui/Spinner'
import { TextArea } from '../components/ui/TextArea'
import { useAuth } from '../context/AuthContext'
import { useFetch } from '../hooks/useFetch'
import { api, fileUrl, getErrorMessage } from '../lib/api'
import { cn } from '../lib/cn'
import { formatDuration, formatTime, todayInJakarta } from '../lib/format'
import type { Attendance, TodayAttendanceStatus } from '../types/api'

const NOTES_MAX = 255

function dayStatusOf(status: TodayAttendanceStatus | undefined): DayStatus | undefined {
  if (!status) return undefined
  if (!status.attendance) return 'none'
  return status.attendance.clockOutTime ? 'done' : 'in'
}

export function ClockInPage() {
  const { user } = useAuth()
  const today = useFetch<TodayAttendanceStatus>('/attendances/me/today')
  const [photo, setPhoto] = useState<File | null>(null)
  const [photoError, setPhotoError] = useState<string>()
  const [notes, setNotes] = useState('')
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const status = today.data

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitError(null)
    if (!photo) {
      setPhotoError('Pilih foto bukti kerja terlebih dahulu.')
      return
    }

    const body = new FormData()
    body.append('photo', photo)
    if (notes.trim()) body.append('notes', notes.trim())

    setSubmitting(true)
    try {
      await api.post<Attendance>('/attendances', body)
      setPhoto(null)
      setNotes('')
      today.reload()
    } catch (error) {
      setSubmitError(
        getErrorMessage(error, {
          400: 'Foto belum valid. Pilih ulang foto JPG, PNG, atau WebP.',
          403: 'Akun Anda sudah dinonaktifkan. Hubungi HR.',
          409: 'Anda sudah mencatat kehadiran hari ini.',
          413: 'Ukuran foto melebihi 2 MB.',
        }),
      )
      if (axios.isAxiosError(error) && error.response?.status === 409) today.reload()
    } finally {
      setSubmitting(false)
    }
  }

  function renderContent() {
    if (!status && today.loading) {
      return (
        <p role="status" className="inline-flex items-center gap-2 text-sm text-body">
          <Spinner />
          Memeriksa status kehadiran hari ini
        </p>
      )
    }

    if (!status) {
      return (
        <Alert tone="error" action={<Button onClick={today.reload}>Coba lagi</Button>}>
          {today.error ?? 'Status kehadiran hari ini belum bisa dimuat.'}
        </Alert>
      )
    }

    if (status.attendance) return <RecordedToday record={status.attendance} onChange={today.reload} />

    return (
      <form
        noValidate
        onSubmit={(event) => void handleSubmit(event)}
        className="flex flex-col gap-5 rounded-control border border-line bg-surface p-5"
      >
        {submitError && <Alert tone="error">{submitError}</Alert>}

        <PhotoUploader
          label="Foto bukti kerja"
          file={photo}
          onChange={(file) => {
            setPhoto(file)
            setPhotoError(undefined)
          }}
          error={photoError}
          disabled={submitting}
        />

        <TextArea
          label="Catatan"
          optional
          rows={3}
          maxLength={NOTES_MAX}
          placeholder="Contoh: menyusun laporan bulanan"
          hint={`${notes.length}/${NOTES_MAX} karakter`}
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          disabled={submitting}
        />

        <div className="flex flex-wrap items-center gap-3">
          <Button type="submit" variant="primary" loading={submitting}>
            {submitting ? 'Mengirim...' : 'Catat kehadiran'}
          </Button>
          <p className="text-sm text-muted">Hanya bisa sekali per hari.</p>
        </div>
      </form>
    )
  }

  return (
    <>
      <PageHeader
        title="Catat kehadiran"
        description="Catat jam masuk dengan foto saat mulai bekerja, lalu catat jam pulang saat selesai. Waktunya diambil dari server."
      />

      <div className="grid items-start gap-6 md:grid-cols-[minmax(0,15rem)_minmax(0,1fr)]">
        <DateBlock date={status?.date ?? todayInJakarta()} status={dayStatusOf(status)} />

        <section
          aria-labelledby="today-heading"
          className="flex min-w-0 flex-col gap-4 md:col-start-2 md:row-span-2 md:row-start-1"
        >
          <h2 id="today-heading" className="text-lg font-medium text-ink">
            Kehadiran hari ini
          </h2>
          {renderContent()}
        </section>

        {user && <ProfileCard user={user} className="md:col-start-1 md:row-start-2" />}
      </div>
    </>
  )
}

interface RecordedTodayProps {
  record: Attendance
  onChange: () => void
}

function RecordedToday({ record, onChange }: RecordedTodayProps) {
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const clockIn = formatTime(record.attendanceTime)
  const clockOut = record.clockOutTime ? formatTime(record.clockOutTime) : null
  const duration = record.clockOutTime ? formatDuration(record.attendanceTime, record.clockOutTime) : null

  function closeConfirm() {
    setConfirmOpen(false)
    setError(null)
  }

  async function clockOutNow() {
    setSaving(true)
    setError(null)
    try {
      await api.post<Attendance>('/attendances/clock-out')
      setConfirmOpen(false)
      onChange()
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 409) {
        setConfirmOpen(false)
        onChange()
        return
      }
      setError(
        getErrorMessage(err, {
          403: 'Akun Anda sudah dinonaktifkan. Hubungi HR.',
          404: 'Kehadiran masuk hari ini tidak ditemukan. Muat ulang halaman ini.',
        }),
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {clockOut ? (
        <Alert tone="success" title="Kehadiran hari ini lengkap">
          Masuk pukul {clockIn} WIB, pulang pukul {clockOut} WIB. Sampai jumpa besok.
        </Alert>
      ) : (
        <Alert tone="success" title="Jam masuk sudah tercatat">
          Masuk pukul {clockIn} WIB. Catat jam pulang setelah Anda selesai bekerja.
        </Alert>
      )}

      <div className="rounded-control border border-line bg-surface p-4">
        <dl className="grid grid-cols-3 gap-3 text-sm">
          <TimeItem label="Masuk" value={`${clockIn} WIB`} />
          <TimeItem label="Pulang" value={clockOut ? `${clockOut} WIB` : 'Belum'} muted={!clockOut} />
          <TimeItem label="Durasi" value={duration ?? '-'} muted={!duration} />
        </dl>
        {!clockOut && (
          <Button variant="primary" className="mt-4" onClick={() => setConfirmOpen(true)}>
            Catat jam pulang
          </Button>
        )}
      </div>

      <figure className="rounded-control border border-line bg-surface p-3">
        <img
          src={fileUrl(record.photoPath)}
          alt="Foto bukti kerja yang Anda kirim hari ini"
          width={480}
          height={360}
          className="aspect-[4/3] w-full max-w-md rounded-badge bg-canvas object-cover"
        />
        {record.notes && (
          <figcaption className="mt-3 text-sm text-body">
            <span className="text-muted">Catatan:</span> {record.notes}
          </figcaption>
        )}
      </figure>

      <p className="text-sm">
        <Link
          to="/my-attendance"
          className="font-medium text-brand underline underline-offset-4 hover:text-brand-strong"
        >
          Lihat riwayat kehadiran
        </Link>
      </p>

      <Modal
        open={confirmOpen}
        onClose={closeConfirm}
        title="Catat jam pulang sekarang?"
        footer={
          <>
            <Button onClick={closeConfirm}>Batal</Button>
            <Button variant="primary" loading={saving} onClick={() => void clockOutNow()}>
              {saving ? 'Mencatat...' : 'Catat jam pulang'}
            </Button>
          </>
        }
      >
        {error && (
          <Alert tone="error" className="mb-4">
            {error}
          </Alert>
        )}
        <p className="text-sm">
          Jam pulang diambil dari server saat Anda menekan tombol dan tidak bisa diubah setelah dicatat.
        </p>
      </Modal>
    </div>
  )
}

function TimeItem({ label, value, muted = false }: { label: string; value: string; muted?: boolean }) {
  return (
    <div>
      <dt className="text-muted">{label}</dt>
      <dd className={cn('mt-0.5 font-medium tabular-nums', muted ? 'text-muted' : 'text-ink')}>{value}</dd>
    </div>
  )
}
