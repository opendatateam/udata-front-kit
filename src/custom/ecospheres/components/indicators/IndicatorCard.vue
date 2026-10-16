<script setup lang="ts">
import { RiBarChart2Line } from '@remixicon/vue'
import type { RouteLocationRaw } from 'vue-router'

import ObjectCardLayout from '@/components/ObjectCardLayout.vue'
import type { Indicator } from '../../model/indicator'
import IndicatorTags from './IndicatorTags.vue'

const props = defineProps<{
  dataset: Indicator
  // declared to avoid attribute fallthrough, the slug-based url below is used instead
  datasetUrl?: RouteLocationRaw
  organizationUrl?: RouteLocationRaw | null
  showDescription?: boolean
}>()

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
    :show-description="showDescription ?? true"
  >
    <template #footer>
      <IndicatorTags :indicator="dataset" />
    </template>
  </ObjectCardLayout>
</template>
