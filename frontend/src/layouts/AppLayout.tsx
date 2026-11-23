import { useEffect, useId, useRef, useState } from 'react'
import { NavLink, Outlet } from 'react-router'
import { Button } from '../components/ui/Button'
import { useAuth } from '../context/AuthContext'
import { cn } from '../lib/cn'
import { Role } from '../types/api'

interface NavGroup {
  label: string
  items: Array<{ to: string; label: string }>
}

const OWN_GROUP: NavGroup = {
  label: 'Kehadiran saya',
  items: [
    { to: '/clock-in', label: 'Catat kehadiran' },
    { to: '/my-attendance', label: 'Riwayat kehadiran' },
  ],
}

const HR_GROUP: NavGroup = {
  label: 'Kelola (HR)',
  items: [
    { to: '/hr/attendance', label: 'Pantau kehadiran' },
    { to: '/hr/employees', label: 'Karyawan' },
  ],
}

const desktopLink = ({ isActive }: { isActive: boolean }) =>
  cn(
    'inline-flex h-14 items-center border-b-2 text-sm transition-colors',
    isActive ? 'border-brand font-medium text-ink' : 'border-transparent text-muted hover:border-line-strong hover:text-ink',
  )

const mobileLink = ({ isActive }: { isActive: boolean }) =>
  cn(
    'flex min-h-11 items-center rounded-control px-3 text-base',
    isActive ? 'bg-brand-soft font-medium text-brand' : 'text-body hover:bg-canvas active:bg-line',
  )

export function AppLayout() {
  const { user, logout } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuButtonRef = useRef<HTMLButtonElement>(null)
  const menuId = useId()

  useEffect(() => {
    if (!menuOpen) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      setMenuOpen(false)
      menuButtonRef.current?.focus()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [menuOpen])

  if (!user) return null

  const groups = user.role === Role.HR ? [HR_GROUP, OWN_GROUP] : [OWN_GROUP]
  const closeMenu = () => setMenuOpen(false)

  return (
    <div className="min-h-dvh">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-10 focus:rounded-control focus:bg-surface focus:px-4 focus:py-2 focus:text-ink"
      >
        Lewati ke konten utama
      </a>

      <div className="h-1 bg-brand" />

      <header className="border-b border-line bg-surface">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-8 px-4 lg:px-6">
          <span className="whitespace-nowrap text-base font-medium text-ink">WFH Attendance</span>

          <nav aria-label="Menu utama" className="hidden h-full items-center gap-6 lg:flex">
            {groups.map((group, index) => (
              <div key={group.label} className="flex h-full items-center gap-6">
                {index > 0 && <span aria-hidden="true" className="h-5 w-px bg-line" />}
                <ul aria-label={group.label} className="flex h-full items-center gap-5">
                  {group.items.map((item) => (
                    <li key={item.to} className="h-full">
                      <NavLink to={item.to} className={desktopLink}>
                        {item.label}
                      </NavLink>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>

          <div className="ml-auto hidden items-center gap-4 lg:flex">
            <UserLabel name={user.name} code={user.employeeCode} />
            <Button onClick={logout}>Keluar</Button>
          </div>

          <Button
            ref={menuButtonRef}
            className="ml-auto lg:hidden"
            aria-expanded={menuOpen}
            aria-controls={menuId}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? 'Tutup menu' : 'Menu'}
          </Button>
        </div>

        {menuOpen && (
          <div id={menuId} className="border-t border-line px-4 pt-3 pb-4 lg:hidden">
            <nav aria-label="Menu utama" className="flex flex-col gap-4">
              {groups.map((group) => (
                <div key={group.label}>
                  {groups.length > 1 && <p className="px-3 pb-1 text-[13px] text-muted">{group.label}</p>}
                  <ul className="flex flex-col gap-1">
                    {group.items.map((item) => (
                      <li key={item.to}>
                        <NavLink to={item.to} className={mobileLink} onClick={closeMenu}>
                          {item.label}
                        </NavLink>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </nav>
            <div className="mt-4 flex items-center justify-between gap-3 border-t border-line pt-4">
              <UserLabel name={user.name} code={user.employeeCode} />
              <Button onClick={logout}>Keluar</Button>
            </div>
          </div>
        )}
      </header>

      <main id="main" className="mx-auto max-w-6xl px-4 py-6 lg:px-6 lg:py-8">
        <Outlet />
      </main>
    </div>
  )
}

function UserLabel({ name, code }: { name: string; code: string }) {
  return (
    <div className="min-w-0 leading-tight">
      <p className="truncate text-sm font-medium text-ink">{name}</p>
      <p className="text-[13px] text-muted tabular-nums">{code}</p>
    </div>
  )
}
