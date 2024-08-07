<script setup lang="ts">
import type { DatasetV2 } from '@etalab/data.gouv.fr-components'
import {
  ref,
  computed,
  watch,
  type PropType,
  type Ref,
  onMounted,
  defineModel
} from 'vue'
import { useRouter } from 'vue-router'

import config from '@/config'
import { Availability, type DatasetProperties } from '@/model/topic'
import { useDatasetStore } from '@/store/DatasetStore'

import DatasetPropertiesTextFields from './DatasetPropertiesTextFields.vue'
import SelectDataset from './SelectDataset.vue'

const emit = defineEmits(['updateValidation'])
const datasetEditorialization = ref(
  config.website.topics.datasetEditorialization
)

const datasetProperties = defineModel({
  type: Object as PropType<DatasetProperties>,
  required: true
})

defineProps({
  alreadySelectedDatasets: {
    type: Array<DatasetProperties>,
    default: []
  }
})

const router = useRouter()
const datasetStore = useDatasetStore()

const selectedDataset: Ref<DatasetV2 | undefined> = ref(undefined)

const hasMandatoryFields = computed(() => {
  return (
    !!datasetProperties.value.title.trim() &&
    !!datasetProperties.value.purpose.trim()
  )
})

const isValidDataset = computed((): boolean => {
  if (datasetEditorialization.value) {
    return (
      !datasetProperties.value.remoteDeleted &&
      hasMandatoryFields.value &&
      isValidEcosphereDataset.value &&
      isValidUrlDataset.value
    )
  } else {
    return isValidEcosphereDataset.value && isValidUrlDataset.value
  }
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

const onSelectDataset = (value: DatasetV2 | undefined) => {
  if (value === undefined) {
    datasetProperties.value.uri = null
    datasetProperties.value.id = null
  } else {
    datasetProperties.value.availability = Availability.LOCAL_AVAILABLE
    datasetProperties.value.id = value.id
    const resolved = router.resolve({
      name: 'dataset_detail',
      params: { did: value.id }
    })
    datasetProperties.value.uri = resolved.href
    delete datasetProperties.value.remoteDeleted
  }
}

watch(
  isValidDataset,
  (newValue) => {
    emit('updateValidation', newValue)
  },
  { immediate: true }
)

watch(
  () => datasetProperties.value.availability,
  (availability) => {
    console.log('watch', availability)
    if (availability !== Availability.LOCAL_AVAILABLE) {
      selectedDataset.value = undefined
      datasetProperties.value.uri = null
      datasetProperties.value.id = null
    }
    delete datasetProperties.value.remoteDeleted
  }
)

onMounted(() => {
  if (datasetProperties.value.id && !datasetProperties.value.remoteDeleted) {
    datasetStore.load(datasetProperties.value.id).then((dataset) => {
      selectedDataset.value = dataset
    })
  }
})
</script>

<template>
  <DatasetPropertiesTextFields
    v-model:dataset-properties="datasetProperties"
    v-if="datasetEditorialization"
  />
  <div class="fr-mt-1w fr-mb-4w">
    <label class="fr-label" for="link"
      >Jeu de données
      <span class="fr-hint-text"
        >Rechercher un jeu de données dans data.gouv.fr</span
      >
    </label>
    <SelectDataset
      v-model="selectedDataset"
      :already-selected-datasets="alreadySelectedDatasets"
      @update:model-value="onSelectDataset"
    />
  </div>
  <div v-if="!selectedDataset && datasetEditorialization" class="fr-mt-4w">
    <label class="fr-label" for="alt-source"
      >Vous ne trouvez pas le jeu de données dans data.gouv.fr&nbsp;?</label
    >
    <fieldset id="alt-source" class="fr-fieldset">
      <div class="fr-fieldset__content" role="radiogroup">
        <DsfrRadioButton
          v-model="datasetProperties.availability"
          :name="Availability.URL_AVAILABLE"
          :value="Availability.URL_AVAILABLE"
          label="J'ajoute l'URL"
        />
        <div
          v-if="datasetProperties.availability === Availability.URL_AVAILABLE"
          class="fr-mb-4w"
        >
          <DsfrInput
            id="alt-link"
            v-model="datasetProperties.uri"
            placeholder="Url vers le jeu de données souhaité"
            :label-visible="true"
            class="fr-mb-md-1w"
          />
        </div>
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
  </div>
</template>

<style scoped lang="scss">
textarea {
  height: 150px;
}
</style>
