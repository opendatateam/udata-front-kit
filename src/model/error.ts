import type { ToastOptions } from 'vue3-toastify'

interface ErrorParams extends ToastOptions {
  type: 'error'
  autoClose: boolean
}

export type { ErrorParams }
