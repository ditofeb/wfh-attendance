import axios from 'axios'
import { useEffect, useRef, useState } from 'react'
import type { FormEvent, ReactNode } from 'react'
import { useNavigate, useParams } from 'react-router'
import { PageHeader } from '../../components/PageHeader'
import { Alert } from '../../components/ui/Alert'
import { Button } from '../../components/ui/Button'
import { LinkButton } from '../../components/ui/LinkButton'
import { Select } from '../../components/ui/Select'
import { Spinner } from '../../components/ui/Spinner'
import { TextField } from '../../components/ui/TextField'
import { useAuth } from '../../context/AuthContext'
import { useFetch } from '../../hooks/useFetch'
import type { FetchState } from '../../hooks/useFetch'
import { api, getErrorMessage } from '../../lib/api'
import { ROLE_OPTIONS, STATUS_OPTIONS } from '../../lib/labels'
import { Role } from '../../types/api'
import type { Department, Employee } from '../../types/api'

export function EmployeeFormPage() {
  const { id } = useParams()
  const isEdit = id !== undefined
  const employee = useFetch<Employee>(`/employees/${id ?? ''}`, isEdit ? {} : null)
  const departments = useFetch<Department[]>('/departments')

  const current = isEdit && employee.data?.id === id ? employee.data : undefined

  let content: ReactNode
  if (isEdit && !current) {
    content = employee.error ? (
      <Alert
        tone="error"
        action={
          <div className="flex flex-wrap gap-2">
            <Button onClick={employee.reload}>Coba lagi</Button>
            <LinkButton to="/hr/employees">Kembali ke daftar karyawan</LinkButton>
          </div>
        }
      >
        {employee.error}
      </Alert>
    ) : (
      <p role="status" className="inline-flex items-center gap-2 text-sm text-body">
        <Spinner />
        Memuat data karyawan
      </p>
    )
  } else {
    content = <EmployeeForm key={current?.id ?? 'new'} employee={current} departments={departments} />
  }

  return (
    <>
      <PageHeader
        title={isEdit ? 'Ubah data karyawan' : 'Tambah karyawan'}
        description={
          current
            ? `${current.name}, kode ${current.employeeCode}`
            : isEdit
              ? undefined
              : 'Kode karyawan dibuat otomatis setelah data disimpan.'
        }
      />
      {content}
    </>
  )
}

interface FormValues {
  name: string
  email: string
  password: string
  role: Role
  position: string
  departmentId: string
  phone: string
  isActive: boolean
}

type FormErrors = Partial<Record<keyof FormValues, string>>

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_PATTERN = /^[0-9+\-\s()]{6,20}$/

function toValues(employee?: Employee): FormValues {
  return {
    name: employee?.name ?? '',
    email: employee?.email ?? '',
    password: '',
    role: employee?.role ?? Role.EMPLOYEE,
    position: employee?.position ?? '',
    departmentId: employee?.departmentId ?? '',
    phone: employee?.phone ?? '',
    isActive: employee?.isActive ?? true,
  }
}

function validate(values: FormValues, isEdit: boolean): FormErrors {
  const errors: FormErrors = {}
  const name = values.name.trim()
  const email = values.email.trim()
  const phone = values.phone.trim()

  if (!name) errors.name = 'Masukkan nama karyawan.'
  else if (name.length > 100) errors.name = 'Nama maksimal 100 karakter.'

  if (!email) errors.email = 'Masukkan email karyawan.'
  else if (!EMAIL_PATTERN.test(email) || email.length > 150)
    errors.email = 'Format email belum benar, contoh: nama@perusahaan.com.'

  if (!isEdit && !values.password) errors.password = 'Masukkan kata sandi awal.'
  else if (values.password && (values.password.length < 8 || values.password.length > 72))
    errors.password = 'Kata sandi harus 8 sampai 72 karakter.'

  if (values.position.trim().length > 100) errors.position = 'Jabatan maksimal 100 karakter.'

  if (phone && !PHONE_PATTERN.test(phone))
    errors.phone = 'Gunakan 6 sampai 20 karakter: angka, spasi, +, -, atau tanda kurung.'

  return errors
}

interface EmployeeFormProps {
  employee?: Employee
  departments: FetchState<Department[]>
}

