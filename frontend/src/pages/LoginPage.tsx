import { useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { Navigate, useNavigate } from 'react-router'
import { Alert } from '../components/ui/Alert'
import { Button } from '../components/ui/Button'
import { TextField } from '../components/ui/TextField'
import { useAuth } from '../context/AuthContext'
import { getErrorMessage } from '../lib/api'
import { formatLongDate, todayInJakarta } from '../lib/format'
import { homePathFor } from '../routes/home'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

interface FieldErrors {
  email?: string
  password?: string
}

function validate(email: string, password: string): FieldErrors {
  const errors: FieldErrors = {}
  if (!email) errors.email = 'Masukkan email Anda.'
  else if (!EMAIL_PATTERN.test(email)) errors.email = 'Format email belum benar, contoh: nama@perusahaan.com.'
  if (!password) errors.password = 'Masukkan kata sandi Anda.'
  return errors
}

export function LoginPage() {
  const { user, loading, login } = useAuth()
  const navigate = useNavigate()
  const emailRef = useRef<HTMLInputElement>(null)
  const passwordRef = useRef<HTMLInputElement>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  if (loading) return null
  if (user) return <Navigate to={homePathFor(user.role)} replace />

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const trimmedEmail = email.trim()
    const errors = validate(trimmedEmail, password)
    setFieldErrors(errors)
    setFormError(null)

    if (errors.email) {
      emailRef.current?.focus()
      return
    }
    if (errors.password) {
      passwordRef.current?.focus()
      return
    }

    setSubmitting(true)
    try {
      const loggedIn = await login(trimmedEmail, password)
      navigate(homePathFor(loggedIn.role), { replace: true })
    } catch (error) {
      setFormError(
        getErrorMessage(error, {
          401: 'Email atau kata sandi salah.',
          403: 'Akun Anda sudah dinonaktifkan. Hubungi HR untuk mengaktifkannya kembali.',
        }),
      )
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <title>Masuk · WFH Attendance</title>
      <div className="h-1 bg-brand" />

      <main className="flex flex-1 items-start justify-center px-4 py-12 sm:items-center">
        <div className="w-full max-w-sm">
          <p className="text-sm text-muted">{formatLongDate(todayInJakarta())}</p>
          <h1 className="mt-1 text-2xl font-medium text-ink">Masuk ke WFH Attendance</h1>

          <form
            noValidate
            onSubmit={(event) => void handleSubmit(event)}
            className="mt-8 flex flex-col gap-5 rounded-control border border-line bg-surface p-6"
          >
            {formError && <Alert tone="error">{formError}</Alert>}

            <TextField
              ref={emailRef}
              label="Email"
              type="email"
              inputMode="email"
              autoComplete="username"
              value={email}
              error={fieldErrors.email}
              onChange={(event) => {
                setEmail(event.target.value)
                setFieldErrors((prev) => ({ ...prev, email: undefined }))
              }}
            />

            <TextField
              ref={passwordRef}
              label="Kata sandi"
              type="password"
              autoComplete="current-password"
              value={password}
              error={fieldErrors.password}
              onChange={(event) => {
                setPassword(event.target.value)
                setFieldErrors((prev) => ({ ...prev, password: undefined }))
              }}
            />

            <Button type="submit" variant="primary" loading={submitting} className="w-full">
              {submitting ? 'Memeriksa...' : 'Masuk'}
            </Button>
          </form>
        </div>
      </main>
    </div>
  )
}
