<template>
  <h4>{{ getDatasetListTitle() }}</h4>
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

<script lang="ts">
import BouquetDatasetList from '@/custom/ecospheres/components/BouquetDatasetList.vue'
import DatasetPropertiesAddForm from '@/custom/ecospheres/components/forms/dataset/DatasetPropertiesAddForm.vue'
import type { DatasetProperties } from '@/model'

import { getDatasetListTitle } from '../../BouquetDatasetList.vue'

export default {
  name: 'BouquetContentFieldGroup',
  components: {
    DatasetPropertiesAddForm,
    BouquetDatasetList
  },
  props: {
    currentDatasets: {
      type: Array<DatasetProperties>,
      default: []
    }
  },
  emits: ['updateValidation', 'update:datasets'],
  data() {
    return {
      datasets: this.currentDatasets,
      hasCurrentDatasetInput: false
    }
  },
  computed: {
    isValid(): boolean {
      return this.datasets.length > 0 && !this.hasCurrentDatasetInput
    }
  },
  watch: {
    isValid: {
      handler(newValue) {
        this.$emit('updateValidation', newValue)
      },
      immediate: true
    }
  },
  methods: {
    addDataset(datasetProperties: DatasetProperties) {
      this.datasets.push(datasetProperties)
      this.$emit('update:datasets', this.datasets)
    },
    removeDataset(index: number) {
      this.datasets.splice(index, 1)
      this.$emit('update:datasets', this.datasets)
    },
    editDataset({ index, data }: { index: number; data: DatasetProperties }) {
      this.datasets[index] = data
      this.$emit('update:datasets', this.datasets)
    },
    getDatasetListTitle() {
      return getDatasetListTitle(this.datasets)
    }
  }
}
</script>
