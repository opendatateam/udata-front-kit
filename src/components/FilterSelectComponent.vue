<!-- a filterable select component -->
<script setup lang="ts">
import { useRandomId } from '@gouvminint/vue-dsfr'

import Multiselect from '@vueform/multiselect'
import '@vueform/multiselect/themes/default.css'

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
  searchableThreshold: {
    type: Number,
    default: 15
  }
})

const id = useRandomId('select')

const isSearchable = computed(
  () => props.options.length > props.searchableThreshold
)
</script>

<template>
  <label :class="labelClass" :for="id">{{ label }}</label>
  <Multiselect
    :id="id"
    v-model="selectedOption"
    value-prop="id"
    label="name"
    track-by="name"
    class="fr-input-wrap"
    :placeholder="defaultOption"
    :filter-results="true"
    :clear-on-search="true"
    :options="options"
    :searchable="isSearchable"
    :strict="false"
    :clear-on-blur="false"
    :allow-absent="true"
    no-options-text="Aucune résultat trouvé, précisez ou élargissez votre recherche."
    :aria="{
      // useless or unsupported yet https://github.com/vueform/multiselect/issues/436
      'aria-labelledby': null,
      'aria-multiselectable': null,
      'aria-placeholder': null
    }"
  >
  </Multiselect>
</template>

<style scoped>
:deep(.multiselect-placeholder) {
  color: var(--text-label-grey);
}
</style>
