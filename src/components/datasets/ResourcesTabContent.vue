<script setup lang="ts">
import type { DatasetV2WithFullObject } from '@datagouv/components-next'
import { BannerAction, BrandedButton } from '@datagouv/components-next'
import { useRoute, useRouter } from 'vue-router'

import ResourceExplorer from '@/components/datasets/ResourceExplorer.vue'
import ResourcesList from '@/components/datasets/ResourcesList.vue'
import { useResourceExplorer } from '@/utils/explorer'

defineProps({
  dataset: {
    type: Object as () => DatasetV2WithFullObject,
    required: true
  },
  noFileMessage: {
    type: String,
    default: "Il n'y a pas encore de fichier pour ce jeu de données."
  },
  fromRouteName: {
    type: String,
    default: 'datasets_detail'
  }
})

const route = useRoute()
const router = useRouter()
const {
  eligible: resourceExplorerEligible,
  enabled: resourceExplorerEnabled,
  setEnabled: setResourceExplorerEnabled
} = useResourceExplorer()

// Drops ?resource_id when reverting: it doesn't carry the same meaning on the old navigation.
function toggleResourceExplorer() {
  const enable = !resourceExplorerEnabled.value
  setResourceExplorerEnabled(enable)
  if (!enable && route.query.resource_id) {
    const { resource_id, ...query } = route.query
    router.replace({ query })
  }
}
</script>

<template>
  <BannerAction
    v-if="resourceExplorerEligible"
    class="fr-mb-2w"
    type="primary"
    :title="
      resourceExplorerEnabled
        ? 'Vous testez la nouvelle navigation dans les ressources'
        : 'Une nouvelle navigation dans les ressources est disponible'
    "
  >
    <template #button>
      <BrandedButton
        size="xs"
        color="secondary"
        @click="toggleResourceExplorer"
      >
        {{
          resourceExplorerEnabled
            ? "Revenir sur l'ancienne navigation"
            : 'Tester la nouvelle navigation'
        }}
      </BrandedButton>
    </template>
  </BannerAction>
  <ResourceExplorer
    v-if="resourceExplorerEnabled"
    :dataset="dataset"
    :from-route-name="fromRouteName"
  />
  <ResourcesList v-else :dataset="dataset" :no-file-message="noFileMessage" />
</template>
