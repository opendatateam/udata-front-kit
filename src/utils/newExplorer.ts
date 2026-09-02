import { useStorage } from '@vueuse/core'
import { computed } from 'vue'

import { useDatasetsConf } from '@/utils/config'

// Feature flag for the new resource navigation, shared across consumers and persisted in localStorage.
const stored = useStorage('new_explorer', false)

export function useNewExplorer() {
  // Whether this site opted into the new explorer at all, independent of the user's own toggle.
  const eligible = computed(
    () => useDatasetsConf().new_explorer_enabled === true
  )
  const enabled = computed(() => eligible.value && stored.value)

  return {
    eligible,
    enabled,
    setEnabled: (value: boolean) => (stored.value = value)
  }
}
