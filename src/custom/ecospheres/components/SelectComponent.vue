<!-- a select component with a selectable null value (default) -->
<script setup lang="ts">
type SelectOption = {
  id: string
  name: string
}

const NoOptionSelected = 'default'

defineProps({
  modelValue: {
    type: String as PropType<string | null>,
    default: null
  },
  options: {
    type: Object as PropType<SelectOption[]>,
    required: true
  },
  defaultOption: {
    type: String,
    default: 'Tous'
  },
  id: {
    type: String,
    required: true
  }
})

const emit = defineEmits<{
  'update:modelValue': [value: string | null]
}>()

const handleChange = (event: Event) => {
  const value = (event.target as HTMLInputElement)?.value
  emit('update:modelValue', value === NoOptionSelected ? null : value)
}
</script>

<template>
  <select :id="id" class="fr-select" @change="handleChange">
    <option
      :value="NoOptionSelected"
      :selected="modelValue === NoOptionSelected"
    >
      {{ defaultOption }}
    </option>
    <option
      v-for="option in options"
      :key="option.id"
      :value="option.id"
      :selected="option.id === modelValue"
    >
      {{ option.name }}
    </option>
  </select>
</template>
