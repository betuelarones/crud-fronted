import { ApiError } from '@/services/http'

export function errorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message
  }

  if (error instanceof Error && error.message) {
    return error.message
  }

  return 'Ocurrió un error inesperado. Inténtalo nuevamente.'
}
