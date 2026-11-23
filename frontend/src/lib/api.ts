import axios from 'axios'
import { clearToken, getToken } from './token'

export const UNAUTHORIZED_EVENT = 'auth:unauthorized'

export const api = axios.create({ baseURL: import.meta.env.VITE_API_URL })

api.interceptors.request.use((config) => {
  const token = getToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (
      axios.isAxiosError(error) &&
      error.response?.status === 401 &&
      error.config?.headers.Authorization
    ) {
      clearToken()
      window.dispatchEvent(new Event(UNAUTHORIZED_EVENT))
    }
    return Promise.reject(error)
  },
)

type StatusMessages = Partial<Record<number, string>>

const DEFAULT_MESSAGES: StatusMessages = {
  400: 'Data yang dikirim belum valid. Periksa kembali isian Anda.',
  401: 'Sesi Anda sudah berakhir. Masuk kembali untuk melanjutkan.',
  403: 'Anda tidak memiliki akses untuk tindakan ini.',
  404: 'Data yang dicari tidak ditemukan.',
  409: 'Data ini bentrok dengan data yang sudah ada.',
  413: 'Ukuran file terlalu besar.',
  503: 'Layanan sedang tidak tersedia. Coba lagi beberapa saat lagi.',
  504: 'Server terlalu lama merespons. Coba lagi.',
}

export function getErrorMessage(error: unknown, overrides: StatusMessages = {}): string {
  if (!axios.isAxiosError(error)) return 'Terjadi kesalahan. Coba lagi.'
  if (!error.response) return 'Tidak dapat terhubung ke server. Periksa koneksi Anda, lalu coba lagi.'

  const { status } = error.response
  return (
    overrides[status] ??
    DEFAULT_MESSAGES[status] ??
    (status >= 500 ? 'Terjadi kesalahan di server. Coba lagi.' : 'Terjadi kesalahan. Coba lagi.')
  )
}

export const fileUrl = (path: string): string => `${import.meta.env.VITE_FILES_URL}/${path}`
