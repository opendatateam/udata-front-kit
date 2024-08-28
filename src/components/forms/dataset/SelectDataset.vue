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
  ).data
  options.value = datasets
  isLoading.value = false
}, 400)

const clear = () => {
  selectedDataset.value = undefined
}
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
      <div class="fr-pt-2w">
        <DsfrBadge
          v-if="alreadySelected(slotProps.option.id)"
          type="info"
          label="Déjà utilisé dans ce bouquet"
          small
          ellipsis
          class="absolute top-0 fr-mt-n4v dsfr-badge-info"
        />
        <DatasetCardForSelect :dataset="slotProps.option" />
      </div>
    </template>
    <template #option="slotProps">
      <DsfrBadge
        v-if="alreadySelected(slotProps.option.id)"
        type="info"
        label="Déjà utilisé dans ce bouquet"
        small
        ellipsis
        class="relative top-0 fr-mt-n4v fr-mb-2v dsfr-badge-info"
      />
      {{ slotProps.option.archived }}
      <DatasetCardForSelect :dataset="slotProps.option" />
    </template>
    <template #noOptions> Précisez ou élargissez votre recherche </template>
  </Multiselect>
</template>

<style scoped>
.multiselect {
  margin-top: 1rem;
}
.dsfr-badge-info.dsfr-badge-info::before {
  -webkit-mask-image: url(/node_modules/@gouvfr/dsfr/dist/icons/system/fr--info-fill.svg);
  mask-image: url(/node_modules/@gouvfr/dsfr/dist/icons/system/fr--info-fill.svg);
}
:deep(.multiselect__option::after) {
  clip: rect(0 0 0 0);
  clip-path: inset(50%);
  block-size: 1px;
  overflow: hidden;
  position: absolute;
  white-space: nowrap;
  inline-size: 1px;
}
</style>
