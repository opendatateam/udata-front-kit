<script setup lang="ts">
import FilterSelectComponent from '@/components/FilterSelectComponent.vue'
import type { FilterOption } from '@/model/filter'

defineProps<{
  label: string
  defaultOption?: string | null
  options: FilterOption[]
}>()

const selectedOrganization = defineModel({
  type: String as () => string | null,
  default: null
})
</script>

<template>
  <FilterSelectComponent
    v-model="selectedOrganization"
    :default-option="defaultOption || 'Toutes les organisations'"
    :label="label"
    :options="options"
    :show-count="true"
  />
</template>
