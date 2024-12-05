<script setup lang="ts">
import type { DatasetV2 } from '@datagouv/components'
import { useDebounceFn } from '@vueuse/core'
import { defineModel, ref } from 'vue'
import 'vue-multiselect/dist/vue-multiselect.css'

import NewMultiselect from '@vueform/multiselect'
import '@vueform/multiselect/themes/default.css'

import '@/assets/multiselect.css'
import type { DatasetProperties } from '@/model/topic'
import SearchAPI from '@/services/api/SearchAPI'

const selectedDataset = defineModel({
  type: Object as () => DatasetV2
})

const props = defineProps({
  alreadySelectedDatasets: {
    type: Array<DatasetProperties>,
    default: []
  }
})

const isLoading = ref(false)

const alreadySelected = (id: string): boolean => {
  for (const alreadySelectedDataset of props.alreadySelectedDatasets) {
    if (alreadySelectedDataset.id === id) return true
  }
  return false
}

const search = useDebounceFn(async (query: string) => {
  isLoading.value = true
  if (!query) {
    isLoading.value = false
    return
  }
  try {
    return (
      await new SearchAPI().search(query, null, 1, {
        page_size: 10
      })
    ).data
  } catch (error) {
    console.error('Search error', error)
  } finally {
    isLoading.value = false
  }
}, 400)

const clear = () => {
  selectedDataset.value = undefined
}
</script>

<template>
  <label class="fr-label fr-mb-2v" for="bouquet-select-dataset">
    Jeu de données (facultatif)<br /><span class="fr-text--sm"
      >Rechercher un jeu de données dans data.gouv.fr</span
    >
  </label>
  <NewMultiselect
    id="input-regroupement"
    ref="newSelect"
    v-model="selectedDataset"
    :object="true"
    value-prop="id"
    label="title"
    track-by="title"
    :filter-results="false"
    :min-chars="3"
    :clear-on-search="true"
    :delay="0"
    :options="search"
    :resolve-on-load="false"
    :searchable="true"
    :limit="5"
    :strict="false"
    no-results-text="Aucun regroupement existant"
    :clear-on-blur="false"
    placeholder=""
  >
    <template #singlelabel="{ value }">
      <div class="multiselect-single-label fr-py-2w">
        <DatasetCardForSelect
          :dataset="value"
          :already-selected="alreadySelected(value.id)"
          badge-position="absolute"
        />
      </div>
    </template>
    <template #option="{ option }">
      <DatasetCardForSelect
        :dataset="option"
        :already-selected="alreadySelected(option.id)"
        badge-position="relative"
      />
    </template>
    <template #clear>
      <button
        class="multiselect-clear"
        @click="clear"
        @keydown.enter="clear"
        @keydown.space="clear"
      >
        <span class="fr-sr-only">Supprimer la sélection</span>
        <span aria-hidden class="multiselect-clear-icon"></span>
      </button>
    </template>
    <template #nooptions> Précisez ou élargissez votre recherche </template>
  </NewMultiselect>
</template>

<style scoped>
:deep(.multiselect__option::after) {
  clip: rect(0 0 0 0);
  clip-path: inset(50%);
  block-size: 1px;
  overflow: hidden;
  position: absolute;
  white-space: nowrap;
  inline-size: 1px;
}
.multiselect {
  --ms-max-height: 400px;
}
.multiselect-single-label {
  position: relative;
  margin-inline-end: auto;
}
</style>
