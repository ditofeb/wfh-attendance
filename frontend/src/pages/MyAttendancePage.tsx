import { useState } from 'react'
import { Link } from 'react-router'
import { PhotoThumb, PhotoViewer } from '../components/AttendancePhoto'
import { ClockOutText, DurationText } from '../components/AttendanceTimes'
import { PageHeader } from '../components/PageHeader'
import { Button } from '../components/ui/Button'
import { Pagination } from '../components/ui/Pagination'
import { Table } from '../components/ui/Table'
import type { Column } from '../components/ui/Table'
import { TextField } from '../components/ui/TextField'
import { useFetch } from '../hooks/useFetch'
import { formatDate, formatTime, todayInJakarta } from '../lib/format'
import type { Attendance, Paginated } from '../types/api'

const PAGE_SIZE = 10

export function MyAttendancePage() {
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [page, setPage] = useState(1)
  const [viewing, setViewing] = useState<Attendance | null>(null)

  const today = todayInJakarta()
  const filtered = Boolean(dateFrom || dateTo)
  const rangeError =
    dateFrom && dateTo && dateFrom > dateTo ? 'Tanggal akhir harus sama dengan atau setelah tanggal awal.' : undefined

  const history = useFetch<Paginated<Attendance>>(
    '/attendances/me',
    rangeError ? null : { dateFrom, dateTo, page, limit: PAGE_SIZE },
  )

  const columns: Column<Attendance>[] = [
    {
      key: 'date',
      header: 'Tanggal',
      primary: true,
      cell: (a) => formatDate(a.attendanceDate),
      className: 'tabular-nums',
    },
    { key: 'in', header: 'Masuk', cell: (a) => `${formatTime(a.attendanceTime)} WIB`, className: 'tabular-nums' },
    { key: 'out', header: 'Pulang', cell: (a) => <ClockOutText attendance={a} />, className: 'tabular-nums' },
    { key: 'duration', header: 'Durasi', cell: (a) => <DurationText attendance={a} /> },
    { key: 'notes', header: 'Catatan', cell: (a) => a.notes ?? <span className="text-muted">Tanpa catatan</span> },
    { key: 'photo', header: 'Foto', cell: (a) => <PhotoThumb attendance={a} onOpen={setViewing} /> },
  ]

  function clearFilters() {
    setDateFrom('')
    setDateTo('')
    setPage(1)
  }

  return (
    <>
      <PageHeader title="Riwayat kehadiran" description="Semua kehadiran yang pernah Anda catat, terbaru di atas." />

      <div className="mb-4 flex flex-wrap items-start gap-3">
        <TextField
          label="Dari tanggal"
          type="date"
          value={dateFrom}
          max={dateTo || today}
          onChange={(event) => {
            setDateFrom(event.target.value)
            setPage(1)
          }}
          className="w-full sm:w-48"
        />
        <TextField
          label="Sampai tanggal"
          type="date"
          value={dateTo}
          min={dateFrom || undefined}
          max={today}
          error={rangeError}
          onChange={(event) => {
            setDateTo(event.target.value)
            setPage(1)
          }}
          className="w-full sm:w-48"
        />
        {filtered && (
          <Button onClick={clearFilters} className="sm:mt-7">
            Hapus filter
          </Button>
        )}
      </div>

      <Table
        caption="Riwayat kehadiran Anda"
        columns={columns}
        rows={history.data?.data ?? []}
        rowKey={(a) => a.id}
        loading={history.loading}
        loadingText="Memuat riwayat kehadiran"
        error={history.error}
        onRetry={history.reload}
        empty={
          filtered ? (
            'Tidak ada kehadiran pada rentang tanggal ini. Ubah tanggalnya atau hapus filter.'
          ) : (
            <>
              Anda belum pernah mencatat kehadiran.{' '}
              <Link to="/clock-in" className="font-medium text-brand underline underline-offset-4">
                Catat kehadiran hari ini
              </Link>
            </>
          )
        }
      />

      {history.data && (
        <div className="mt-4">
          <Pagination
            meta={history.data.meta}
            itemLabel="catatan kehadiran"
            onPageChange={setPage}
            disabled={history.loading}
          />
        </div>
      )}

      <PhotoViewer attendance={viewing} onClose={() => setViewing(null)} />
    </>
  )
}
