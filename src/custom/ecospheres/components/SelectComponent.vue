<!-- a select component with a selectable null value (default) -->
<script setup lang="ts">
type SelectOption = {
  id: string
  name: string
}

const selectedOption = defineModel({
  type: String as () => string | null,
  default: null
})

defineProps({
  options: {
    type: Object as PropType<SelectOption[]>,
    required: true
  },
  id: {
    type: String,
    required: true
  },
  defaultOption: {
    type: String,
    default: 'Tous'
  }
})
</script>

<template>
  <select :id="id" v-model="selectedOption" class="fr-select">
    <option :value="null">
      {{ defaultOption }}
    </option>
    <option v-for="option in options" :key="option.id" :value="option.id">
      {{ option.name }}
    </option>
  </select>
</template>
