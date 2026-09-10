<script lang="ts" setup>
import type { DatasetV2, DatasetsListBloc } from '@datagouv/components-next'
import { DatasetCard } from '@datagouv/components-next'

import DatasetsAPI from '@/services/api/resources/DatasetsAPI'

const props = defineProps<{
  modelValue: DatasetsListBloc
  edit: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: DatasetsListBloc]
}>()

const datasetsAPI = new DatasetsAPI()
const searchQuery = ref('')
const searchResults = ref<DatasetV2[]>([])
const searchLoading = ref(false)

let searchDebounce: ReturnType<typeof setTimeout> | null = null

const onSearchInput = (e: Event) => {
  const q = (e.target as HTMLInputElement).value
  searchQuery.value = q
  if (searchDebounce) clearTimeout(searchDebounce)
  if (!q) {
    searchResults.value = []
    return
  }
  searchDebounce = setTimeout(async () => {
    searchLoading.value = true
    try {
      const res = await datasetsAPI.list({ params: { q, page_size: 5 } })
      searchResults.value = res.data ?? []
    } finally {
      searchLoading.value = false
    }
  }, 300)
}

const addDataset = (dataset: DatasetV2) => {
  if (props.modelValue.datasets.some((d) => d.id === dataset.id)) return
  emit('update:modelValue', {
    ...props.modelValue,
    datasets: [...props.modelValue.datasets, dataset]
  })
  searchQuery.value = ''
  searchResults.value = []
}

const removeDataset = (datasetId: string) => {
  emit('update:modelValue', {
    ...props.modelValue,
    datasets: props.modelValue.datasets.filter((d) => d.id !== datasetId)
  })
}

const update = (patch: Partial<DatasetsListBloc>) => {
  emit('update:modelValue', { ...props.modelValue, ...patch })
}
</script>

<template>
  <div v-if="!edit">
    <h2 v-if="modelValue.title" class="fr-h3 fr-mb-2w">
      {{ modelValue.title }}
    </h2>
    <div class="fr-grid-row fr-grid-row--gutters">
      <div
        v-for="dataset in modelValue.datasets"
        :key="dataset.id"
        class="fr-col-12 fr-col-md-6 fr-col-lg-4"
      >
        <DatasetCard :dataset="dataset" />
      </div>
    </div>
  </div>

  <div v-else class="fr-p-3w fr-background-alt--blue-france">
    <div class="fr-mb-2w">
      <label :for="`datasets-title-${modelValue.id}`" class="fr-label">
        Titre <span class="fr-hint-text">Obligatoire</span>
      </label>
      <input
        :id="`datasets-title-${modelValue.id}`"
        type="text"
        class="fr-input"
        :value="modelValue.title"
        required
        @input="update({ title: ($event.target as HTMLInputElement).value })"
      />
    </div>

    <div class="fr-mb-2w">
      <p class="fr-label fr-mb-1w">Jeux de données sélectionnés</p>
      <ul v-if="modelValue.datasets.length" class="fr-tags-group">
        <li v-for="dataset in modelValue.datasets" :key="dataset.id">
          <button
            type="button"
            class="fr-tag fr-tag--dismiss"
            @click="removeDataset(dataset.id)"
          >
            {{ dataset.title }}
          </button>
        </li>
      </ul>
      <p v-else class="fr-text--sm fr-text-mention--grey">
        Aucun jeu de données sélectionné.
      </p>
    </div>

    <div class="fr-search-bar">
      <label :for="`datasets-search-${modelValue.id}`" class="fr-label">
        Ajouter un jeu de données
      </label>
      <input
        :id="`datasets-search-${modelValue.id}`"
        type="search"
        class="fr-input"
        placeholder="Rechercher..."
        :value="searchQuery"
        @input="onSearchInput"
      />
    </div>

    <ul
      v-if="searchResults.length"
      class="fr-mt-1w"
      style="list-style: none; padding: 0"
    >
      <li
        v-for="result in searchResults"
        :key="result.id"
        class="fr-py-1w fr-px-2w fr-background-default--grey"
        style="
          border-bottom: 1px solid var(--border-default-grey);
          cursor: pointer;
        "
        @click="addDataset(result)"
      >
        {{ result.title }}
      </li>
    </ul>
    <p v-if="searchLoading" class="fr-text--sm fr-mt-1w">Recherche en cours…</p>
  </div>
</template>
