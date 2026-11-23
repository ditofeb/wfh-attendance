import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { PageHeader } from '../../components/PageHeader'
import { Alert } from '../../components/ui/Alert'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { CheckIcon } from '../../components/ui/icons'
import { LinkButton } from '../../components/ui/LinkButton'
import { Modal } from '../../components/ui/Modal'
import { Pagination } from '../../components/ui/Pagination'
import { Select } from '../../components/ui/Select'
import { Table } from '../../components/ui/Table'
import type { Column } from '../../components/ui/Table'
import { TextField } from '../../components/ui/TextField'
import { useAuth } from '../../context/AuthContext'
import { useDebouncedValue } from '../../hooks/useDebouncedValue'
import { useFetch } from '../../hooks/useFetch'
import { api, getErrorMessage } from '../../lib/api'
import { ROLE_LABEL, ROLE_OPTIONS, STATUS_OPTIONS } from '../../lib/labels'
import type { Department, Employee, Paginated } from '../../types/api'

const PAGE_SIZE = 10

function readNotice(state: unknown): string | null {
  return (state as { notice?: string } | null)?.notice ?? null
}

export function EmployeesPage() {
  const { user } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const [notice, setNotice] = useState<string | null>(() => readNotice(location.state))
  useEffect(() => {
    if (location.state) void navigate('.', { replace: true, state: null })
  }, [])

  const [search, setSearch] = useState('')
  const [departmentId, setDepartmentId] = useState('')
  const [role, setRole] = useState('')
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const debouncedSearch = useDebouncedValue(search.trim())

  const employees = useFetch<Paginated<Employee>>('/employees', {
    search: debouncedSearch,
    departmentId,
    role,
    isActive: status,
    page,
    limit: PAGE_SIZE,
  })
  const departments = useFetch<Department[]>('/departments')

  const [confirming, setConfirming] = useState<Employee | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)

  const filtered = Boolean(search || departmentId || role || status)

  function changeFilter(setter: (value: string) => void) {
    return (value: string) => {
      setter(value)
      setPage(1)
    }
  }

  function clearFilters() {
    setSearch('')
    setDepartmentId('')
    setRole('')
    setStatus('')
    setPage(1)
  }

  function closeConfirm() {
    setConfirming(null)
    setActionError(null)
  }

  async function deactivate(employee: Employee) {
    setBusyId(employee.id)
    setActionError(null)
    try {
      await api.delete(`/employees/${employee.id}`)
      setConfirming(null)
      setNotice(`${employee.name} dinonaktifkan. Riwayat kehadirannya tetap tersimpan.`)
      employees.reload()
    } catch (error) {
      setActionError(getErrorMessage(error))
    } finally {
      setBusyId(null)
    }
  }

  async function activate(employee: Employee) {
    setBusyId(employee.id)
    setActionError(null)
    setNotice(null)
    try {
      await api.patch(`/employees/${employee.id}`, { isActive: true })
      setNotice(`${employee.name} aktif kembali dan bisa masuk lagi.`)
      employees.reload()
    } catch (error) {
      setActionError(getErrorMessage(error))
    } finally {
      setBusyId(null)
    }
  }

  const columns: Column<Employee>[] = [
    {
      key: 'name',
      header: 'Karyawan',
      primary: true,
      cell: (e) => (
        <div className="min-w-0">
          <p className="font-medium text-ink">{e.name}</p>
          <p className="text-[13px] font-normal text-muted [overflow-wrap:anywhere]">
            <span className="tabular-nums">{e.employeeCode}</span> · {e.email}
          </p>
        </div>
      ),
    },
    {
      key: 'work',
      header: 'Jabatan dan departemen',
      cell: (e) =>
        e.position || e.department ? (
          <div>
            <p>{e.position ?? 'Jabatan belum diisi'}</p>
            <p className="text-[13px] text-muted">{e.department?.name ?? 'Tanpa departemen'}</p>
          </div>
        ) : (
          <span className="text-muted">Belum diisi</span>
        ),
    },
    { key: 'role', header: 'Peran', cell: (e) => <Badge>{ROLE_LABEL[e.role]}</Badge> },
    {
      key: 'status',
      header: 'Status',
      cell: (e) =>
        e.isActive ? (
          <Badge tone="ok" icon={<CheckIcon className="size-3.5" />}>
            Aktif
          </Badge>
        ) : (
          <Badge>Nonaktif</Badge>
        ),
    },
    {
      key: 'actions',
      header: 'Aksi',
      cell: (e) => (
        <div className="flex flex-wrap gap-2">
          <LinkButton to={`/hr/employees/${e.id}`} aria-label={`Ubah data ${e.name}`}>
            Ubah
          </LinkButton>
          {e.id !== user?.id &&
            (e.isActive ? (
              <Button onClick={() => setConfirming(e)} aria-label={`Nonaktifkan ${e.name}`}>
                Nonaktifkan
              </Button>
            ) : (
              <Button
                loading={busyId === e.id}
                onClick={() => void activate(e)}
                aria-label={`Aktifkan kembali ${e.name}`}
              >
                Aktifkan
              </Button>
            ))}
        </div>
      ),
    },
  ]

  const departmentOptions = (departments.data ?? []).map((d) => ({ value: d.id, label: d.name }))

  return (
    <>
      <PageHeader
        title="Karyawan"
        description="Data semua karyawan dan HR. Karyawan nonaktif tidak bisa masuk, tetapi riwayatnya tetap tersimpan."
        actions={
          <LinkButton to="/hr/employees/new" variant="primary">
            Tambah karyawan
          </LinkButton>
        }
      />

      {notice && (
        <Alert tone="success" className="mb-4">
          {notice}
        </Alert>
      )}
      {actionError && !confirming && (
        <Alert tone="error" className="mb-4">
          {actionError}
        </Alert>
      )}

      <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-[minmax(0,2fr)_repeat(3,minmax(0,1fr))]">
        <TextField
          label="Cari"
          type="search"
          placeholder="Nama, email, atau kode karyawan"
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
        <Select
          label="Peran"
          placeholder="Semua peran"
          options={ROLE_OPTIONS}
          value={role}
          onChange={(event) => changeFilter(setRole)(event.target.value)}
        />
        <Select
          label="Status"
          placeholder="Semua status"
          options={STATUS_OPTIONS}
          value={status}
          onChange={(event) => changeFilter(setStatus)(event.target.value)}
        />
      </div>

      {filtered && (
        <Button onClick={clearFilters} className="mb-4">
          Hapus filter
        </Button>
      )}

      <Table
        caption="Daftar karyawan"
        columns={columns}
        rows={employees.data?.data ?? []}
        rowKey={(e) => e.id}
        loading={employees.loading}
        loadingText="Memuat data karyawan"
        error={employees.error}
        onRetry={employees.reload}
        empty={
          filtered
            ? 'Tidak ada karyawan yang cocok dengan pencarian atau filter ini. Ubah kata kuncinya atau hapus filter.'
            : 'Belum ada karyawan. Tambahkan karyawan pertama dengan tombol Tambah karyawan.'
        }
      />

      {employees.data && (
        <div className="mt-4">
          <Pagination
            meta={employees.data.meta}
            itemLabel="karyawan"
            onPageChange={setPage}
            disabled={employees.loading}
          />
        </div>
      )}

      <Modal
        open={confirming !== null}
        onClose={closeConfirm}
        title={confirming ? `Nonaktifkan ${confirming.name}?` : 'Nonaktifkan karyawan?'}
        footer={
          <>
            <Button onClick={closeConfirm}>Batal</Button>
            <Button
              variant="danger"
              loading={confirming !== null && busyId === confirming.id}
              onClick={() => confirming && void deactivate(confirming)}
            >
              Nonaktifkan
            </Button>
          </>
        }
      >
        {actionError && confirming && (
          <Alert tone="error" className="mb-4">
            {actionError}
          </Alert>
        )}
        <p className="text-sm">
          {confirming?.name} tidak bisa masuk lagi sampai diaktifkan kembali. Riwayat kehadirannya tetap tersimpan.
        </p>
      </Modal>
    </>
  )
}
