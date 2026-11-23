import { useState } from 'react'
import { PhotoThumb, PhotoViewer } from '../../components/AttendancePhoto'
import { ClockOutText, DurationText } from '../../components/AttendanceTimes'
import { PageHeader } from '../../components/PageHeader'
import { Button } from '../../components/ui/Button'
import { Pagination } from '../../components/ui/Pagination'
import { Select } from '../../components/ui/Select'
import { Table } from '../../components/ui/Table'
import type { Column } from '../../components/ui/Table'
import { TextField } from '../../components/ui/TextField'
import { useDebouncedValue } from '../../hooks/useDebouncedValue'
import { useFetch } from '../../hooks/useFetch'
import { formatDate, formatTime, todayInJakarta } from '../../lib/format'
import type { Attendance, Department, Paginated } from '../../types/api'

const PAGE_SIZE = 10

export function AttendanceMonitorPage() {
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [search, setSearch] = useState('')
  const [departmentId, setDepartmentId] = useState('')
  const [page, setPage] = useState(1)
  const [viewing, setViewing] = useState<Attendance | null>(null)

  const today = todayInJakarta()
  const debouncedSearch = useDebouncedValue(search.trim())
  const rangeError =
    dateFrom && dateTo && dateFrom > dateTo ? 'Tanggal akhir harus sama dengan atau setelah tanggal awal.' : undefined
  const filtered = Boolean(dateFrom || dateTo || search || departmentId)
  const showingToday = dateFrom === today && dateTo === today

  const records = useFetch<Paginated<Attendance>>(
    '/attendances',
    rangeError ? null : { dateFrom, dateTo, search: debouncedSearch, departmentId, page, limit: PAGE_SIZE },
  )
  const departments = useFetch<Department[]>('/departments')

  function changeFilter(setter: (value: string) => void) {
    return (value: string) => {
      setter(value)
      setPage(1)
    }
  }

  function showToday() {
    setDateFrom(today)
    setDateTo(today)
    setPage(1)
  }

  function clearFilters() {
    setDateFrom('')
    setDateTo('')
    setSearch('')
    setDepartmentId('')
    setPage(1)
  }

  const columns: Column<Attendance>[] = [
    {
      key: 'employee',
      header: 'Karyawan',
      primary: true,
      cell: (a) => (
        <div>
          <p className="font-medium text-ink">{a.employee?.name ?? 'Karyawan tidak dikenal'}</p>
          <p className="text-[13px] font-normal text-muted tabular-nums">{a.employee?.employeeCode}</p>
        </div>
      ),
    },
    {
      key: 'department',
      header: 'Departemen',
      cell: (a) => a.employee?.department?.name ?? <span className="text-muted">Tanpa departemen</span>,
    },
    { key: 'date', header: 'Tanggal', cell: (a) => formatDate(a.attendanceDate), className: 'tabular-nums' },
    { key: 'in', header: 'Masuk', cell: (a) => `${formatTime(a.attendanceTime)} WIB`, className: 'tabular-nums' },
    { key: 'out', header: 'Pulang', cell: (a) => <ClockOutText attendance={a} />, className: 'tabular-nums' },
    { key: 'duration', header: 'Durasi', cell: (a) => <DurationText attendance={a} /> },
    {
      key: 'notes',
      header: 'Catatan',
      cell: (a) =>
        a.notes ? <span className="line-clamp-2">{a.notes}</span> : <span className="text-muted">Tanpa catatan</span>,
    },
    { key: 'photo', header: 'Foto', cell: (a) => <PhotoThumb attendance={a} onOpen={setViewing} /> },
  ]

  const departmentOptions = (departments.data ?? []).map((d) => ({ value: d.id, label: d.name }))

  return (
    <>
      <PageHeader
        title="Pantau kehadiran"
        description="Semua kehadiran yang dicatat karyawan, terbaru di atas. Data ini hanya bisa dilihat."
        actions={
          !showingToday && (
            <Button variant="primary" onClick={showToday}>
              Tampilkan hari ini
            </Button>
          )
        }
      />

      <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <TextField
          label="Cari karyawan"
          type="search"
          placeholder="Nama atau kode karyawan"
          value={search}
          onChange={(event) => changeFilter(setSearch)(event.target.value)}
        />
        <Select
          label="Departemen"
          placeholder="Semua departemen"
          options={departmentOptions}
          value={departmentId}
          onChange={(event) => changeFilter(setDepartmentId)(event.target.value)}
          hint={departments.error ? 'Daftar departemen belum bisa dimuat.' : undefined}
        />
        <TextField
          label="Dari tanggal"
          type="date"
          value={dateFrom}
          max={dateTo || today}
          onChange={(event) => changeFilter(setDateFrom)(event.target.value)}
        />
        <TextField
          label="Sampai tanggal"
          type="date"
          value={dateTo}
          min={dateFrom || undefined}
          max={today}
          error={rangeError}
          onChange={(event) => changeFilter(setDateTo)(event.target.value)}
        />
      </div>

      {filtered && (
        <Button onClick={clearFilters} className="mb-4">
          Hapus filter
        </Button>
      )}

      <Table
        caption="Kehadiran semua karyawan"
        columns={columns}
        rows={records.data?.data ?? []}
        rowKey={(a) => a.id}
        loading={records.loading}
        loadingText="Memuat data kehadiran"
        error={records.error}
        onRetry={records.reload}
        empty={
          showingToday && !search && !departmentId
            ? 'Belum ada karyawan yang mencatat kehadiran hari ini.'
            : filtered
              ? 'Tidak ada kehadiran yang cocok dengan filter ini. Ubah filternya atau hapus filter.'
              : 'Belum ada kehadiran yang tercatat.'
        }
      />

      {records.data && (
        <div className="mt-4">
          <Pagination
            meta={records.data.meta}
            itemLabel="catatan kehadiran"
            onPageChange={setPage}
            disabled={records.loading}
          />
        </div>
      )}

      <PhotoViewer attendance={viewing} onClose={() => setViewing(null)} />
    </>
  )
}
