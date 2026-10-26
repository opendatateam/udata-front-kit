<script setup lang="ts">
import CardTypeBadge from '@/components/CardTypeBadge.vue'
import type { TitleTag } from '@/model'
import type { DatasetV2 } from '@datagouv/components-next'
import { DatasetCard } from '@datagouv/components-next'
import { RiBarChart2Line } from '@remixicon/vue'
import { toRef } from 'vue'

import { isIndicator } from '../../utils/indicator'
import IndicatorCard from '../indicators/IndicatorCard.vue'

// same props as DatasetCard, which this component replaces in topics through route meta
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
</script>

<template>
  <CardTypeBadge
    v-if="datasetIsIndicator"
    label="Indicateur"
    :icon="RiBarChart2Line"
    class="indicator-card-wrapper"
  >
    <IndicatorCard
      :dataset="dataset"
      :organization-url="organizationUrl"
      :show-description="showDescriptionShort"
      :show-tags="false"
      :title-tag="titleTag"
    />
  </CardTypeBadge>
  <DatasetCard
    v-else
    :dataset="dataset"
    :dataset-url="datasetUrl"
    :organization-url="organizationUrl"
    :show-description-short="showDescriptionShort"
    :title-tag="titleTag"
  />
</template>
