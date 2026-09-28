<script setup lang="ts">
import type { Dataset } from '@datagouv/components-next'
import { DatasetCard } from '@datagouv/components-next'
import { onMounted, ref } from 'vue'

import { useDatasetStore } from '@/store/OrganizationDatasetStore'

const datasetStore = useDatasetStore()

const props = defineProps({
  subsection: {
    type: Object,
    required: true
  }
})

const fetchedDatasets = ref<Dataset[]>([])

const loadDatasets = async () => {
  fetchedDatasets.value = await datasetStore.loadMultipleByIds(
    props.subsection.datasets
  )
}

const zIndex = (key: number) => {
  return { zIndex: fetchedDatasets.value.length - key }
}

const getDatasetPage = (id: string) => {
  return { name: 'datasets_detail', params: { item_id: id } }
}

onMounted(() => {
  loadDatasets()
})
</script>

<template>
  <div>
    <h3 v-if="subsection.title">{{ subsection.title }}</h3>
    <DatasetCard
      v-for="(d, index) in fetchedDatasets"
      :key="d.id"
      :style="zIndex(index)"
      :dataset="d"
      :dataset-url="getDatasetPage(d.id)"
      :organization-url="null"
    />
  </div>
</template>
