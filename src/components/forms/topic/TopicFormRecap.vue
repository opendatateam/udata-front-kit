<template>
  <h4>
    Description du bouquet de données
    <DsfrButton
      :icon-only="true"
      size="sm"
      icon="ri-pencil-line"
      title="Editer Étape 1"
      :tertiary="true"
      :no-outline="true"
      @click.prevent="goToStep(1)"
    />
  </h4>

  <p class="fr-mb-0"><strong>Sujet du bouquet</strong></p>
  <p v-html="topic.name" />
  <p class="fr-mb-0"><strong>Objectif du bouquet</strong></p>
  <p v-html="markdown(topic.description)" />
  <hr />

  <h4>
    Information du bouquet de données
    <DsfrButton
      :icon-only="true"
      size="sm"
      icon="ri-pencil-line"
      title="Editer Étape 2"
      :tertiary="true"
      :no-outline="true"
      @click.prevent="goToStep(2)"
    />
  </h4>
  <p class="fr-mb-0"><strong>Thématique</strong></p>
  <p v-html="topic.theme" />
  <p class="fr-mb-0"><strong>Chantier</strong></p>
  <p v-html="topic.subtheme" />
  <hr />

  <h4>
    {{ getDatasetListTitle() }}
    <DsfrButton
      :icon-only="true"
      size="sm"
      icon="ri-pencil-line"
      title="Editer Étape 3"
      :tertiary="true"
      :no-outline="true"
      @click.prevent="goToStep(3)"
    />
  </h4>
  <DatasetList :datasets="topic.datasetsProperties" />
</template>

<script lang="ts">
import MarkdownIt from 'markdown-it'
import type { PropType } from 'vue'

import type { Topic } from '@/model'

import DatasetList from '../../DatasetList.vue'
import { getDatasetListTitle } from '../../DatasetList.vue'

export default {
  name: 'TopicFormRecap',
  emits: ['updateStep'],
  components: {
    DatasetList: DatasetList
  },
  props: {
    topic: {
      type: Object as PropType<Partial<Topic>>,
      default: ''
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
    goToStep(step: number) {
      this.$emit('updateStep', step)
    },
    getDatasetListTitle() {
      return getDatasetListTitle(this.topic.datasetsProperties)
    },
    markdown(text: string) {
      return MarkdownIt().render(text)
    }
  }
}
</script>
