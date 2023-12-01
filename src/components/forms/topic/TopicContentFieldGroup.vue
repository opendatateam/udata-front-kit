<template>
  <section class="topicProperties">
    <div class="fr-grid-row">
      <div class="fr-col-12 fr-col-lg-7">
        <div>
          <div class="fr-mt-1w">
            <h4>{{ compositionTitle }}</h4>
            <div
              v-if="numberOfDatasets < 1"
              class="no-dataset fr-py-2 fr-px-3w"
            >
              <p class="fr-m-0">Aucune donnée ajoutée</p>
            </div>
            <div v-else>
              <DatasetList v-model:datasets="datasets" />
            </div>
            <DatasetPropertiesForm
              @addDataset="addDataset"
              :alreadySelectedDatasets="datasets"
            />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script lang="ts">
import DatasetList from '@/components/DatasetList.vue'
import DatasetPropertiesForm from '@/components/forms/dataset/DatasetPropertiesForm.vue'
import type { DatasetProperties } from '@/model'

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
  computed: {
    numberOfDatasets(): number {
      return this.datasets.length
    },
    compositionTitle(): string {
      const title = ' Composition du bouquet'
      return this.numberOfDatasets < 1
        ? title
        : title + `( ${this.numberOfDatasets} )`
    }
  },
  methods: {
    addDataset(datasetProperties: DatasetProperties) {
      this.datasets.push(datasetProperties)
      this.$emit('update:datasets', this.datasets)
    }
  }
}
</script>
