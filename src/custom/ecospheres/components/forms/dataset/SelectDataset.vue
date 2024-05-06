<script setup lang="ts">
import type { DatasetV2 } from '@etalab/data.gouv.fr-components'
import { debounce } from 'lodash'
import { defineModel, ref, watch, type Ref } from 'vue'
import Multiselect from 'vue-multiselect'
import 'vue-multiselect/dist/vue-multiselect.css'

import type { DatasetProperties } from '@/model'
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

const emits = defineEmits(['select-dataset', 'clear-dataset'])

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
  emits('clear-dataset')
}

watch(selectedDataset, () => {
  if (selectedDataset.value !== undefined) {
    emits('select-dataset', selectedDataset.value)
  }
})
</script>

<template>
  <Multiselect
    id="bouquet-select-dataset"
    ref="multiselect"
    v-model="selectedDataset"
    :options="options"
    label="title"
    track-by="id"
    placeholder="Rechercher une donnée dans data.gouv.fr"
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
    <template #clear>
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

<style lang="scss">
.multiselect__option,
.multiselect__single {
  white-space: normal;
  h4 {
    font-size: 1.2rem;
  }
}
.multiselect__option--highlight {
  background-color: var(--background-alt-grey-active);
  color: var(--text-default-grey);
}
.multiselect__option--highlight::after {
  background-color: var(--background-alt-grey-active);
  color: var(--text-default-grey);
}
.multiselect__spinner::before,
.multiselect__spinner::after {
  border-color: var(--background-alt-grey-active) transparent transparent;
  top: 60%;
}
.multiselect__select::before {
  top: 80%;
}
.multiselect__clear {
  position: absolute;
  right: 41px;
  height: 40px;
  width: 40px;
  display: block;
  cursor: pointer;
  z-index: 3;

  &:before,
  &:after {
    content: '';
    display: block;
    position: absolute;
    width: 3px;
    height: 16px;
    background: #aaa;
    top: 40%;
    right: 4px;
  }

  &:before {
    transform: rotate(45deg);
  }

  &:after {
    transform: rotate(-45deg);
  }
}
</style>
