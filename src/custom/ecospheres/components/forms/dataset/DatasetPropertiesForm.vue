<template>
  <div class="app">
    <form @submit.prevent="handleSubmit">
      <h5>Ajouter un jeu de données</h5>

      <div class="fr-mt-1w fr-mb-4w">
        <label class="fr-label" for="label">Libellé de la donnée</label>
        <input class="fr-input" type="text" id="label" v-model="title" />
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
              :name="availabilityEnum.LOCAL_AVAILABLE"
              :value="availabilityEnum.LOCAL_AVAILABLE"
              label="Écosphères"
            />
            <DsfrRadioButton
              v-model="availability"
              :name="availabilityEnum.URL_AVAILABLE"
              :value="availabilityEnum.URL_AVAILABLE"
              label="URL"
            />
            <DsfrRadioButton
              v-model="availability"
              :name="availabilityEnum.MISSING"
              :value="availabilityEnum.MISSING"
              label="Je n'ai pas trouvé la donnée"
            />
            <DsfrRadioButton
              v-model="availability"
              :name="availabilityEnum.NOT_AVAILABLE"
              :value="availabilityEnum.NOT_AVAILABLE"
              label="Je n'ai pas cherché la donnée"
            />
          </div>
        </fieldset>
        <div v-if="isAvailable">
          <label class="fr-label" for="link">Déclarer le chemin d'accés</label>
          <Multiselect
            v-if="availability === availabilityEnum.LOCAL_AVAILABLE"
            id="link"
            ref="selector"
            v-model="id"
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
          <DsfrInput
            v-if="availability === availabilityEnum.URL_AVAILABLE"
            id="link"
            v-model="uri"
            placeholder="Url vers le jeu de données souhaité"
            :label-visible="true"
            class="fr-mb-md-1w"
          />
        </div>
      </div>
      <DsfrButton
        :disabled="!isValidDataset"
        type="submit"
        label="Ajouter ce jeu de données"
        :secondary="true"
      />
    </form>
  </div>
</template>

<script lang="ts">
import Multiselect from '@vueform/multiselect'

import Tooltip from '@/components/Tooltip.vue'
import config from '@/config'
import {
  type DatasetProperties,
  Availability,
  isAvailable as isAvailableTest
} from '@/model'
import SearchAPI from '@/services/api/SearchAPI'

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
    },
    isValidDataset() {
      return this.isValidEcosphereDataset && this.isValidUrlDataset
    },
    isValidEcosphereDataset(): boolean {
      if (this.availability === Availability.LOCAL_AVAILABLE) {
        return this.uri !== null && this.id !== null
      }
      return true
    },
    isValidUrlDataset(): boolean {
      if (this.availability === Availability.URL_AVAILABLE) {
        return this.uri !== null
      }
      return true
    },
    isAvailable(): boolean {
      return isAvailableTest(this.availability)
    }
  },
  watch: {
    availability() {
      this.uri = null
      this.id = null
    },
    id(newId) {
      if (newId && this.availability === Availability.LOCAL_AVAILABLE) {
        this.uri = this.getLocalDatasetPage(newId)
      }
    }
  },
  methods: {
    initData(): DatasetProperties {
      return {
        title: '',
        purpose: '',
        availability: Availability.NOT_AVAILABLE,
        uri: null,
        id: null
      }
    },
    handleSubmit() {
      this.$emit('addDataset', { ...this.$data })
      Object.assign(this.$data, this.initData())
    },
    getLocalDatasetPage(id: string): string {
      return `/datasets/${id}`
    },
    async ecospheresDatasetsOptions(query: string) {
      if (!query) return []
      // FIXME: wrong typing of search API (and probably others)
      const datasets = (
        await new SearchAPI().search(query, config.universe.topic_id, 1, {
          page_size: 10
        })
      ).data
      const options = datasets.map((dataset) => {
        return this.datasetToOption(dataset)
      })
      return options.filter((option) => !this.alreadySelected(option.value))
    },
    datasetToOption(dataset: DatasetProperties) {
      return { value: dataset.id, label: dataset.title, uri: dataset.uri }
    },
    alreadySelected(id: string): boolean {
      for (const selectedDataset of this.alreadySelectedDatasets) {
        if (selectedDataset.id === id) return true
      }
      return false
    }
  }
}
</script>
