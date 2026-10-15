<!-- a select component with a selectable null value (default) -->
<script setup lang="ts">
import { useRandomId } from '@gouvminint/vue-dsfr'
import { ref, watch } from 'vue'

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
  // When true, no option is pre-selected (not even `defaultOption`): the
  // browser shows an empty, invalid placeholder until the user picks one.
  required: {
    type: Boolean,
    default: false
  }
})

const id = useRandomId('select')

// Decoupled from `selectedOption`: when `required` is true, `null` (the
// defaultOption's value) must stay a valid choice without being pre-selected.
const localSelection = ref<string | null>()
if (!props.required) localSelection.value = selectedOption.value
watch(localSelection, (value) => {
  if (value !== undefined) selectedOption.value = value
})
</script>

<template>
  <label :class="labelClass" :for="id">{{ label }}</label>
  <select
    :id="id"
    v-model="localSelection"
    class="fr-select fr-col"
    :required="required"
  >
    <option v-if="required" value="" disabled hidden></option>
    <option v-if="defaultOption" :value="null">
      {{ defaultOption }}
    </option>
    <option v-for="option in options" :key="option.id" :value="option.id">
      {{ option.name }}
    </option>
  </select>
</template>
