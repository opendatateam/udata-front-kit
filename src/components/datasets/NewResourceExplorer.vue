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
  // Route name to come back to when exiting the fullscreen explorer (datasets_detail,
  // indicators_detail, ...) - both share object_type: datasets but have distinct pages.
  fromRouteName: {
    type: String,
    default: 'datasets_detail'
  }
})

// FIXME: ResourceExplorer should accept DatasetV2WithFullObject — same upstream bug as ResourceAccordion (see ResourcesList.vue)
// @ts-expect-error dataset prop is typed as DatasetV2, not DatasetV2WithFullObject
const datasetForExplorer: DatasetV2 = props.dataset

// Absolute URL, not a router-relative path: AppLink (used by the button ResourceExplorer
// renders this through) prepends `/${locale}` to any relative string href, since cdata's
// own routes are locale-prefixed - ours aren't, so that would 404 the link.
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
