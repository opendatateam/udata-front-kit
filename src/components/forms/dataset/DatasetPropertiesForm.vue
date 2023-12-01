<template>
  <div class="app">
    <form @submit.prevent="handleSubmit" class="checkout-form">
      <h2>Ajout d'un dataset</h2>

      <div class="fr-mt-1w fr-mb-4w">
        <label class="fr-label" for="label">Libellé de la donnée</label>
        <input class="fr-input" type="text" id="label" v-model="label" />
      </div>
      <div>
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
      <p><strong>Retrouver la donnée via</strong></p>
      <div class="fr-grid-row fr-mb-3w">
        <div class="fr-col-12">
          <fieldset class="fr-fieldset">
            <div class="fr-fieldset__content" role="radiogroup">
              <DsfrRadioButton
                v-model="availability"
                :value="availabilityEnum.ECO_AVAILABLE"
                label="Écosphères"
                name="addData"
              />
              <div
                class="fr-grid-row"
                v-if="availability === availabilityEnum.ECO_AVAILABLE"
              >
                <div class="fr-col-6">
                  <Multiselect
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
                </div>
              </div>
              <DsfrRadioButton
                v-model="availability"
                :value="availabilityEnum.URL_AVAILABLE"
                label="URL"
                name="addData"
              />
              <div
                class="fr-grid-row"
                v-if="availability === availabilityEnum.URL_AVAILABLE"
              >
                <div class="fr-col-4">
                  <DsfrInput
                    v-model="uri"
                    placeholder="Url vers le jeu de données souhaité"
                    :label-visible="true"
                    class="fr-mb-md-1w"
                  />
                </div>
              </div>
              <DsfrRadioButton
                v-model="availability"
                :value="availabilityEnum.MISSING"
                label="Je n'ai pas trouvé la donnée"
                name="addData"
              />
              <DsfrRadioButton
                v-model="availability"
                :value="availabilityEnum.NOT_AVAILABLE"
                label="Je n'ai pas cherché la donnée"
                name="addData"
              />
            </div>
          </fieldset>
        </div>
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
