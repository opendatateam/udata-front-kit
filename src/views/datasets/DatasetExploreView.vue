<script setup lang="ts">
import type { DatasetV2 } from '@datagouv/components-next'
import { ResourceExplorer } from '@datagouv/components-next'
import {
  computed,
  nextTick,
  onErrorCaptured,
  onMounted,
  ref,
  useTemplateRef
} from 'vue'
import type { RouteLocationRaw } from 'vue-router'
import { useRoute } from 'vue-router'

import BlankState from '@/components/BlankState.vue'
import SkipLinks from '@/components/SkipLinks.vue'
import { useDatasetStore } from '@/store/DatasetStore'
import { useCanonicalUrl, useMeta } from '@/utils/seo'

const route = useRoute()
const itemId = route.params.item_id as string

const datasetStore = useDatasetStore()
const dataset = computed(() => datasetStore.get(itemId))

// FIXME: ResourceExplorer should accept DatasetV2WithFullObject — same upstream bug as ResourceAccordion (see ResourcesList.vue)
const datasetForExplorer = computed(
  () => dataset.value as unknown as DatasetV2 | undefined
)

// Origin route name and resource_id travel in via query, to carry the user back to where they were.
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

const skipLinks = [
  { id: 'resource-explorer-viewer', text: 'Aller au contenu de la ressource' }
]
const explorerContainer = useTemplateRef<HTMLElement>('explorerContainer')

// FIXME: fragile DOM patch, remove once ResourceExplorer exposes a stable id/landmark on its viewer region upstream
// https://github.com/datagouv/cdata/pull/1216
function attachViewerSkipTarget() {
  nextTick(() => {
    // Anchored on the sidebar's <aside> tag, the only unique hook — utility classes like flex-1/min-w-0 are reused elsewhere (e.g. the search input).
    const sidebar = explorerContainer.value?.querySelector('aside')
    sidebar?.parentElement?.nextElementSibling?.setAttribute(
      'id',
      'resource-explorer-viewer'
    )
  })
}

useMeta({
  title: () => `Explorateur — ${dataset.value?.title}`,
  description: () => dataset.value?.description,
  canonicalUrl: useCanonicalUrl()
})

onMounted(() => {
  datasetStore
    .load(itemId, { toasted: false, redirectNotFound: true })
    .catch((err: unknown) => console.error('Failed to load dataset:', err))
})
</script>

<template>
  <div
    ref="explorerContainer"
    class="flex h-dvh flex-col overflow-hidden bg-white"
  >
    <SkipLinks :links="skipLinks" />
    <BlankState
      v-if="loadError"
      image="/static/blank_state/file.svg"
      message="Une erreur est survenue lors du chargement des ressources."
    />
    <Suspense v-else-if="datasetForExplorer" @resolve="attachViewerSkipTarget">
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
