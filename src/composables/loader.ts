/*
 * @fileoverview A loading composable.
 */
import { ref } from 'vue'
import type { Ref } from 'vue'
import { useLoading } from 'vue-loading-overlay'
import type { PluginApi } from 'vue-loading-overlay'
import { onBeforeRouteLeave } from 'vue-router'

interface Loader {
  hide: () => void
}

interface LoaderArgs {
  canCancel: boolean
}

type f<T> = (...args: any[]) => Promise<T>

const loading: PluginApi = useLoading()
const loaderArgs: LoaderArgs = { canCancel: true }

function useLoader<T>(fn: f<T>): f<T> {
  const loader: Ref<Loader | null> = ref<Loader | null>(null)

  onBeforeRouteLeave(() => {
    if (loader.value) loader.value.hide()
  })

  return async (...args: any[]): Promise<T> => {
    loader.value = loading.show(loaderArgs)
    return await fn(...args).finally(() => {
      if (loader.value) loader.value.hide()
    })
  }
}

export { useLoader }
