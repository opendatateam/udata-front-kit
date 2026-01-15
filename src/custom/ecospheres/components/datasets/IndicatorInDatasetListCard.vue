<script setup lang="ts">
import type { DatasetV2 } from '@datagouv/components-next'
import { DatasetCard } from '@datagouv/components-next'

defineProps<{
  dataset: DatasetV2
  datasetUrl: object
  organizationUrl?: string | object
}>()
</script>

<template>
  <div class="indicator-card-wrapper">
    <p
      class="fr-badge fr-badge--sm fr-badge--mention-grey text-grey-380 indicator-badge"
    >
      <span
        class="fr-icon-lightbulb-line fr-icon--sm"
        aria-hidden="true"
      ></span>
      Indicateur
    </p>
    <DatasetCard
      :dataset="dataset"
      :dataset-url="datasetUrl"
      :organization-url="organizationUrl"
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
