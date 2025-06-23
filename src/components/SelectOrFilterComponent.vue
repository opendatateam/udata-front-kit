<!-- use standard select below filterThreshold, filter select above -->
<script setup lang="ts">
import FilterSelectComponent from './FilterSelectComponent.vue'
import SelectComponent from './SelectComponent.vue'

type SelectOption = {
  id: string
  name: string
}

const selectedOption = defineModel({
  type: String as () => string | null,
  default: null
})

const props = defineProps({
  options: {
    type: Object as PropType<SelectOption[]>,
    required: true
  },
  label: {
    type: String,
    required: true
  },
  labelClass: {
    type: Array,
    default: () => ['fr-label']
  },
  defaultOption: {
    type: String as () => string | null,
    default: null
  },
  filterThreshold: {
    type: Number,
    default: 15
  }
})

const isAboveThreshold = computed(
  () => props.options.length > props.filterThreshold
)
</script>

<template>
  <component
    :is="isAboveThreshold ? FilterSelectComponent : SelectComponent"
    v-model="selectedOption"
    :label
    :label-class
    :default-option
    :options
  />
</template>
