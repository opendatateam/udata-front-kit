<script setup lang="ts">
import type { DatasetV2 } from '@datagouv/components-next'
import { ResourceExplorer } from '@datagouv/components-next'
import { computed, onErrorCaptured, onMounted, ref } from 'vue'
import type { RouteLocationRaw } from 'vue-router'
import { useRoute } from 'vue-router'

import BlankState from '@/components/BlankState.vue'
import { useDatasetStore } from '@/store/DatasetStore'
import { useMeta } from '@/utils/seo'

// Plain useRoute, not useRouteParamsAsString: exitTo must stay reactive to resource_id, rewritten by ResourceExplorer on every switch.
const route = useRoute()
const itemId = route.params.item_id as string

const datasetStore = useDatasetStore()
const dataset = computed(() => datasetStore.get(itemId))

// FIXME: ResourceExplorer should accept DatasetV2WithFullObject — same upstream bug as ResourceAccordion (see ResourcesList.vue)
const datasetForExplorer = computed(
  () => dataset.value as unknown as DatasetV2 | undefined
)

// Origin route name and resource_id travel in via query, to carry the visitor back to where they were.
const exitTo = computed<RouteLocationRaw>(() => {
  const fromRouteName =
    typeof route.query.from === 'string' ? route.query.from : 'datasets_detail'
  const resourceId = route.query.resource_id
  return {
    name: fromRouteName,
    params: { item_id: dataset.value?.slug ?? itemId },
    query: typeof resourceId === 'string' ? { resource_id: resourceId } : {}
  }
})

const loadError = ref(false)
onErrorCaptured(() => {
  loadError.value = true
  return false
})

useMeta({
  title: () => dataset.value?.title,
  description: () => dataset.value?.description,
  canonicalUrl: () => dataset.value?.page,
  noIndex: () => true
})

onMounted(() => {
  datasetStore
    .load(itemId, { toasted: false, redirectNotFound: true })
    .catch((err: unknown) => console.error('Failed to load dataset:', err))
})
</script>

<template>
  <div class="flex h-dvh flex-col overflow-hidden bg-white">
    <BlankState
      v-if="loadError"
      image="/static/blank_state/file.svg"
      message="Une erreur est survenue lors du chargement des ressources."
    />
    <Suspense v-else-if="datasetForExplorer">
      <ResourceExplorer
        :dataset="datasetForExplorer"
        fullscreen
        :exit-to="exitTo"
        no-results-image="/static/blank_state/file.svg"
      />
      <template #fallback>
        <div class="fr-py-4w" role="status">Chargement de l'explorateur…</div>
      </template>
    </Suspense>
  </div>
</template>
