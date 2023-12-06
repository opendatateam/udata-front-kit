<template>
  <section class="topicProperties">
    <div class="fr-grid-row">
      <div class="fr-col-12 fr-col-lg-7">
        <div class="fr-mt-1w">
          <h4>{{ getDatasetListTitle() }}</h4>
          <DatasetList @removeDataset="removeDataset" :datasets="datasets" />
          <DatasetPropertiesForm
            @addDataset="addDataset"
            :alreadySelectedDatasets="datasets"
          />
        </div>
      </div>
    </div>
  </section>
</template>

<script lang="ts">
import DatasetList from '@/components/DatasetList.vue'
import DatasetPropertiesForm from '@/components/forms/dataset/DatasetPropertiesForm.vue'
import type { DatasetProperties } from '@/model'

import { getDatasetListTitle } from '../../DatasetList.vue'

export default {
  name: 'TopicContentFieldGroup',
  components: {
    DatasetPropertiesForm: DatasetPropertiesForm,
    DatasetList: DatasetList
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
