import { toast } from '@datagouv/components-next'
import type { AxiosError } from 'axios'

export const toastHttpError = (error: AxiosError): void => {
  const msg = `${error.message} (${error.response?.status})`
  toast.error(msg, { duration: Infinity, closeButton: true })
}
