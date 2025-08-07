<script setup lang="ts">
import type { SpatialCoverageLevel } from '@/model/spatial'
import { useSpatialStore } from '@/store/SpatialStore'
import FilterSelectComponent from '../FilterSelectComponent.vue'

const selectedGranularity = defineModel({
  type: String as () => string | null,
  default: null
})

defineProps({
  label: {
    type: String,
    required: true
  },
  defaultOption: {
    type: String as () => string | null,
    required: true
  }
})

const options: Ref<SpatialCoverageLevel[]> = ref([])

onMounted(() => {
  useSpatialStore()
    .loadLevels()
    .then((levels) => {
      options.value = levels
    })
})
</script>

<template>
  <FilterSelectComponent
    v-model="selectedGranularity"
    :default-option="defaultOption"
    :label="label"
    :options="options"
  />
</template>
