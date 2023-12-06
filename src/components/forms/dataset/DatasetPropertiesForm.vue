<template>
  <div class="app">
    <form @submit.prevent="handleSubmit">
      <h5>Ajouter un jeu de données</h5>

      <div class="fr-mt-1w fr-mb-4w">
        <label class="fr-label" for="label">Libellé de la donnée</label>
        <input class="fr-input" type="text" id="label" v-model="label" />
      </div>
      <div class="fr-mt-1w fr-mb-4w">
        <Tooltip
          title="Raison d'utilisation dans ce bouquet"
          name="tooltip__objectif"
          text="Ajoutez ici l'ensemble des informations nécessaires à la compréhension, l'objectif et l'utilisation du bouquet. N'hésitez pas à indiquer la réglementation ou une documentation liée au bouquet."
        />
        <Tooltip
          title="Utilisez du markdown pour mettre en forme votre texte"
          name="tooltip__markdown"
          text="* simple astérisque pour italique *<br/> ** double astérisque pour gras **<br/> # un dièse pour titre 1<br/> ## deux dièses pour titre 2<br/> *  astérisque pour une liste<br/> lien : [[https://exemple.fr]]"
        />
        <textarea class="fr-input" type="text" id="purpose" v-model="purpose" />
      </div>
      <div class="fr-mt-1w fr-mb-4w">
        <label class="fr-label" for="source">Retrouver la donnée via</label>
        <fieldset id="source" class="fr-fieldset">
          <div class="fr-fieldset__content" role="radiogroup">
            <DsfrRadioButton
              v-model="availability"
              :value="availabilityEnum.ECO_AVAILABLE"
              label="Écosphères"
            />
            <Multiselect
              v-if="availability === availabilityEnum.ECO_AVAILABLE"
              ref="selector"
              v-model="ecosphereId"
              no-options-text="Précisez ou élargissez votre recherche"
              placeholder="Rechercher une donnée dans Ecosphères"
              name="select-datasets"
              :clear-on-select="true"
              :filter-results="false"
              :min-chars="1"
              :resolve-on-load="false"
              :delay="0"
              :searchable="true"
              :options="ecospheresDatasetsOptions"
            />
            <DsfrRadioButton
              v-model="availability"
              :value="availabilityEnum.URL_AVAILABLE"
              label="URL"
            />
            <DsfrInput
              v-if="availability === availabilityEnum.URL_AVAILABLE"
              v-model="uri"
              placeholder="Url vers le jeu de données souhaité"
              :label-visible="true"
              class="fr-mb-md-1w"
            />
            <DsfrRadioButton
              v-model="availability"
              :value="availabilityEnum.MISSING"
              label="Je n'ai pas trouvé la donnée"
            />
            <DsfrRadioButton
              v-model="availability"
              :value="availabilityEnum.NOT_AVAILABLE"
              label="Je n'ai pas cherché la donnée"
            />
          </div>
        </fieldset>
      </div>
      <DsfrButton type="submit" label="Ajouter la donnée" :secondary="true" />
    </form>
  </div>
</template>

<script lang="ts">
import Multiselect from '@vueform/multiselect'

import config from '../../../config'
import type { DatasetProperties } from '../../../model'
import { Availability } from '../../../model'
import SearchAPI from '../../../services/api/SearchAPI'
import Tooltip from '../../Tooltip.vue'

export default {
  name: 'DatasetPropertiesForm',
  components: {
    Tooltip: Tooltip,
    Multiselect: Multiselect
  },
  props: {
    alreadySelectedDatasets: {
      type: Array<DatasetProperties>,
      default: []
    }
  },
  data(): DatasetProperties {
    return this.initData()
  },
  computed: {
    availabilityEnum() {
      return Availability
    }
  },
  watch: {
    availability() {
      this.uri = null
      this.ecosphereId = null
    },
    ecosphereId(newId) {
      if (newId !== null) {
        this.uri = this.getDatasetPage(this.ecosphereId)
      }
    }
  },
  methods: {
    initData() {
      return {
        label: '',
        purpose: '',
        availability: Availability.NOT_AVAILABLE,
        uri: null,
        ecosphereId: null
      }
    },
    handleSubmit() {
      this.$emit('addDataset', { ...this.$data })
      Object.assign(this.$data, this.initData())
    },
    getDatasetPage(id: string): string {
      const url = config.website.menu_items.find(
        (page) => page.id === 'datasets'
      )
      return `${url.linkPage}/${id}`
    },
    async ecospheresDatasetsOptions(query: string) {
      if (!query) return []
      const datasets = (
        await new SearchAPI()._search(query, config.universe.topic_id, 1, {
          page_size: 10
        })
      ).data
      const options = datasets.map((dataset) => {
        return this.datasetToOption(dataset)
      })
      return options.filter((option) => !this.alreadySelected(option.value))
    },
    datasetToOption(dataset) {
      return { value: dataset.id, label: dataset.title, uri: dataset.uri }
    },
    alreadySelected(id: string): boolean {
      for (const selectedDataset of this.alreadySelectedDatasets) {
        if (selectedDataset.ecosphereId === id) return true
      }
      return false
    }
  }
}
</script>
