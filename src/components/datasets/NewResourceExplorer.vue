<script setup lang="ts">
import type {
  DatasetV2,
  DatasetV2WithFullObject,
  Resource
} from '@datagouv/components-next'
import { ResourceExplorer } from '@datagouv/components-next'
import { onErrorCaptured, ref } from 'vue'

import BlankState from '@/components/BlankState.vue'
import config from '@/config'

const props = defineProps({
  dataset: {
    type: Object as () => DatasetV2WithFullObject,
    required: true
  }
})

// FIXME: ResourceExplorer should accept DatasetV2WithFullObject — same upstream bug as ResourceAccordion (see ResourcesList.vue)
// @ts-expect-error dataset prop is typed as DatasetV2, not DatasetV2WithFullObject
const datasetForExplorer: DatasetV2 = props.dataset

// Links out to data.gouv.fr's own /explore page instead of us building fullscreen mode here.
const exploreTo = (resource: Resource) =>
  `${config.datagouvfr.base_url}/explore/${props.dataset.slug}?resource_id=${resource.id}`

// Without this, a rejected async resource fetch leaves the Suspense fallback spinning forever.
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
      :explore-to="exploreTo"
    />
    <template #fallback>
      <div class="fr-py-4w" role="status">Chargement de l'explorateur…</div>
    </template>
  </Suspense>
</template>
