<template>
  <div v-if="numberOfDatasets < 1" class="no-dataset">
    <p>Ce bouquet ne contient pas encore de jeux de données</p>
  </div>
  <div v-else>
    <DsfrAccordionsGroup>
      <li v-for="(dataset, index) in datasets" :key="index">
        <DsfrAccordion
          :id="getAccordeonId(index)"
          :title="dataset.title"
          :expanded-id="isExpanded[getAccordeonId(index)]"
          @expand="isExpanded[getAccordeonId(index)] = $event"
        >
          <BouquetDatasetAvailability :dataset-properties="dataset" />
          <!-- eslint-disable-next-line vue/no-v-html -->
          <div v-html="markdown(dataset.purpose)"></div>
          <div class="button__wrapper">
            <DsfrButton
              icon="ri-delete-bin-line"
              label="Retirer de la section"
              class="fr-mr-2w"
              @click.prevent="$emit('removeDataset', index)"
            />
            <a
              v-if="!isAvailable(dataset)"
              class="fr-btn fr-btn--secondary inline-flex"
              :href="`mailto:${email}`"
            >
              Aidez-nous à trouver la donnée</a
            >
            <a
              v-if="dataset.uri"
              class="fr-btn fr-btn--secondary inline-flex"
              :href="dataset.uri"
              target="_blank"
              >Accéder au catalogue</a
            >
          </div>
        </DsfrAccordion>
      </li>
    </DsfrAccordionsGroup>
  </div>
</template>

<script lang="ts">
import config from '@/config'
import { type DatasetProperties, isAvailable as isAvailableTest } from '@/model'
import { fromMarkdown } from '@/utils'

import BouquetDatasetAvailability from './BouquetDatasetAvailability.vue'

export const getDatasetListTitle = function (
  datasets: DatasetProperties[]
): string {
  const title = 'Composition du bouquet '
  const numberOfDatasets = datasets.length
  switch (numberOfDatasets) {
    case 0: {
      return title
    }
    case 1: {
      return title + '( 1 jeu de données )'
    }
    default: {
      return title + `( ${numberOfDatasets} jeux de données )`
    }
  }
}

export default {
  name: 'BouquetDatasetList',
  components: { BouquetDatasetAvailability },
  props: {
    datasets: {
      type: Array<DatasetProperties>,
      default: []
    }
  },
  emits: ['removeDataset'],
  data() {
    return {
      isExpanded: {} as { [key: string]: boolean }
    }
  },
  computed: {
    email() {
      return config.website.contact_email
    },
    numberOfDatasets(): number {
      return this.datasets.length
    }
  },
  methods: {
    getAccordeonId(index: number): string {
      return `accordion_${index}`
    },
    isAvailable(dataset: DatasetProperties): boolean {
      return isAvailableTest(dataset.availability)
    },
    markdown(value: string) {
      return fromMarkdown(value)
    }
  }
}
</script>
