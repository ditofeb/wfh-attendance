const KEY = 'wfh_token'

export const getToken = (): string | null => localStorage.getItem(KEY)
export const setToken = (token: string): void => localStorage.setItem(KEY, token)
export const clearToken = (): void => localStorage.removeItem(KEY)

export function onTokenChangedInOtherTab(listener: (token: string | null) => void): () => void {
  const handle = (event: StorageEvent) => {
    if (event.key === KEY || event.key === null) listener(getToken())
  }
  window.addEventListener('storage', handle)
  return () => window.removeEventListener('storage', handle)
}
