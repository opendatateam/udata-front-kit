<script setup lang="ts">
import { DatasetCard } from '@etalab/data.gouv.fr-components'
import { type DatasetV2 } from '@etalab/data.gouv.fr-components'
import { ref, onMounted, type Ref } from 'vue'

import { useDatasetStore } from '@/store/DatasetStore'

const props = defineProps({
  datasetId: {
    type: String,
    required: true
  }
})

const dataset: Ref<DatasetV2 | undefined> = ref()

onMounted(() => {
  useDatasetStore()
    .load(props.datasetId)
    .then((d) => {
      dataset.value = d
    })
})
</script>

<template>
  <DatasetCard
    v-if="dataset"
    :dataset="dataset"
    :dataset-url="{ name: 'dataset_detail', params: { did: dataset.id } }"
  />
</template>
