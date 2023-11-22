<template>
  <div class="app">
    <h3>Bouquet : {{ this.name }}</h3>
    description : {{ this.description }}
    <p>contenu :</p>
    <ul>
      <li v-for="dataset in datasets">
        {{ dataset.label }} - {{ dataset.purpose }}
      </li>
    </ul>
  </div>
</template>

<script lang="ts">
import type { DatasetProperties } from '../../../model'
import TopicContentFieldGroup from './TopicContentFieldGroup.vue'
import TopicPropertiesFieldGroup from './TopicPropertiesFieldGroup.vue'

export default {
  name: 'TopicForm',
  components: {
    TopicPropertiesFieldGroup: TopicPropertiesFieldGroup,
    TopicContentFieldGroup: TopicContentFieldGroup
  },
  props: {
    name: {
      type: String,
      default: ''
    },
    description: {
      type: String,
      default: ''
    },
    datasets: {
      type: Array<DatasetProperties>,
      default: []
    }
  }
}
</script>
