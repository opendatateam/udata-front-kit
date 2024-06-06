import type { AxiosError } from 'axios'

export const isNotFoundError = (error: AxiosError): boolean => {
  return (
    error.response?.status !== undefined &&
    [410, 404].includes(error.response.status)
  )
}
