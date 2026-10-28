import axios, { AxiosError } from 'axios'
import type { ApiFieldErrors } from '@/types'

interface ApiErrorPayload {
  message?: string
  errors?: ApiFieldErrors
}

export class ApiError extends Error {
  status: number | null
  errors: ApiFieldErrors

  constructor(message: string, status: number | null = null, errors: ApiFieldErrors = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.errors = errors
  }
}

const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api/v1',
  timeout: 15000,
  headers: {
    Accept: 'application/json',
  },
})

http.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorPayload>) => {
    if (!error.response) {
      return Promise.reject(
        new ApiError(
          'No se pudo conectar con el servidor. Verifica que la API esté en ejecución.',
        ),
      )
    }

    const { status, data } = error.response
    const fallbackMessage =
      status >= 500
        ? 'Ocurrió un error interno en el servidor. Inténtalo nuevamente.'
        : 'No se pudo completar la solicitud.'

    return Promise.reject(
      new ApiError(data?.message || fallbackMessage, status, data?.errors ?? {}),
    )
  },
)

export default http
