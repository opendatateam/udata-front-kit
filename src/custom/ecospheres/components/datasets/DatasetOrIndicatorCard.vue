<script setup lang="ts">
import { isIndicator } from '@/custom/ecospheres/utils/indicator'
import type { DatasetV2 } from '@datagouv/components-next'
import { DatasetCard } from '@datagouv/components-next'
import { toRef } from 'vue'

const props = defineProps<{
  dataset: DatasetV2
  datasetUrl: object
  organizationUrl?: string | object
  showDescription?: boolean
}>()

const datasetIsIndicator = isIndicator(toRef(props, 'dataset'))

const url = computed(() =>
  datasetIsIndicator.value
    ? { name: 'indicators_detail', params: { item_id: props.dataset.id } }
    : props.datasetUrl
)
</script>

<template>
  <div :class="{ 'indicator-card-wrapper': datasetIsIndicator }">
    <p
      v-if="datasetIsIndicator"
      class="fr-badge fr-badge--sm fr-badge--mention-grey text-grey-425 indicator-badge"
    >
      <span
        class="fr-icon-lightbulb-line fr-icon--sm"
        aria-hidden="true"
      ></span>
      Indicateur
    </p>
    <DatasetCard
      :dataset="dataset"
      :dataset-url="url"
      :organization-url="organizationUrl"
      :show-description="showDescription ?? true"
    />
  </div>
</template>

<style scoped>
.indicator-card-wrapper {
  position: relative;
}

.indicator-badge {
  position: absolute;
  top: 0;
  left: 0.5rem;
  transform: translateY(-50%);
  z-index: 1;
}
</style>
