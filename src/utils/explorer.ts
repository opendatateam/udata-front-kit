import { useStorage } from '@vueuse/core'
import { computed } from 'vue'

import { useDatasetsConf } from '@/utils/config'

// Feature flag for the resource explorer, shared across consumers and persisted in localStorage.
const stored = useStorage('resources_explorer_enabled', false)

export function useResourceExplorer() {
  // Whether this site opted into the explorer at all, independent of the user's own toggle.
  const eligible = computed(
    () => useDatasetsConf().resources_explorer_enabled === true
  )
  const enabled = computed(() => eligible.value && stored.value)

  return {
    eligible,
    enabled,
    setEnabled: (value: boolean) => (stored.value = value)
  }
}
