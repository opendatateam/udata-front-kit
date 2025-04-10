<!-- a checkbox component that handles strings as values and a default value -->
<script setup lang="ts">
const model = defineModel({
  type: String as () => string | null,
  default: null
})

const props = defineProps({
  label: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  defaultValue: {
    type: Boolean,
    default: false
  }
})

const selectedValue = computed(() => {
  return model.value === 'true' || model.value === 'false'
    ? model.value === 'true'
    : props.defaultValue
})

const setSelectedValue = (value: boolean) => {
  model.value = value ? 'true' : 'false'
}
</script>

<template>
  <DsfrCheckbox
    :model-value="selectedValue"
    value="y"
    :label="label"
    :name="name"
    @update:model-value="setSelectedValue"
  />
</template>
