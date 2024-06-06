import type { AxiosError } from 'axios'
import { toast } from 'vue3-toastify'

export const toastHttpError = (error: AxiosError): void => {
  const msg = `${error.message} (${error.response?.status})`
  toast(msg, { type: 'error', autoClose: false })
}
