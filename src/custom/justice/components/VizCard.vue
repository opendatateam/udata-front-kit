<script lang="ts" setup>
import { DatasetCard } from '@datagouv/components-next'

import { useJusticeDataset } from '@/custom/justice/utils/dataset'

defineProps<{
  title?: string
  sourceId: string
  source?: string
}>()

const { dataset, datasetUrl } = useJusticeDataset()
</script>

<template>
  <article class="panel">
    <h3 v-if="title">{{ title }}</h3>
    <slot />
    <div class="sources">
      <DsfrAccordion
        :id="sourceId"
        title="Sources et description"
        title-tag="h4"
      >
        <slot name="source">
          <p v-if="source">{{ source }}</p>
        </slot>
        <DatasetCard
          v-if="dataset && datasetUrl"
          class="fr-mt-2w"
          :dataset="dataset"
          :dataset-url="datasetUrl"
          :organization-url="null"
        />
      </DsfrAccordion>
    </div>
  </article>
</template>

<style scoped>
.panel {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  padding: 1.5rem;
  background: var(--background-default-grey, #fff);
  border: 1px solid var(--border-default-grey, #ddd);
}

h3 {
  font-size: 1.25rem;
  text-wrap: balance;
}

.sources {
  margin-top: auto;
  padding-top: 1rem;
}
</style>
