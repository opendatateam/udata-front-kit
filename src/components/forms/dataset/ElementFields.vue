<script setup lang="ts">
import type { DatasetV2 } from '@datagouv/components'
import { computed, onMounted, ref, watch, type Ref } from 'vue'
import { useRouter } from 'vue-router'

import {
  Availability,
  ResolvedDatasetElement,
  type ElementsGroups
} from '@/model/topic'
import { useCurrentPageConf } from '@/router/utils'
import { useDatasetStore } from '@/store/OrganizationDatasetStore'
import { useForm } from '@/utils/form'

import DatasetPropertiesTextFields from './ElementTextFields.vue'
import SelectDataset from './SelectDataset.vue'

const emit = defineEmits(['updateValidation', 'update:datasetProperties'])

const element = defineModel({
  type: Object as () => ResolvedDatasetElement,
  default: {}
})

const elementsGroups = defineModel('groups-model', {
  type: Object as () => ElementsGroups,
  default: []
})

const formErrors = defineModel('errors-model', {
  type: Array<string>,
  default: []
})

const props = defineProps({
  alreadySelectedDatasets: {
    type: Array<ResolvedDatasetElement>,
    default: []
  },
  datasetEditorialization: {
    type: Boolean,
    default: false
  }
})

const router = useRouter()
const datasetStore = useDatasetStore()
const { pageConf } = useCurrentPageConf()
const { getErrorMessage } = useForm(formErrors, pageConf.labels.singular)

const selectedDataset: Ref<DatasetV2 | undefined> = ref(undefined)

const hasEditorialization = computed(() => {
  return (
    !!element.value.title.trim() &&
    !!element.value.description?.trim() &&
    (element.value.siteExtras.group
      ? element.value.siteExtras.group.trim().length < 100
      : true)
  )
})

const isValidDataset = computed((): boolean => {
  const isValidWithoutEditorialization =
    isValidCatalogDataset.value &&
    isValidUrlDataset.value &&
    !element.value.remoteDeleted

  if (!props.datasetEditorialization) return isValidWithoutEditorialization

  return isValidWithoutEditorialization && hasEditorialization.value
})

const isValidCatalogDataset = computed((): boolean => {
  if (element.value.siteExtras.availability === Availability.LOCAL_AVAILABLE) {
    return (
      element.value.siteExtras.uri !== null &&
      element.value.element?.id !== null
    )
  }
  return true
})

const isValidUrlDataset = computed((): boolean => {
  if (element.value.siteExtras.availability === Availability.URL_AVAILABLE) {
    return element.value.siteExtras.uri !== null
  }
  return true
})

const onSelectDataset = (value: DatasetV2 | undefined) => {
  if (value === undefined) {
    element.value.siteExtras.uri = null
    element.value.element = null
  } else {
    element.value.siteExtras.availability = Availability.LOCAL_AVAILABLE
    element.value.element = {
      id: value.id,
      class: 'Dataset'
    }
    const resolved = router.resolve({
      name: 'datasets_detail',
      params: { item_id: value.id }
    })
    element.value.siteExtras.uri = resolved.href
    delete element.value.remoteDeleted
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
  () => element.value.siteExtras.availability,
  (availability) => {
    if (availability !== Availability.LOCAL_AVAILABLE) {
      selectedDataset.value = undefined
      element.value.siteExtras.uri = null
      element.value.element = null
    }
    delete element.value.remoteDeleted
  }
)

onMounted(() => {
  if (element.value.element?.id && !element.value.remoteDeleted) {
    datasetStore.load(element.value.element.id).then((dataset) => {
      selectedDataset.value = dataset
    })
  }
})
</script>

<template>
  <DatasetPropertiesTextFields
    v-if="datasetEditorialization"
    v-model:element-model="element"
    :error-title="getErrorMessage('title')"
    :error-purpose="getErrorMessage('purpose')"
  />
  <div id="input-availability" tabindex="-1">
    <div class="fr-mt-1w fr-mb-4w">
      <SelectDataset
        v-model="selectedDataset"
        :already-selected-datasets="alreadySelectedDatasets"
        :is-invalid="formErrors.includes('availability')"
        @update:model-value="onSelectDataset"
      />
    </div>
    <div v-if="!selectedDataset && datasetEditorialization" class="fr-mt-4w">
      <fieldset
        class="fr-fieldset availability"
        role="radiogroup"
        aria-errormessage="errors-availability"
        :aria-invalid="formErrors.includes('availability') ? true : undefined"
      >
        <legend class="fr-fieldset__legend fr-fieldset__legend--regular">
          Vous ne trouvez pas le jeu de données dans data.gouv.fr&nbsp;?
        </legend>
        <DsfrRadioButton
          v-model="element.siteExtras.availability"
          name="source"
          :value="Availability.URL_AVAILABLE"
          label="J'ajoute l'URL"
        />
        <div
          v-if="element.siteExtras.availability === Availability.URL_AVAILABLE"
          class="fr-mb-4w fr-fieldset__element"
        >
          <DsfrInput
            id="input-availabilityUrl"
            v-model="element.siteExtras.uri"
            label="Url vers le jeu de données souhaité (obligatoire)"
            :label-visible="true"
            class="fr-mb-md-1w fr-input"
            aria-errormessage="errors-availabilityUrl"
            :aria-invalid="
              formErrors.includes('availabilityUrl') ? true : undefined
            "
          />
          <ErrorMessage
            v-if="!!getErrorMessage('availabilityUrl')"
            input-name="availabilityUrl"
            :error-message="getErrorMessage('availabilityUrl')"
          />
        </div>
        <DsfrRadioButton
          v-model="element.siteExtras.availability"
          name="source"
          :value="Availability.MISSING"
          label="Je n'ai pas trouvé la donnée"
        />
        <DsfrRadioButton
          v-model="element.siteExtras.availability"
          name="source"
          :value="Availability.NOT_AVAILABLE"
          label="Je n'ai pas cherché la donnée"
        />
      </fieldset>
    </div>
    <ErrorMessage
      v-if="!!getErrorMessage('availability')"
      :error-message="getErrorMessage('availability')"
      input-name="availability"
    />
  </div>
  <div class="fr-input-group">
    <SelectTopicGroup
      v-model:element-model="element"
      v-model:groups-model="elementsGroups"
      label="Regroupement"
      description="Rechercher ou créer un regroupement (100 caractères maximum). Un regroupement contient un ou plusieurs jeux de données."
      :error-message="getErrorMessage('group')"
    />
  </div>
</template>

<style scoped>
.fr-fieldset {
  margin: 30px 0;
}
.fr-fieldset.availability[aria-invalid='true'] {
  border: none;
  outline: 2px solid var(--border-plain-error);
}
#input-availability:focus {
  outline-style: solid;
}
fieldset legend {
  inline-size: fit-content;
}
textarea {
  height: 150px;
}
</style>
