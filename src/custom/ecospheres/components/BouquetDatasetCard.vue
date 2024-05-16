<script setup lang="ts">
import { DatasetCard } from '@etalab/data.gouv.fr-components'
import { type DatasetV2 } from '@etalab/data.gouv.fr-components'
import { ref, watch, toRef, type Ref } from 'vue'

import { useDatasetStore } from '@/store/DatasetStore'

const props = defineProps({
  datasetId: {
    type: String,
    required: true
  }
})

const datasetIdRef = toRef(props, 'datasetId')
const dataset: Ref<DatasetV2 | undefined> = ref()

watch(
  datasetIdRef,
  () => {
    useDatasetStore()
      .load(datasetIdRef.value)
      .then((d) => {
        dataset.value = d
      })
  },
  { immediate: true }
)
</script>

<template>
  <!-- Using :key ensures that the component is recreated when dataset changes
       otherwise, we have a persistence on the thumbnail -->
  <DatasetCard
    v-if="dataset"
    :key="dataset.id"
    :dataset="dataset"
    :dataset-url="{ name: 'dataset_detail', params: { did: dataset.id } }"
    :show-metrics="false"
  />
</template>
