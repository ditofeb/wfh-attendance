import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { api, UNAUTHORIZED_EVENT } from '../lib/api'
import { clearToken, getToken, onTokenChangedInOtherTab, setToken } from '../lib/token'
import type { AuthUser, LoginResponse } from '../types/api'

interface AuthContextValue {
  user: AuthUser | null
  loading: boolean
  login: (email: string, password: string) => Promise<AuthUser>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(() => getToken() !== null)

  useEffect(() => {
    if (!getToken()) return
    let ignore = false
    api
      .get<AuthUser>('/auth/me')
      .then((res) => {
        if (!ignore) setUser(res.data)
      })
      .catch(() => {})
      .finally(() => {
        if (!ignore) setLoading(false)
      })
    return () => {
      ignore = true
    }
  }, [])

  useEffect(() => {
    const onUnauthorized = () => setUser(null)
    window.addEventListener(UNAUTHORIZED_EVENT, onUnauthorized)
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, onUnauthorized)
  }, [])

  useEffect(
    () =>
      onTokenChangedInOtherTab((token) => {
        if (!token) {
          setUser(null)
          return
        }
        api
          .get<AuthUser>('/auth/me')
          .then((res) => setUser(res.data))
          .catch(() => setUser(null))
      }),
    [],
  )

  const login = useCallback(async (email: string, password: string) => {
    const res = await api.post<LoginResponse>('/auth/login', { email, password })
    setToken(res.data.accessToken)
    try {
      const me = await api.get<AuthUser>('/auth/me')
      setUser(me.data)
      return me.data
    } catch (error) {
      clearToken()
      throw error
    }
  }, [])

  const logout = useCallback(() => {
    clearToken()
    setUser(null)
  }, [])

  const value = useMemo(() => ({ user, loading, login, logout }), [user, loading, login, logout])

  return <AuthContext value={value}>{children}</AuthContext>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
