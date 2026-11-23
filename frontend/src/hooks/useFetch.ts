import axios from 'axios'
import { useCallback, useEffect, useState } from 'react'
import { api, getErrorMessage } from '../lib/api'

type Params = Record<string, string | number | undefined>

export interface FetchState<T> {
  data: T | undefined
  error: string | null
  loading: boolean
  reload: () => void
}

function cleanParams(params: Params): Params {
  return Object.fromEntries(Object.entries(params).filter(([, value]) => value !== '' && value !== undefined))
}

export function useFetch<T>(url: string, params: Params | null = {}): FetchState<T> {
  const [data, setData] = useState<T>()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(params !== null)
  const [attempt, setAttempt] = useState(0)

  const key = params === null ? null : JSON.stringify(cleanParams(params))

  useEffect(() => {
    if (key === null) return
    const controller = new AbortController()
    setLoading(true)
    setError(null)

    api
      .get<T>(url, { params: JSON.parse(key) as Params, signal: controller.signal })
      .then((response) => setData(response.data))
      .catch((err: unknown) => {
        if (!axios.isCancel(err)) setError(getErrorMessage(err))
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })

    return () => controller.abort()
  }, [url, key, attempt])

  const reload = useCallback(() => setAttempt((n) => n + 1), [])

  return { data, error, loading, reload }
}
