/*
 * @fileoverview A collection of higher-order components (HOCs) that can be
 * used to wrap components to provide additional functionality.
 */
import { toast } from 'vue3-toastify'

type f<T> = (...args: any[]) => Promise<T>

function useWithToaster<T>(fn: f<T>): f<T> {
  return async function (...args: any[]): Promise<T> {
    return await fn(...args)
      .then((response: T) => response)
      .catch((error) => {
        toast(error.message, { type: 'error', autoClose: false })
        return error
      })
  }
}

export { useWithToaster }
