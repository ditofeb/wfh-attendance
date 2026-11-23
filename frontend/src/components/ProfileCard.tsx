import { cn } from '../lib/cn'
import { ROLE_LABEL } from '../lib/labels'
import type { AuthUser } from '../types/api'

interface ProfileCardProps {
  user: AuthUser
  className?: string
}

export function ProfileCard({ user, className }: ProfileCardProps) {
  return (
    <section aria-labelledby="profile-heading" className={cn('rounded-control border border-line bg-surface p-5', className)}>
      <h2 id="profile-heading" className="text-sm text-muted">
        Profil Anda
      </h2>
      <p className="mt-2 font-medium text-ink">{user.name}</p>
      <p className="text-[13px] text-muted tabular-nums">{user.employeeCode}</p>

      <dl className="mt-4 flex flex-col gap-2 border-t border-line pt-3 text-sm">
        <ProfileRow label="Jabatan" value={user.position} />
        <ProfileRow label="Departemen" value={user.department} />
        <ProfileRow label="Peran" value={ROLE_LABEL[user.role]} />
      </dl>
    </section>
  )
}

function ProfileRow({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <dt className="text-muted">{label}</dt>
      <dd className={value ? 'text-body' : 'text-muted'}>{value ?? 'Belum diisi oleh HR'}</dd>
    </div>
  )
}
