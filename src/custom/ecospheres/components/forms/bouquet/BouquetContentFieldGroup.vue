<template>
  <h4>{{ getDatasetListTitle() }}</h4>
  <BouquetDatasetList
    class="fr-mt-4w fr-mb-4w"
    @removeDataset="removeDataset"
    :datasets="datasets"
  />
  <DatasetPropertiesForm
    @addDataset="addDataset"
    :alreadySelectedDatasets="datasets"
  />
</template>

<script lang="ts">
import BouquetDatasetList from '@/custom/ecospheres/components/BouquetDatasetList.vue'
import DatasetPropertiesForm from '@/custom/ecospheres/components/forms/dataset/DatasetPropertiesForm.vue'
import type { DatasetProperties } from '@/model'

import { getDatasetListTitle } from '../../BouquetDatasetList.vue'

export default {
  name: 'BouquetContentFieldGroup',
  components: {
    DatasetPropertiesForm: DatasetPropertiesForm,
    BouquetDatasetList: BouquetDatasetList
  },
  props: {
    currentDatasets: {
      type: Array<DatasetProperties>,
      default: []
    }
  },
  data() {
    return {
      datasets: this.currentDatasets
    }
  },
  watch: {
    isValid(newValue) {
      this.$emit('updateValidation', newValue)
    }
  },
  computed: {
    isValid(): boolean {
      return this.datasets.length > 0
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
    getDatasetListTitle() {
      return getDatasetListTitle(this.datasets)
    }
  }
}
</script>
