import { useStorage } from '@vueuse/core'
import { computed } from 'vue'

import { useDatasetsConf } from '@/utils/config'

const stored = useStorage('resources_explorer_enabled', false)

// Route name to build resource links against, set by whichever resource list/explorer is
// rendering. A plain object, not provide/inject: this gets read from library computeds that
// can refresh with no active component instance, where inject() throws.
export const resourceLinkContext: { fromRouteName?: string } = {}

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
