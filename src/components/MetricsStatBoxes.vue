<script setup lang="ts">
import type {
  DataserviceMetrics,
  DatasetMetrics
} from '@datagouv/components-next'
import { StatBox, useMetrics } from '@datagouv/components-next'
import { ref, watchEffect } from 'vue'

const props = defineProps<{
  objectId: string
  objectType: 'dataset' | 'dataservice'
}>()

const { getDatasetMetrics, getDataserviceMetrics } = useMetrics()
const metrics = ref<DatasetMetrics | DataserviceMetrics | null>(null)

watchEffect(async () => {
  if (!props.objectId) return
  try {
    switch (props.objectType) {
      case 'dataset':
        metrics.value = await getDatasetMetrics(props.objectId)
        break
      case 'dataservice':
        metrics.value = await getDataserviceMetrics(props.objectId)
        break
      default:
        throw new Error(`Unknown objectType: ${props.objectType}`)
    }
  } catch (error) {
    console.error(`Failed to fetch ${props.objectType} metrics`, error)
    metrics.value = null
  }
})

const visits = computed(() => metrics.value?.visits ?? {})
const visitsTotal = computed(() => metrics.value?.visitsTotal ?? 0)
const downloads = computed(() =>
  'downloads' in (metrics.value ?? {})
    ? (metrics.value as DatasetMetrics).downloads
    : undefined
)
const downloadsTotal = computed(() =>
  'downloadsTotal' in (metrics.value ?? {})
    ? (metrics.value as DatasetMetrics).downloadsTotal
    : undefined
)
</script>

<template>
  <div class="fr-grid-row fr-grid-row--gutters">
    <div class="fr-col-6">
      <StatBox
        title="Vues"
        :data="visits"
        size="sm"
        type="line"
        :summary="visitsTotal"
      />
    </div>
    <div v-if="downloads !== undefined" class="fr-col-6">
      <StatBox
        title="Téléchargements"
        :data="downloads"
        size="sm"
        type="line"
        :summary="downloadsTotal ?? 0"
      />
    </div>
  </div>
</template>