function EmployeeForm({ employee, departments }: EmployeeFormProps) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const formRef = useRef<HTMLFormElement>(null)
  const isEdit = employee !== undefined
  const isSelf = employee?.id === user?.id

  const [values, setValues] = useState(() => toValues(employee))
  const [errors, setErrors] = useState<FormErrors>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [focusRequest, setFocusRequest] = useState(0)

  useEffect(() => {
    if (focusRequest > 0) formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus()
  }, [focusRequest])

  function set<K extends keyof FormValues>(field: K, value: FormValues[K]) {
    setValues((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFormError(null)

    const found = validate(values, isEdit)
    setErrors(found)
    if (Object.keys(found).length > 0) {
      setFocusRequest((n) => n + 1)
      return
    }

    const payload = {
      name: values.name.trim(),
      email: values.email.trim().toLowerCase(),
      role: values.role,
      position: values.position.trim() || null,
      departmentId: values.departmentId || null,
      phone: values.phone.trim() || null,
      ...(values.password ? { password: values.password } : {}),
      ...(isEdit && !isSelf ? { isActive: values.isActive } : {}),
    }

    setSaving(true)
    try {
      const saved = employee
        ? (await api.patch<Employee>(`/employees/${employee.id}`, payload)).data
        : (await api.post<Employee>('/employees', payload)).data

      const notice = employee
        ? `Perubahan data ${saved.name} disimpan.`
        : `${saved.name} ditambahkan dengan kode ${saved.employeeCode}.`
      void navigate('/hr/employees', { state: { notice } })
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 409) {
        setErrors({ email: 'Email ini sudah dipakai karyawan lain.' })
        setFocusRequest((n) => n + 1)
      } else {
        setFormError(getErrorMessage(error, { 404: 'Karyawan ini tidak ditemukan.' }))
      }
      setSaving(false)
    }
  }

  const departmentOptions = (departments.data ?? []).map((d) => ({ value: d.id, label: d.name }))

  return (
    <form
      ref={formRef}
      noValidate
      onSubmit={(event) => void handleSubmit(event)}
      className="flex max-w-3xl flex-col gap-6"
    >
      {formError && <Alert tone="error">{formError}</Alert>}

      <FormSection title="Data diri">
        <TextField
          label="Nama lengkap"
          autoComplete="off"
          maxLength={100}
          value={values.name}
          error={errors.name}
          onChange={(event) => set('name', event.target.value)}
          className="sm:col-span-2"
        />
        <TextField
          label="Email"
          type="email"
          inputMode="email"
          autoComplete="off"
          value={values.email}
          error={errors.email}
          onChange={(event) => set('email', event.target.value)}
        />
        <TextField
          label="Nomor telepon"
          type="tel"
          optional
          hint="Contoh: 0812 3456 7890"
          value={values.phone}
          error={errors.phone}
          onChange={(event) => set('phone', event.target.value)}
        />
      </FormSection>

      <FormSection title="Pekerjaan">
        <TextField
          label="Jabatan"
          optional
          maxLength={100}
          placeholder="Contoh: Staf Keuangan"
          value={values.position}
          error={errors.position}
          onChange={(event) => set('position', event.target.value)}
        />
        <Select
          label="Departemen"
          optional
          placeholder={departments.loading ? 'Memuat departemen...' : 'Tanpa departemen'}
          options={departmentOptions}
          value={values.departmentId}
          disabled={departments.loading}
          hint={departments.error ? 'Daftar departemen belum bisa dimuat. Muat ulang halaman untuk mencoba lagi.' : undefined}
          onChange={(event) => set('departmentId', event.target.value)}
        />
        <Select
          label="Peran"
          options={ROLE_OPTIONS}
          value={values.role}
          disabled={isSelf}
          hint={
            isSelf
              ? 'Anda tidak bisa mengubah peran akun sendiri.'
              : 'HR bisa mengelola karyawan dan melihat semua kehadiran.'
          }
          onChange={(event) => set('role', event.target.value as Role)}
        />
        {isEdit && (
          <Select
            label="Status"
            options={STATUS_OPTIONS}
            value={String(values.isActive)}
            disabled={isSelf}
            hint={
              isSelf
                ? 'Anda tidak bisa menonaktifkan akun sendiri.'
                : 'Karyawan nonaktif tidak bisa masuk, tetapi riwayatnya tetap tersimpan.'
            }
            onChange={(event) => set('isActive', event.target.value === 'true')}
          />
        )}
      </FormSection>

      <FormSection title={isEdit ? 'Ganti kata sandi' : 'Akses masuk'}>
        <TextField
          label={isEdit ? 'Kata sandi baru' : 'Kata sandi awal'}
          type="password"
          autoComplete="new-password"
          optional={isEdit}
          hint={
            isEdit
              ? 'Kosongkan jika tidak ingin mengubah. Minimal 8 karakter.'
              : 'Minimal 8 karakter. Sampaikan ke karyawan secara langsung.'
          }
          value={values.password}
          error={errors.password}
          onChange={(event) => set('password', event.target.value)}
        />
      </FormSection>

      <div className="flex flex-wrap gap-3">
        <Button type="submit" variant="primary" loading={saving}>
          {saving ? 'Menyimpan...' : isEdit ? 'Simpan perubahan' : 'Simpan karyawan'}
        </Button>
        <LinkButton to="/hr/employees">Batal</LinkButton>
      </div>
    </form>
  )
}

function FormSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-control border border-line bg-surface p-5">
      <h2 className="mb-4 text-base font-medium text-ink">{title}</h2>
      <div className="grid gap-4 sm:grid-cols-2">{children}</div>
    </section>
  )
}
