<script setup lang="ts">
import type { DatasetV2 } from '@datagouv/components'
import { debounce } from 'lodash'
import { defineModel, ref, type Ref } from 'vue'
import Multiselect from 'vue-multiselect'
import 'vue-multiselect/dist/vue-multiselect.css'

import '@/assets/multiselect.css'
import type { DatasetProperties } from '@/model/topic'
import SearchAPI from '@/services/api/SearchAPI'

import DatasetCardForSelect from './DatasetCardForSelect.vue'

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
const options: Ref<DatasetV2[]> = ref([])

const alreadySelected = (id: string): boolean => {
  for (const alreadySelectedDataset of props.alreadySelectedDatasets) {
    if (alreadySelectedDataset.id === id) return true
  }
  return false
}

const search = debounce(async (query: string) => {
  isLoading.value = true
  if (!query) {
    options.value = []
    isLoading.value = false
    return
  }
  const datasets = (
    await new SearchAPI().search(query, null, 1, {
      page_size: 10
    })
  ).data.filter((dataset) => !alreadySelected(dataset.id))
  options.value = datasets
  isLoading.value = false
}, 400)

const clear = () => {
  selectedDataset.value = undefined
}
</script>

<template>
  <label class="fr-label fr-mt-2v" for="bouquet-select-dataset"
    >Rechercher une donnée dans data.gouv.fr&nbsp;:</label
  >
  <Multiselect
    id="bouquet-select-dataset"
    ref="multiselect"
    v-model="selectedDataset"
    :options="options"
    label="title"
    track-by="id"
    placeholder=""
    select-label="Entrée pour sélectionner"
    :multiple="false"
    :searchable="true"
    :internal-search="false"
    :loading="isLoading"
    :clear-on-select="true"
    :close-on-select="true"
    :max-height="600"
    :show-no-results="false"
    :hide-selected="true"
    @search-change="search"
  >
    <template #caret>
      <div
        v-if="selectedDataset"
        class="multiselect__clear"
        @mousedown.prevent.stop="clear"
      ></div>
    </template>
    <template #singleLabel="slotProps">
      <DatasetCardForSelect :dataset="slotProps.option" />
    </template>
    <template #option="slotProps">
      <DatasetCardForSelect :dataset="slotProps.option" />
    </template>
    <template #noOptions> Précisez ou élargissez votre recherche </template>
  </Multiselect>
</template>
