<script setup lang="ts">
import SelectComponent from '@/custom/ecospheres/components/SelectComponent.vue'
import type { SpatialCoverageLevel } from '@/model/spatial'
import { useSpatialStore } from '@/store/SpatialStore'

const selectedGranularity = defineModel({
  type: String as () => string | null,
  default: null
})

defineEmits(['update:model-value'])

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
  <SelectComponent
    :model-value="selectedGranularity"
    default-option="Toutes les mailles"
    label="Maille minimale"
    :options="options"
    @update:model-value="(value) => $emit('update:model-value', value)"
  />
</template>
