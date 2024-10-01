<script setup lang="ts">
import { debounce } from 'lodash'
import { onMounted, ref, defineModel, type PropType, type Ref } from 'vue'
import Multiselect from 'vue-multiselect'
import 'vue-multiselect/dist/vue-multiselect.css'

import '@/assets/multiselect.css'
import type { SpatialCoverage, SpatialCoverageLevel } from '@/model/spatial'
import SpatialAPI from '@/services/api/SpatialAPI'
import { useSpatialStore } from '@/store/SpatialStore'

const selectedSpatialCoverage = defineModel('spatialCoverage', {
  type: Object as PropType<SpatialCoverage>
})

defineProps({
  modelValue: {
    type: Object as PropType<SpatialCoverage>,
    default: undefined
  },
  short: {
    type: Boolean,
    default: false
  },
  placeholder: {
    type: String,
    default: 'Rechercher une couverture territoriale'
  }
})

const isLoading = ref(false)

const options: Ref<SpatialCoverage[]> = ref([])

const getLevelById = (levelId: string): SpatialCoverageLevel | undefined => {
  return useSpatialStore().getLevelById(levelId)
}

const search = debounce(async (query: string) => {
  isLoading.value = true
  if (!query) {
    options.value = []
    isLoading.value = false
    return
  }
  const zones = await new SpatialAPI().suggestZones(query, {
    page_size: 10
  })
  options.value = zones
  isLoading.value = false
}, 400)

const clear = () => {
  selectedSpatialCoverage.value = undefined
}

onMounted(() => {
  useSpatialStore().loadLevels()
})
</script>

<template>
  <Multiselect
    id="select-spatial-coverage"
    ref="multiselect"
    v-model="selectedSpatialCoverage"
    :options="options"
    label="name"
    track-by="id"
    :placeholder="placeholder"
    :select-label="short ? '' : 'Entrée pour sélectionner'"
    :deselect-label="short ? '' : 'Entrée pour supprimer'"
    :multiple="false"
    :searchable="true"
    :internal-search="false"
    :loading="isLoading"
    :clear-on-select="true"
    :close-on-select="true"
    :max-height="600"
    :show-no-results="false"
    :hide-selected="false"
    @search-change="search"
  >
    <template #caret>
      <div
        v-if="selectedSpatialCoverage"
        class="multiselect__clear"
        @mousedown.prevent.stop="clear"
      ></div>
    </template>
    <template #singleLabel="slotProps">
      <div>
        <span v-if="short">
          {{ slotProps.option.name }}
        </span>
        <span v-else>
          {{ getLevelById(slotProps.option.level)?.name }} :
          {{ slotProps.option.name }} ({{ slotProps.option.code }})
        </span>
      </div>
    </template>
    <template #option="slotProps">
      <div class="spatial-select-option">
        <div class="header">
          <span class="name">{{ slotProps.option.name }}</span>
          <span class="code fr-ml-1v">{{ slotProps.option.code }}</span>
        </div>
        <div class="level">
          {{ getLevelById(slotProps.option.level)?.name }}
        </div>
      </div>
    </template>
    <template #noOptions> Précisez ou élargissez votre recherche </template>
  </Multiselect>
</template>

<style lang="scss">
.spatial-select-option {
  flex-direction: column;
  align-items: flex-start;
  .code,
  .level {
    font-size: 0.8rem;
  }
  .level {
    display: block;
  }
}
</style>
