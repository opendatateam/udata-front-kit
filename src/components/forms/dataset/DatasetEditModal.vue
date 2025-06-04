<script setup lang="ts">
import type { DsfrButtonGroupProps } from '@gouvminint/vue-dsfr'
import { computed, ref, type Ref } from 'vue'
import { useRouter } from 'vue-router'

import config from '@/config'
import type { DatasetModalData } from '@/model/dataset'
import {
  Availability,
  type DatasetElement,
  type ElementsGroups
} from '@/model/topic'
import { useCurrentPageConf } from '@/router/utils'
import { useDatasetStore } from '@/store/OrganizationDatasetStore'
import { useSiteId } from '@/utils/config'
import { useForm, type AllowedInput } from '@/utils/form'
import DatasetPropertiesFields from './ElementFields.vue'

export interface DatasetEditModalType {
  addDataset: () => void
  editDataset: (dataset: DatasetElement, index: number) => void
}

const emits = defineEmits(['submitModal'])

const router = useRouter()
const { pageConf } = useCurrentPageConf()

const elements = defineModel({
  type: Object as () => DatasetElement[],
  required: true
})
const datasetsGroups = defineModel('groups-model', {
  type: Object as () => ElementsGroups,
  default: []
})
defineProps({
  datasetEditorialization: {
    type: Boolean,
    default: false
  }
})

const isModalOpen = ref(false)
const modalData: Ref<DatasetModalData> = ref({
  isValid: false,
  mode: 'edit'
})

const formErrors: Ref<AllowedInput[]> = ref([])

const validateFields = () => {
  if (!modalData.value.element?.title.trim()) {
    formErrors.value.push('title')
  }
  if (!modalData.value.element?.description?.trim()) {
    formErrors.value.push('purpose')
  }
  const siteExtras = modalData.value.element?.extras?.[useSiteId()]
  if (siteExtras?.group && siteExtras?.group.length > 100) {
    formErrors.value.push('group')
  }
  if (
    !siteExtras?.uri &&
    siteExtras?.availability === Availability.LOCAL_AVAILABLE
  ) {
    formErrors.value.push('availability')
  }
  if (
    !siteExtras?.uri &&
    siteExtras?.availability === Availability.URL_AVAILABLE
  ) {
    formErrors.value.push('availabilityUrl')
  }
}

const modalActions: Ref<DsfrButtonGroupProps['buttons']> = computed(() => {
  return [
    {
      label: 'Annuler',
      type: 'button',
      secondary: true,
      onClick: () => {
        onCancel()
      }
    },
    {
      label: 'Enregistrer',
      type: 'button',
      onClick: ($event: MouseEvent) => {
        $event.preventDefault()
        handleSubmit()
      }
    }
  ]
})

const errorSummary = useTemplateRef('errorSummary')

const onCancel = () => {
  // reset error fields
  formErrors.value = []
  isSubmitted.value = false
  closeModal()
}

const editDataset = (dataset: DatasetElement, index: number) => {
  // clone the object to enable cancellation
  modalData.value = {
    index,
    element: { ...dataset },
    isValid: false,
    mode: 'edit'
  }
  isModalOpen.value = true
}

const addDataset = () => {
  modalData.value = {
    index: undefined,
    element: {
      title: '',
      description: '',
      tags: [],
      element: {},
      extras: {
        [useSiteId()]: {
          availability: Availability.LOCAL_AVAILABLE,
          uri: null
        }
      }
    },
    isValid: false,
    mode: 'create'
  }
  isModalOpen.value = true
}

const submit = async (modalData: DatasetModalData) => {
  if (modalData.element !== undefined) {
    // check if data.gouv.fr URL and update metadata if needed
    const siteExtras = modalData.element.extras?.[useSiteId()]
    if (
      siteExtras?.uri &&
      siteExtras?.availability === Availability.URL_AVAILABLE
    ) {
      const pattern = new RegExp(
        `^${config.datagouvfr.base_url}(?:/.*)?/datasets/(?<datasetName>[a-zA-Z0-9_-]+)(?:/|#|$)`
      )
      const match = pattern.exec(siteExtras.uri)
      if (match?.groups?.datasetName) {
        try {
          const dataset = await useDatasetStore().load(
            match.groups.datasetName,
            {
              toasted: false
            }
          )
          if (dataset !== undefined) {
            siteExtras.availability = Availability.LOCAL_AVAILABLE
            const resolved = router.resolve({
              name: 'datasets_detail',
              params: { item_id: dataset.id }
            })
            siteExtras.uri = resolved.href
            modalData.element.element = {
              id: dataset.id,
              class: 'Dataset'
            }
          }
        } catch (error) {
          console.error(
            `Error fetching dataset from ${config.datagouvfr.base_url}`,
            error
          )
        }
      }
    }
    if (modalData.mode === 'create') {
      elements.value.push(modalData.element)
    } else if (modalData.mode === 'edit' && modalData.index !== undefined) {
      elements.value[modalData.index] = modalData.element
    }
  }
  emits('submitModal')
  closeModal()
}

const { formErrorMessagesMap, sortedErrors, isSubmitted, handleSubmit } =
  useForm(formErrors, pageConf.labels.singular, {
    validateFields,
    onSuccess: () => submit(modalData.value),
    errorSummaryRef: errorSummary
  })

const closeModal = () => {
  isModalOpen.value = false
}

defineExpose({ addDataset, editDataset })
</script>

<template>
  <DsfrModal
    v-if="isModalOpen && modalData.element"
    size="lg"
    class="form"
    :title="
      modalData.mode === 'edit'
        ? 'Éditer le jeu de données'
        : 'Ajouter un jeu de données'
    "
    :opened="isModalOpen"
    aria-modal="true"
    @close="onCancel"
  >
    <ErrorSummary
      v-show="formErrors.length"
      ref="errorSummary"
      :form-error-messages-map
      :form-errors="sortedErrors"
      heading-level="h3"
    />
    <form novalidate>
      <DatasetPropertiesFields
        v-model="modalData.element"
        v-model:groups-model="datasetsGroups"
        v-model:errors-model="formErrors"
        :dataset-editorialization
        :already-selected-datasets="elements"
        @update-validation="(isValid: boolean) => (modalData.isValid = isValid)"
      />
    </form>
    <slot name="footer">
      <DsfrButtonGroup
        v-if="modalActions?.length"
        align="right"
        :buttons="modalActions"
        inline-layout-when="large"
        class="fr-mt-4w"
      />
    </slot>
  </DsfrModal>
</template>

<style scoped>
:deep(h1) {
  margin-bottom: 1rem;
}
</style>
