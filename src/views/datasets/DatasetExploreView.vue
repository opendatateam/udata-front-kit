<script setup lang="ts">
import { computed, onMounted } from 'vue'
import type { RouteLocationRaw } from 'vue-router'
import { useRoute, useRouter } from 'vue-router'

import ResourceExplorer from '@/components/datasets/ResourceExplorer.vue'
import SkipLinks from '@/components/SkipLinks.vue'
import { useDatasetStore } from '@/store/DatasetStore'
import { useCanonicalUrl, useMeta } from '@/utils/seo'

const route = useRoute()
const router = useRouter()
const itemId = route.params.item_id as string

const datasetStore = useDatasetStore()
const dataset = computed(() => datasetStore.get(itemId))

// Origin route name travels in via query; validated since an unknown name would throw on resolve.
const fromRouteName = computed(() => {
  const from = route.query.from
  return typeof from === 'string' && router.hasRoute(from)
    ? from
    : 'datasets_detail'
})

const exitTo = computed<RouteLocationRaw>(() => {
  const resourceId = route.query.resource_id
  return {
    name: fromRouteName.value,
    params: { item_id: dataset.value?.slug ?? itemId },
    query: typeof resourceId === 'string' ? { resource_id: resourceId } : {}
  }
})

const skipLinks = [
  { id: 'resource-explorer-viewer', text: 'Aller au contenu de la ressource' }
]

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
  <div class="flex h-dvh flex-col overflow-hidden bg-white">
    <SkipLinks :links="skipLinks" />
    <ResourceExplorer
      v-if="dataset"
      :dataset="dataset"
      fullscreen
      :exit-to="exitTo"
      :from-route-name="fromRouteName"
    />
  </div>
</template>
