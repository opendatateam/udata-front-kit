<script setup lang="ts">
import Multiselect from '@vueform/multiselect'
import { onMounted, type PropType } from 'vue'

import type { SpatialCoverage, SpatialCoverageLevel } from '@/model/spatial'
import SpatialAPI from '@/services/api/SpatialAPI'
import { useSpatialStore } from '@/store/SpatialStore'

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

const emits = defineEmits(['update:modelValue'])

const spatialCoverageOptions = async (query: string) => {
  if (!query) return []
  return await new SpatialAPI().suggestZones(query, {
    page_size: 10
  })
}

const getLevelById = (levelId: string): SpatialCoverageLevel | undefined => {
  return useSpatialStore().getLevelById(levelId)
}

const onSelectSpatialCoverage = (value: SpatialCoverage) => {
  emits('update:modelValue', value)
}

const onClearSpatialCoverage = () => {
  emits('update:modelValue', null)
}

onMounted(() => {
  useSpatialStore().loadLevels()
})
</script>

<template>
  <Multiselect
    id="link"
    ref="selector"
    :value="modelValue"
    value-prop="id"
    no-options-text="Précisez ou élargissez votre recherche"
    :placeholder="placeholder"
    name="select-spatial-coverage"
    autocomplete="off"
    class="multiselect-spatial-coverage"
    :clear-on-select="true"
    :filter-results="false"
    :min-chars="1"
    :resolve-on-load="false"
    :delay="400"
    :searchable="true"
    :options="spatialCoverageOptions"
    :object="true"
    @select="onSelectSpatialCoverage"
    @clear="onClearSpatialCoverage"
  >
    <template #singlelabel="{ value }">
      <div class="multiselect-single-label">
        <span v-if="short">
          {{ (value as SpatialCoverage).name }}
        </span>
        <span v-else>
          {{ getLevelById((value as SpatialCoverage).level)?.name }} :
          {{ (value as SpatialCoverage).name }} ({{
            (value as SpatialCoverage).code
          }})
        </span>
      </div>
    </template>

    <template #option="{ option }">
      <div class="header">
        <span class="name">{{ (option as SpatialCoverage).name }}</span>
        <span class="code fr-ml-1v">{{
          (option as SpatialCoverage).code
        }}</span>
      </div>
      <div class="level">
        {{ getLevelById((option as SpatialCoverage).level)?.name }}
      </div>
    </template>
  </Multiselect>
</template>
