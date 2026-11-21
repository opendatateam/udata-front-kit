<script setup lang="ts">
import CardTypeBadge from '@/components/CardTypeBadge.vue'
import { isIndicator } from '@/custom/ecospheres/utils/indicator'
import type { TitleTag } from '@/model'
import type { DatasetV2 } from '@datagouv/components-next'
import { DatasetCard } from '@datagouv/components-next'
import { RiBarChart2Line } from '@remixicon/vue'
import { toRef } from 'vue'

// same props as DatasetCard, which this component replaces through route meta
const props = withDefaults(
  defineProps<{
    dataset: DatasetV2
    datasetUrl: object
    organizationUrl?: string | object | null
    showDescriptionShort?: boolean
    titleTag?: TitleTag
  }>(),
  {
    organizationUrl: undefined,
    showDescriptionShort: true,
    titleTag: undefined
  }
)

const datasetIsIndicator = isIndicator(toRef(props, 'dataset'))

const url = computed(() =>
  datasetIsIndicator.value
    ? { name: 'indicators_detail', params: { item_id: props.dataset.slug } }
    : props.datasetUrl
)
</script>

<template>
  <CardTypeBadge
    :label="datasetIsIndicator ? 'Indicateur' : undefined"
    :icon="RiBarChart2Line"
    :class="{ 'indicator-card-wrapper': datasetIsIndicator }"
  >
    <DatasetCard
      :dataset="dataset"
      :dataset-url="url"
      :organization-url="organizationUrl"
      :show-description-short="showDescriptionShort"
      :title-tag="titleTag"
    />
  </CardTypeBadge>
</template>
