<template>
  <section class="topicProperties">
    <div class="fr-grid-row">
      <div class="fr-col-12 fr-col-lg-7">
        <div>
          <div class="fr-mt-1w">
            <h2>Données déjà sélectionnées</h2>
            {{ this.datasets }}
            <DatasetForTopicForm @addDataset="addDataset" />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script lang="ts">
import { DatasetItem } from '../../../model'
import DatasetForTopicForm from '../dataset/DatasetForTopicForm.vue'

export default {
  name: 'TopicContentFieldGroup',
  components: {
    DatasetForTopicForm: DatasetForTopicForm
  },
  props: {
    currentDatasets: {
      type: Array<DatasetItem>,
      default: []
    }
  },
  data() {
    return {
      datasets: this.currentDatasets
    }
  },
  methods: {
    addDataset(datasetItem: DatasetItem) {
      this.datasets.push(datasetItem)
      console.log(this.datasets[0])
      this.$emit('update:datasets', this.datasets)
    }
  }
}
</script>
