<script setup lang="ts">
import type {
  DatasetV2,
  DatasetV2WithFullObject
} from '@datagouv/components-next'
import { ResourceExplorer } from '@datagouv/components-next'
import { onErrorCaptured, ref } from 'vue'

import BlankState from '@/components/BlankState.vue'

const props = defineProps({
  dataset: {
    type: Object as () => DatasetV2WithFullObject,
    required: true
  }
})

// FIXME: ResourceExplorer should accept DatasetV2WithFullObject — same upstream bug as
// ResourceAccordion (see ResourcesList.vue)
// @ts-expect-error dataset prop is typed as DatasetV2, not DatasetV2WithFullObject
const datasetForExplorer: DatasetV2 = props.dataset

// ResourceExplorer's setup is async (it awaits its resource fetch): without this, a
// rejected fetch leaves the Suspense fallback spinning forever instead of surfacing.
const loadError = ref(false)
onErrorCaptured(() => {
  loadError.value = true
  return false
})
</script>

<template>
  <BlankState
    v-if="loadError"
    image="/static/blank_state/file.svg"
    message="Une erreur est survenue lors du chargement des ressources."
  />
  <Suspense v-else>
    <ResourceExplorer
      :dataset="datasetForExplorer"
      no-results-image="/static/blank_state/file.svg"
    />
    <template #fallback>
      <div class="fr-py-4w" role="status">Chargement de l'explorateur…</div>
    </template>
  </Suspense>
</template>
