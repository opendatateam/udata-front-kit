<script setup lang="ts">
import type { DatasetV2 } from '@datagouv/components'
import type { DsfrButtonGroupProps } from '@gouvminint/vue-dsfr'
import { capitalize, computed, onMounted, ref, type Ref } from 'vue'
import { useLoading } from 'vue-loading-overlay'
import { toast } from 'vue3-toastify'

import ErrorMessage from '@/components/forms/ErrorMessage.vue'
import DatasetPropertiesTextFields from '@/components/forms/dataset/DatasetPropertiesTextFields.vue'
import type { PageConf } from '@/model/config'
import type { Topic } from '@/model/topic'
import { Availability, type DatasetProperties } from '@/model/topic'
import { useTopicStore } from '@/store/TopicStore'
import { useDatasetsConf, useSiteId } from '@/utils/config'
import { useForm } from '@/utils/form'
import { useExtras } from '@/utils/topic'
import { useGroups } from '@/utils/topicGroups'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  dataset: {
    type: Object as () => DatasetV2,
    required: true
  },
  topicPageConf: {
    type: Object as () => PageConf,
    required: true
  }
})

const emit = defineEmits(['update:show'])
const loader = useLoading()
const topicStore = useTopicStore()
const datasetsConf = useDatasetsConf()

const bouquets = topicStore.myTopics
const datasetProperties = ref<DatasetProperties>({
  title: '',
  purpose: '',
  id: props.dataset.id,
  uri: `/datasets/${props.dataset.id}`,
  availability: Availability.LOCAL_AVAILABLE
})
const selectedBouquetId: Ref<string | null> = ref(null)

const bouquetOptions = computed(() => {
  return bouquets.value.map((bouquet) => {
    return {
      value: bouquet.id,
      text: bouquet.name
    }
  })
})

const formErrors: Ref<string[]> = ref([])

const validateFields = () => {
  if (!datasetProperties.value.title.trim()) {
    formErrors.value.push('title')
  }
  if (!datasetProperties.value.purpose.trim()) {
    formErrors.value.push('purpose')
  }
  if (!selectedBouquetId.value) {
    formErrors.value.push('bouquetId')
  }
  if (
    datasetProperties.value.group &&
    datasetProperties.value.group.trim().length > 100
  ) {
    formErrors.value.push('group')
  }
}

const isValid = computed(() => {
  if (datasetsConf.add_to_topic?.dataset_editorialization) {
    return !formErrors.value.length
  } else {
    return !!selectedBouquetId.value
  }
})

const modalActions: Ref<DsfrButtonGroupProps['buttons']> = computed(() => {
  return [
    {
      label: 'Annuler',
      secondary: true,
      onClick: () => closeModal()
    },
    {
      label: 'Enregistrer',
      onClick: () => handleSubmit()
    }
  ]
})

const errorSummary = useTemplateRef('errorSummary')
const selectedBouquet: Ref<Topic | null> = ref(null)

watch(selectedBouquetId, async () => {
  selectedBouquet.value =
    selectedBouquetId.value === null
      ? null
      : await topicStore.load(selectedBouquetId.value)
})

const { datasetsProperties } = useExtras(selectedBouquet)

const isDatasetInBouquet = computed(() => {
  if (!selectedBouquetId.value) {
    return false
  }
  return datasetsProperties.value.some(
    (datasetProps) => datasetProps.id === props.dataset.id
  )
})

const { groupedDatasets: datasetsGroups } = useGroups(datasetsProperties)

const submit = async () => {
  const topicsExtrasKey = useSiteId()
  if (selectedBouquet.value === null) {
    throw Error('Trying to attach to topic without id')
  }
  const newDatasetsProperties =
    selectedBouquet.value.extras[topicsExtrasKey].datasets_properties || []
  newDatasetsProperties.push(datasetProperties.value)
  selectedBouquet.value.extras[topicsExtrasKey].datasets_properties =
    newDatasetsProperties
  await topicStore.update(selectedBouquet.value.id, {
    id: selectedBouquet.value.id,
    tags: selectedBouquet.value.tags,
    extras: selectedBouquet.value.extras
  })
  toast(
    `Jeu de données ajouté avec succès au ${props.topicPageConf.object.singular} "${selectedBouquet.value.name}"`,
    {
      type: 'success'
    }
  )
  closeModal()
}

const {
  formErrorMessagesMap,
  sortedErrors,
  getErrorMessage,
  isSubmitted,
  handleSubmit
} = useForm(formErrors, props.topicPageConf.object.singular, {
  validateFields,
  onSuccess: submit,
  errorSummaryRef: errorSummary,
  isValid
})

const closeModal = () => {
  emit('update:show', false)
}

onMounted(() => {
  const loading = loader.show()
  topicStore.loadTopicsForUniverse().then(() => loading.hide())
})
</script>

<template>
  <DsfrModal
    v-if="show"
    size="lg"
    :title="`Ajouter le jeu de données à un de vos ${topicPageConf.object.plural}`"
    :opened="show"
    aria-modal="true"
    class="form"
    @close="closeModal"
  >
    <ErrorSummary
      v-show="formErrors.length"
      ref="errorSummary"
      :form-error-messages-map
      :form-errors="sortedErrors"
      heading-level="h3"
    />
    <DsfrSelect
      id="input-bouquetId"
      v-model="selectedBouquetId"
      :label="`${capitalize(topicPageConf.object.singular)} à associer (obligatoire)`"
      :options="bouquetOptions"
      :default-unselected-text="`Choisissez un ${topicPageConf.object.singular}`"
      :aria-invalid="
        formErrors.includes('bouquetId') && isSubmitted ? true : undefined
      "
      aria-errormessage="errors-bouquetId"
    />
    <ErrorMessage
      v-if="!!getErrorMessage('bouquetId')"
      input-name="bouquetId"
      :error-message="getErrorMessage('bouquetId')"
    />

    <DsfrBadge
      v-if="isDatasetInBouquet"
      type="info"
      label="Déjà utilisé dans ce bouquet"
      small
      ellipsis
      class="fr-mb-2w"
    />
    <div class="fr-input-group">
      <SelectTopicGroup
        v-model:properties-model="datasetProperties"
        v-model:groups-model="datasetsGroups"
        label="Regroupement"
        description="Rechercher ou créer un regroupement (100 caractères maximum). Un regroupement contient un ou plusieurs jeux de données."
        :error-message="getErrorMessage('group')"
      />
    </div>
    <DatasetPropertiesTextFields
      v-if="datasetsConf.add_to_topic?.dataset_editorialization"
      v-model:dataset-properties-model="datasetProperties"
      :error-title="getErrorMessage('title')"
      :error-purpose="getErrorMessage('purpose')"
    />

    <slot name="footer">
      <DsfrButtonGroup
        v-if="modalActions?.length"
        align="right"
        :buttons="modalActions"
        inline-layout-when="large"
      />
    </slot>
  </DsfrModal>
</template>

<style scoped>
.fr-select-group:has(+ .fr-badge) {
  margin-bottom: 0.5rem;
}
:deep(.fr-select-group:has(+ #errors-bouquetId)) {
  margin-bottom: 0;
}
</style>
