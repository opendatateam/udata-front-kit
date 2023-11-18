/*
 * @fileoverview A collection of higher-order components (HOCs) that can be
 * used to wrap components to provide additional functionality.
 */
import { toast } from 'vue3-toastify'
import { useLoading } from 'vue-loading-overlay'

type fn<T> = (...args: any[]) => Promise<T>

interface Loader {
  hide: () => void
}

function withLoading<T>(fn: fn<T>): fn<T> {
  return async function (...args: any[]): Promise<T> {
    const loader: Loader = useLoading().show()

    return await fn(...args)
      .then((response: T) => response)
      .catch((error) => error)
      .finally(() => {
        loader.hide()
      })
  }
}

function withToaster<T>(fn: fn<T>): fn<T> {
  return async function (...args: any[]): Promise<T> {
    return await fn(...args)
      .then((response: T) => response)
      .catch((error) => {
        toast(error.message, { type: 'error', autoClose: false })
        return error
      })
  }
}

export { withLoading, withToaster }
