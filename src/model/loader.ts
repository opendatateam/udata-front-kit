import type { PluginApi as Loading } from 'vue-loading-overlay'

interface Loader {
  hide: () => void
}

interface LoadingParams {
  canCancel: boolean
  lockScroll?: boolean
}

export type { Loader, Loading, LoadingParams }
