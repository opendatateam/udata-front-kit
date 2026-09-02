<script setup lang="ts">
import type { DatasetV2WithFullObject } from '@datagouv/components-next'
import { BannerAction, BrandedButton } from '@datagouv/components-next'
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import NewResourceExplorer from '@/components/datasets/NewResourceExplorer.vue'
import ResourcesList from '@/components/datasets/ResourcesList.vue'
import { useDatasetsConf } from '@/utils/config'
import { useNewExplorer } from '@/utils/newExplorer'

defineProps({
  dataset: {
    type: Object as () => DatasetV2WithFullObject,
    required: true
  },
  noFileMessage: {
    type: String,
    default: "Il n'y a pas encore de fichier pour ce jeu de données."
  }
})

const route = useRoute()
const router = useRouter()
const datasetsConf = useDatasetsConf()
const { enabled: newExplorerCookieEnabled, setEnabled: setNewExplorerEnabled } =
  useNewExplorer()
// The toggle only exists on tenants opted into the spike; other tenants keep the
// classic ResourcesList regardless of a stale cookie from a previous visit.
const newExplorerEnabled = computed(
  () =>
    datasetsConf.new_explorer_enabled === true && newExplorerCookieEnabled.value
)

// Going back to the old navigation drops ?resource_id: it doesn't carry the same
// meaning there.
function toggleNewExplorer() {
  const enable = !newExplorerEnabled.value
  setNewExplorerEnabled(enable)
  if (!enable && route.query.resource_id) {
    const { resource_id, ...query } = route.query
    router.replace({ query })
  }
}
</script>

<template>
  <BannerAction
    v-if="datasetsConf.new_explorer_enabled"
    class="fr-mb-2w"
    type="primary"
    :title="
      newExplorerEnabled
        ? 'Vous testez la nouvelle navigation dans les ressources'
        : 'Une nouvelle navigation dans les ressources est disponible'
    "
  >
    <template #button>
      <BrandedButton size="xs" color="secondary" @click="toggleNewExplorer">
        {{
          newExplorerEnabled
            ? "Revenir sur l'ancienne navigation"
            : 'Tester la nouvelle navigation'
        }}
      </BrandedButton>
    </template>
  </BannerAction>
  <NewResourceExplorer v-if="newExplorerEnabled" :dataset="dataset" />
  <ResourcesList v-else :dataset="dataset" :no-file-message="noFileMessage" />
</template>
