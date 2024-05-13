<script setup lang="ts">
import type { DatasetV2 } from '@etalab/data.gouv.fr-components'
import { ref, computed, watch, type PropType, type Ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

import { Availability, type DatasetProperties } from '@/model/topic'
import { useDatasetStore } from '@/store/DatasetStore'
import { isAvailable as isAvailableTest } from '@/utils/topic'

import DatasetPropertiesTextFields from './DatasetPropertiesTextFields.vue'
import SelectDataset from './SelectDataset.vue'

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

const router = useRouter()
const datasetStore = useDatasetStore()

const datasetProperties = ref(props.datasetProperties)
const selectedDataset: Ref<DatasetV2 | undefined> = ref(undefined)

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

const onSelectDataset = (value: DatasetV2) => {
  datasetProperties.value.availability = Availability.LOCAL_AVAILABLE
  datasetProperties.value.id = value.id
  const resolved = router.resolve({
    name: 'bouquet_detail',
    params: { bid: value.id }
  })
  datasetProperties.value.uri = resolved.href
}

const onClearDataset = () => {
  datasetProperties.value.uri = null
  datasetProperties.value.id = null
}

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
  () => datasetProperties.value.availability,
  (newVal, oldVal) => {
    if (oldVal !== newVal && newVal !== Availability.LOCAL_AVAILABLE) {
      selectedDataset.value = undefined
      datasetProperties.value.title = ''
    }
  }
)

watch(
  datasetProperties,
  (newVal) => {
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

onMounted(() => {
  if (props.datasetProperties.id) {
    datasetStore.load(props.datasetProperties.id).then((dataset) => {
      selectedDataset.value = dataset
    })
  }
})
</script>

<template>
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
      @select-dataset="onSelectDataset"
      @clear-dataset="onClearDataset"
    />
  </div>
  <div v-if="!selectedDataset" class="fr-mt-4w">
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
  <!-- step 2, when a dataset or a choice is selected -->
  <div
    v-if="
      selectedDataset?.id ||
      datasetProperties.availability !== Availability.LOCAL_AVAILABLE
    "
  >
    <div
      v-if="datasetProperties.availability === Availability.URL_AVAILABLE"
      class="fr-mt-1w fr-mb-4w"
    >
      <label class="fr-label" for="alt-link">
        Déclarer le chemin d'accés vers le jeu de données<span class="required"
          >&nbsp;*</span
        >
      </label>
      <DsfrInput
        id="alt-link"
        v-model="datasetProperties.uri"
        placeholder="Url vers le jeu de données souhaité"
        :label-visible="true"
        class="fr-mb-md-1w"
      />
    </div>
    <DatasetPropertiesTextFields
      v-model:dataset-properties="datasetProperties"
    />
  </div>
</template>

<style scoped lang="scss">
textarea {
  height: 150px;
}
</style>
