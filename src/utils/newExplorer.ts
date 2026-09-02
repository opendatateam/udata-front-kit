import { useStorage } from '@vueuse/core'

// Feature flag for the new resource navigation, shared across consumers and persisted in localStorage.
const enabled = useStorage('new_explorer', false)

export function useNewExplorer() {
  return { enabled, setEnabled: (value: boolean) => (enabled.value = value) }
}
