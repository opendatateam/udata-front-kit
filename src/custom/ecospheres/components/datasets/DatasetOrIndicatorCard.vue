<script setup lang="ts">
import { isIndicator } from '@/custom/ecospheres/utils/indicator'
import type { DatasetV2 } from '@datagouv/components-next'
import { DatasetCard } from '@datagouv/components-next'
import { toRef } from 'vue'
import IndicatorInDatasetListCard from './IndicatorInDatasetListCard.vue'

const props = defineProps<{
  dataset: DatasetV2
  datasetUrl: object
  organizationUrl?: string | object
}>()

const datasetIsIndicator = isIndicator(toRef(props, 'dataset'))

const indicatorUrl = computed(() => ({
  name: 'indicators_detail',
  params: { item_id: props.dataset.id }
}))
</script>

<template>
  <IndicatorInDatasetListCard
    v-if="datasetIsIndicator"
    :key="dataset.id"
    :dataset="dataset"
    :dataset-url="indicatorUrl"
    :organization-url="organizationUrl"
  />
  <DatasetCard
    v-else
    :key="dataset.id"
    :dataset="dataset"
    :dataset-url="datasetUrl"
    :organization-url="organizationUrl"
  />
</template>
