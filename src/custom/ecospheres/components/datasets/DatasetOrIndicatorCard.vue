<script setup lang="ts">
import IndicatorDatasetCard from '@/custom/ecospheres/components/indicators/IndicatorDatasetCard.vue'
import { isIndicator } from '@/custom/ecospheres/utils/indicator'
import type { DatasetV2 } from '@datagouv/components-next'
import { DatasetCard } from '@datagouv/components-next'
import { toRef } from 'vue'

const props = defineProps<{
  dataset: DatasetV2
  datasetUrl: object
  organizationUrl?: string | object
}>()

const datasetIsIndicator = isIndicator(toRef(props, 'dataset'))
</script>

<template>
  <IndicatorDatasetCard
    v-if="datasetIsIndicator"
    :key="dataset.id"
    :dataset="dataset"
  />
  <DatasetCard
    v-else
    :key="dataset.id"
    :dataset="dataset"
    :dataset-url="datasetUrl"
    :organization-url="organizationUrl"
  />
</template>
