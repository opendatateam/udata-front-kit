<template>
  <section class="topicProperties">
    <div class="fr-grid-row">
      <div class="fr-col-12 fr-col-lg-7">
        <div>
          <div class="fr-mt-1w">
            <h2>Données déjà sélectionnées</h2>
            {{ datasets }}
            <DatasetPropertiesForm @addDataset="addDataset" />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script lang="ts">
import DatasetPropertiesForm from '@/components/forms/dataset/DatasetPropertiesForm.vue'
import type { DatasetProperties } from '@/model'

export default {
  name: 'TopicContentFieldGroup',
  components: {
    DatasetPropertiesForm: DatasetPropertiesForm
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
      console.log(this.datasets[0])
      this.$emit('update:datasets', this.datasets)
    }
  }
}
</script>
