<script lang="ts" setup>
import {
  DatasetCard,
  type DatasetV2,
  type DatasetV2WithFullObject
} from '@datagouv/components-next'
import { computed, onMounted, ref } from 'vue'

import { loadDataset } from '@/custom/justice/utils/dataset'

const props = defineProps<{
  title?: string
  sourceId: string
  source?: string
  datasetId: string
}>()

const dataset = ref<DatasetV2WithFullObject | null>(null)

const datasetUrl = computed(() =>
  dataset.value
    ? { name: 'datasets_detail', params: { item_id: dataset.value.slug } }
    : undefined
)

const datasetForCard = computed((): DatasetV2 | null => {
  if (!dataset.value) return null
  // FIXME: DatasetCard should accept DatasetV2WithFullObject — upstream bug in @datagouv/components-next
  // @ts-expect-error dataset prop is typed as Dataset | DatasetV2, not DatasetV2WithFullObject
  return dataset.value
})

onMounted(async () => {
  dataset.value = await loadDataset(props.datasetId)
})
</script>

<template>
  <article class="panel fr-p-3w">
    <h3 v-if="title">{{ title }}</h3>
    <slot />
    <div class="sources fr-pt-2w">
      <DsfrAccordion
        :id="sourceId"
        title="Sources et description"
        title-tag="h4"
      >
        <slot name="source">
          <p v-if="source">{{ source }}</p>
        </slot>
        <DatasetCard
          v-if="datasetForCard && datasetUrl"
          class="fr-mt-2w"
          :dataset="datasetForCard"
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
  background: var(--background-default-grey);
  border: 1px solid var(--border-default-grey);
}

h3 {
  font-size: 1.25rem;
  text-wrap: balance;
}

.sources {
  margin-top: auto;
}
</style>
