<script setup lang="ts">
import { computed, ref, watch } from 'vue'

import BouquetDatasetList from '@/custom/ecospheres/components/BouquetDatasetList.vue'
import DatasetPropertiesAddForm from '@/custom/ecospheres/components/forms/dataset/DatasetPropertiesAddForm.vue'
import type { DatasetProperties } from '@/model'
import { getDatasetListTitle } from '@/utils/bouquet'

const props = defineProps({
  currentDatasets: {
    type: Array<DatasetProperties>,
    default: []
  }
})

const emit = defineEmits(['updateValidation', 'update:datasets'])

const hasCurrentDatasetInput = ref(false)
const datasets = ref(props.currentDatasets)

const isValid = computed((): boolean => {
  return datasets.value.length > 0 && !hasCurrentDatasetInput.value
})

watch(
  isValid,
  (newValue) => {
    emit('updateValidation', newValue)
  },
  { immediate: true }
)

const addDataset = (datasetProperties: DatasetProperties) => {
  datasets.value.push(datasetProperties)
  emit('update:datasets', datasets.value)
}

const removeDataset = (index: number) => {
  datasets.value.splice(index, 1)
  emit('update:datasets', datasets.value)
}

const editDataset = ({
  index,
  data
}: {
  index: number
  data: DatasetProperties
}) => {
  datasets.value[index] = data
  emit('update:datasets', datasets.value)
}
</script>

<template>
  <h4>{{ getDatasetListTitle(datasets) }}</h4>
  <DatasetPropertiesAddForm
    v-model:is-dirty="hasCurrentDatasetInput"
    :already-selected-datasets="datasets"
    @add-dataset="addDataset"
  />
  <BouquetDatasetList
    class="fr-mt-4w fr-mb-4w"
    :datasets="datasets"
    :is-edit="true"
    @remove-dataset="removeDataset"
    @edit-dataset="editDataset"
  />
</template>
