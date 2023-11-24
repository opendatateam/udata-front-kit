<template>
  <div class="app">
    <h3>Bouquet : {{ topic.name }}</h3>
    <p>description : {{ topic.description }}</p>
    <p>theme : {{ topic.theme }}</p>
    <p>subtheme : {{ topic.subtheme }}</p>
    <p>contenu :</p>
    <ul>
      <li v-for="dataset in topic.datasetsProperties">
        {{ dataset.label }} - {{ dataset.purpose }}
      </li>
    </ul>
  </div>
</template>

<script lang="ts">
import type { PropType } from 'vue'

import type { Topic } from '@/model'

export default {
  name: 'TopicFormRecap',
  props: {
    topic: {
      type: Object as PropType<Partial<Topic>>,
      default: ''
    }
  }
}
</script>
