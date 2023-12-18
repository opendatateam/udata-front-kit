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
  <p v-html="bouquet.name" />
  <p class="fr-mb-0"><strong>Objectif du bouquet</strong></p>
  <p v-html="markdown(bouquet.description)" />
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
  <p v-html="bouquet.theme" />
  <p class="fr-mb-0"><strong>Chantier</strong></p>
  <p v-html="bouquet.subtheme" />
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
  <BouquetDatasetList :datasets="bouquet.datasetsProperties" />
</template>

<script lang="ts">
import MarkdownIt from 'markdown-it'
import type { PropType } from 'vue'

import BouquetDatasetList from '@/custom/ecospheres/components/BouquetDatasetList.vue'
import { getDatasetListTitle } from '@/custom/ecospheres/components/BouquetDatasetList.vue'
import type { Bouquet } from '@/model'

export default {
  name: 'BouquetFormRecap',
  emits: ['updateStep'],
  components: {
    BouquetDatasetList: BouquetDatasetList
  },
  props: {
    bouquet: {
      type: Object as PropType<Partial<Bouquet>>,
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
      return getDatasetListTitle(this.bouquet.datasetsProperties)
    },
    markdown(text: string) {
      return MarkdownIt().render(text)
    }
  }
}
</script>
