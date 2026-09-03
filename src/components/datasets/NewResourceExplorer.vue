<script setup lang="ts">
import type {
  DatasetV2,
  DatasetV2WithFullObject,
  Resource
} from '@datagouv/components-next'
import { ResourceExplorer } from '@datagouv/components-next'
import { onErrorCaptured, ref } from 'vue'
import { useRouter } from 'vue-router'

import BlankState from '@/components/BlankState.vue'

const props = defineProps({
  dataset: {
    type: Object as () => DatasetV2WithFullObject,
    required: true
  },
  // Route to return to on exit: datasets_detail and indicators_detail share object_type but are distinct pages.
  fromRouteName: {
    type: String,
    default: 'datasets_detail'
  }
})

// FIXME: ResourceExplorer should accept DatasetV2WithFullObject — same upstream bug as ResourceAccordion (see ResourcesList.vue)
// @ts-expect-error dataset prop is typed as DatasetV2, not DatasetV2WithFullObject
const datasetForExplorer: DatasetV2 = props.dataset

// Absolute URL, not a relative path: AppLink prepends `/${locale}` to relative hrefs, which would 404 here since our routes aren't locale-prefixed.
const router = useRouter()
const exploreTo = (resource: Resource) =>
  `${window.location.origin}${
    router.resolve({
      name: 'explore',
      params: { item_id: props.dataset.slug },
      query: { resource_id: resource.id, from: props.fromRouteName }
    }).href
  }`

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
