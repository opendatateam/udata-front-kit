<script setup lang="ts">
import type { DatasetV2 } from '@datagouv/components-next'
import { RiBarChart2Line } from '@remixicon/vue'
import type { RouteLocationRaw } from 'vue-router'

import ObjectCardLayout from '@/components/ObjectCardLayout.vue'
import type { TitleTag } from '@/model'
import type { Indicator } from '../../model/indicator'
import { useIndicatorTags } from '../../utils/indicator'
import IndicatorTags from './IndicatorTags.vue'

const props = withDefaults(
  defineProps<{
    dataset: Indicator | DatasetV2
    // passed by UnifiedSearchView but unused, `url` links by slug instead; declared to avoid attribute fallthrough
    datasetUrl?: RouteLocationRaw
    organizationUrl?: RouteLocationRaw | null
    showDescription?: boolean
    showTags?: boolean
    titleTag?: TitleTag
  }>(),
  {
    datasetUrl: undefined,
    organizationUrl: undefined,
    showDescription: true,
    showTags: true,
    titleTag: undefined
  }
)

const tags = useIndicatorTags(() => props.dataset)

const url = computed(() => ({
  name: 'indicators_detail',
  params: { item_id: props.dataset.slug }
}))
</script>

<template>
  <ObjectCardLayout
    :url="url"
    :title="dataset.title"
    :icon="RiBarChart2Line"
    :organization="dataset.organization"
    :owner="dataset.owner"
    :organization-url="organizationUrl"
    :last-update="dataset.last_update"
    :description="dataset.description"
    :show-description="showDescription"
    :title-tag="titleTag"
  >
    <template v-if="showTags && tags.length > 0" #footer>
      <IndicatorTags :tags="tags" />
    </template>
  </ObjectCardLayout>
</template>
