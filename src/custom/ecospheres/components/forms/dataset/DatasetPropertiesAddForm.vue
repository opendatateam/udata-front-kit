<script setup lang="ts">
import { ref, computed, watch } from 'vue'

import { type DatasetProperties, Availability } from '@/model'

import DatasetPropertiesFields from './DatasetPropertiesFields.vue'

const emit = defineEmits(['addDataset', 'update:isDirty'])

defineProps({
  alreadySelectedDatasets: {
    type: Array<DatasetProperties>,
    default: []
  }
})

const initData = (): DatasetProperties => {
  return {
    title: '',
    purpose: '',
    availability: Availability.NOT_AVAILABLE,
    uri: null,
    id: null
  }
}

const datasetProperties = ref(initData())
const isValidDataset = ref(false)

const handleSubmit = () => {
  emit('addDataset', datasetProperties.value)
  datasetProperties.value = initData()
}

const isDirty = computed(() => {
  return (
    !!datasetProperties.value.title.trim() ||
    !!datasetProperties.value.purpose.trim()
  )
})

watch(isDirty, (newVal) => {
  emit('update:isDirty', newVal)
})
</script>

<template>
  <div class="app">
    <form @submit.prevent="handleSubmit">
      <h5>Ajouter un jeu de données</h5>
      <DatasetPropertiesFields
        v-model:dataset-properties="datasetProperties"
        :already-selected-datasets="alreadySelectedDatasets"
        @update-validation="(isValid: boolean) => isValidDataset = isValid"
      />
      <DsfrButton
        :disabled="!isValidDataset"
        type="submit"
        label="Ajouter ce jeu de données"
        :secondary="true"
      />
    </form>
  </div>
</template>
