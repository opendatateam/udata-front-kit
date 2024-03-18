<script setup lang="ts">
import { type DatasetV2 } from '@etalab/data.gouv.fr-components'
import Multiselect from '@vueform/multiselect'
import { ref, computed, watch, type PropType } from 'vue'

import Tooltip from '@/components/TooltipWrapper.vue'
import config from '@/config'
import {
  Availability,
  isAvailable as isAvailableTest,
  type DatasetProperties
} from '@/model'
import SearchAPI from '@/services/api/SearchAPI'

const emit = defineEmits(['update:datasetProperties', 'updateValidation'])

const props = defineProps({
  datasetProperties: {
    type: Object as PropType<DatasetProperties>,
    required: true
  },
  alreadySelectedDatasets: {
    type: Array<DatasetProperties>,
    default: []
  }
})

const datasetProperties = ref(props.datasetProperties)

const datasetToOption = (dataset: DatasetV2) => {
  return { value: dataset.id, label: dataset.title, uri: dataset.uri }
}

const alreadySelected = (id: string): boolean => {
  for (const selectedDataset of props.alreadySelectedDatasets) {
    if (selectedDataset.id === id) return true
  }
  return false
}

const ecospheresDatasetsOptions = async (query: string) => {
  if (!query) return []
  const datasets = (
    await new SearchAPI().search(query, config.universe.topic_id, 1, {
      page_size: 10
    })
  ).data
  const options = datasets.map((dataset) => {
    return datasetToOption(dataset)
  })
  return options.filter((option) => !alreadySelected(option.value))
}

const hasMandatoryFields = computed(() => {
  return (
    !!datasetProperties.value.title.trim() &&
    !!datasetProperties.value.purpose.trim()
  )
})

const isValidDataset = computed((): boolean => {
  return (
    hasMandatoryFields.value &&
    isValidEcosphereDataset.value &&
    isValidUrlDataset.value
  )
})

const isValidEcosphereDataset = computed((): boolean => {
  if (datasetProperties.value.availability === Availability.LOCAL_AVAILABLE) {
    return (
      datasetProperties.value.uri !== null &&
      datasetProperties.value.id !== null
    )
  }
  return true
})

const isValidUrlDataset = computed((): boolean => {
  if (datasetProperties.value.availability === Availability.URL_AVAILABLE) {
    return datasetProperties.value.uri !== null
  }
  return true
})

const isAvailable = computed(() =>
  isAvailableTest(datasetProperties.value.availability)
)

watch(
  isValidDataset,
  (newValue) => {
    emit('updateValidation', newValue)
  },
  { immediate: true }
)

watch(isAvailable, (newVal) => {
  if (!newVal) {
    datasetProperties.value.uri = null
    datasetProperties.value.id = null
  }
})

watch(
  datasetProperties,
  (newVal) => {
    if (newVal.id && newVal.availability === Availability.LOCAL_AVAILABLE) {
      // FIXME: use router and slug?
      datasetProperties.value.uri = `/datasets/${newVal.id}`
    }
    emit('update:datasetProperties', newVal)
  },
  { deep: true }
)

watch(
  () => props.datasetProperties,
  (newVal) => {
    datasetProperties.value = newVal
  }
)
</script>

<template>
  <div class="fr-mt-1w fr-mb-4w">
    <label class="fr-label" for="label"
      >Libellé de la donnée <span class="required">&nbsp;*</span></label
    >
    <input
      id="label"
      v-model="datasetProperties.title"
      class="fr-input"
      type="text"
    />
  </div>
  <div class="fr-mt-1w fr-mb-4w">
    <div class="container">
      Raison d'utilisation dans ce bouquet
      <span class="required">&nbsp;*</span>
      <Tooltip
        text="Ajoutez ici l'ensemble des informations nécessaires à la compréhension, l'objectif et l'utilisation du bouquet. N'hésitez pas à indiquer la réglementation ou une documentation liée au bouquet."
      />
    </div>
    <div class="container">
      Utilisez du markdown pour mettre en forme votre texte
      <Tooltip
        text="* simple astérisque pour italique *<br/> ** double astérisque pour gras **<br/> # un dièse pour titre 1<br/> ## deux dièses pour titre 2<br/> *  astérisque pour une liste<br/> lien : [[https://exemple.fr]]"
      />
    </div>
    <textarea
      id="purpose"
      v-model="datasetProperties.purpose"
      class="fr-input"
      type="text"
    />
  </div>
  <div class="fr-mt-1w fr-mb-4w">
    <label class="fr-label" for="source">Retrouver la donnée via</label>
    <fieldset id="source" class="fr-fieldset">
      <div class="fr-fieldset__content" role="radiogroup">
        <DsfrRadioButton
          v-model="datasetProperties.availability"
          :name="Availability.LOCAL_AVAILABLE"
          :value="Availability.LOCAL_AVAILABLE"
          label="ecologie.data.gouv.fr"
        />
        <DsfrRadioButton
          v-model="datasetProperties.availability"
          :name="Availability.URL_AVAILABLE"
          :value="Availability.URL_AVAILABLE"
          label="URL"
        />
        <DsfrRadioButton
          v-model="datasetProperties.availability"
          :name="Availability.MISSING"
          :value="Availability.MISSING"
          label="Je n'ai pas trouvé la donnée"
        />
        <DsfrRadioButton
          v-model="datasetProperties.availability"
          :name="Availability.NOT_AVAILABLE"
          :value="Availability.NOT_AVAILABLE"
          label="Je n'ai pas cherché la donnée"
        />
      </div>
    </fieldset>
    <div v-if="isAvailable">
      <label class="fr-label" for="link">Déclarer le chemin d'accés</label>
      <Multiselect
        v-if="datasetProperties.availability === Availability.LOCAL_AVAILABLE"
        id="link"
        ref="selector"
        v-model="datasetProperties.id"
        no-options-text="Précisez ou élargissez votre recherche"
        placeholder="Rechercher une donnée dans ecologie.data.gouv.fr"
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
        v-if="datasetProperties.availability === Availability.URL_AVAILABLE"
        id="link"
        v-model="datasetProperties.uri"
        placeholder="Url vers le jeu de données souhaité"
        :label-visible="true"
        class="fr-mb-md-1w"
      />
    </div>
  </div>
</template>

<style scoped lang="scss">
textarea {
  height: 150px;
}
</style>
