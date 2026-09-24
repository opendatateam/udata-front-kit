<script setup lang="ts">
import { computed, ref } from 'vue'

import type { GenericElement } from '@/model/topic'

// Bulk-add (organizations, tags) can easily push this list into the dozens
// or hundreds — a flat unfiltered <ul> stops being usable well before
// that. A client-side filter is enough here: this list is already fully
// loaded in memory (see UniverseStore.load()), no need for a server round
// trip just to narrow it down.
const FILTER_THRESHOLD = 8

const props = defineProps<{
  datasets: GenericElement[]
}>()

const emit = defineEmits<{
  remove: [elementId: string]
}>()

const filter = ref('')

const filteredDatasets = computed(() => {
  const needle = filter.value.trim().toLowerCase()
  if (!needle) return props.datasets
  return props.datasets.filter((dataset) =>
    dataset.title.toLowerCase().includes(needle)
  )
})
</script>

<template>
  <div class="universe-dataset-list-wrapper">
    <div class="fr-grid-row fr-grid-row--gutters fr-grid-row--middle fr-mb-1w">
      <div class="fr-col">
        <p class="fr-m-0 fr-text--sm">
          {{ datasets.length }} jeu{{ datasets.length > 1 ? 'x' : '' }} de
          données dans cet univers
        </p>
      </div>
      <div v-if="datasets.length > FILTER_THRESHOLD" class="fr-col-auto">
        <input
          v-model="filter"
          type="search"
          class="fr-input fr-input--sm"
          placeholder="Filtrer par titre…"
          aria-label="Filtrer la liste des jeux de données par titre"
        />
      </div>
    </div>

    <p
      v-if="filter.trim() && filteredDatasets.length === 0"
      class="fr-text--sm"
    >
      Aucun jeu de données ne correspond à « {{ filter }} ».
    </p>

    <ul v-else class="universe-dataset-list">
      <li
        v-for="dataset in filteredDatasets"
        :key="dataset.id"
        class="fr-p-2w fr-mb-1w"
      >
        <span>{{ dataset.title }}</span>
        <button
          type="button"
          class="fr-btn fr-btn--tertiary fr-btn--sm"
          @click="emit('remove', dataset.id!)"
        >
          Retirer
        </button>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.universe-dataset-list {
  list-style: none;
  padding: 0;
  max-height: 24rem;
  overflow-y: auto;
}
.universe-dataset-list li {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-radius: 0.25rem;
  background-color: var(--background-alt-blue-france, #f5f5fe);
  border: 1px solid var(--border-default-grey, #ddd);
}
</style>
