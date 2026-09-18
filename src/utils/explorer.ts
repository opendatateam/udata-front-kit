import type {
  CommunityResource,
  Dataset,
  DatasetV2,
  Resource
} from '@datagouv/components-next'
import { useStorage } from '@vueuse/core'
import { computed } from 'vue'
import type { Router } from 'vue-router'

import { useDatasetsConf } from '@/utils/config'

// Lazy: this module loads on every page (router/index.ts imports it for the /explore guard), so a module-scope useStorage() would read localStorage eagerly everywhere.
let stored: ReturnType<typeof useStorage<boolean>>

export function useResourceExplorer() {
  stored ??= useStorage('resources_explorer_enabled', false)
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

// "Copier le lien" target: the resource's standard page on this site, instead of upstream's data.gouv.fr link.
export function buildResourceExternalUrl(
  router: Router,
  dataset:
    | Dataset
    | DatasetV2
    | Omit<Dataset, 'resources' | 'community_resources'>,
  fromRouteName: string
) {
  return (resource: Resource | CommunityResource) =>
    `${window.location.origin}${
      router.resolve({
        name: fromRouteName,
        params: { item_id: dataset.slug },
        query: { resource_id: resource.id }
      }).href
    }`
}
