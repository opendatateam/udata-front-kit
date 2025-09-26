<script setup lang="ts">
import type { DsfrButtonGroupProps } from '@gouvminint/vue-dsfr'
import { computed, ref, type Ref } from 'vue'
import { useRouter } from 'vue-router'

import config from '@/config'
import type { DatasetModalData } from '@/model/dataset'
import { Availability, ResolvedFactor, type FactorsGroups } from '@/model/topic'
import { useCurrentPageConf } from '@/router/utils'
import { useDatasetStore } from '@/store/OrganizationDatasetStore'
import { useSiteId } from '@/utils/config'
import { useForm, type AllowedInput } from '@/utils/form'
import FactorFields from './FactorFields.vue'

export interface FactorEditModalType {
  addFactor: () => void
  editFactor: (element: ResolvedFactor, index: number) => void
}

const emits = defineEmits(['submitModal'])

const router = useRouter()
const { pageConf } = useCurrentPageConf()

const factors = defineModel({
  type: Object as () => ResolvedFactor[],
  required: true
})
const factorsGroups = defineModel('groups-model', {
  type: Object as () => FactorsGroups,
  default: []
})
const props = defineProps({
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
  const modalFactor = modalData.value.factor
  if (props.datasetEditorialization) {
    if (!modalFactor?.title.trim()) {
      formErrors.value.push('title')
    }
    if (!modalFactor?.description?.trim()) {
      formErrors.value.push('purpose')
    }
    if (
      !modalFactor?.siteExtras.uri &&
      modalFactor?.siteExtras.availability === Availability.LOCAL_AVAILABLE
    ) {
      formErrors.value.push('availability')
    }
    if (
      !modalFactor?.siteExtras.uri &&
      modalFactor?.siteExtras.availability === Availability.URL_AVAILABLE
    ) {
      formErrors.value.push('availabilityUrl')
    }
  }
  if (
    modalFactor?.siteExtras.group &&
    modalFactor?.siteExtras.group.length > 100
  ) {
    formErrors.value.push('group')
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

const errorSummary = useTemplateRef<ComponentPublicInstance>('errorSummary')

const onCancel = () => {
  // reset error fields
  formErrors.value = []
  isSubmitted.value = false
  closeModal()
}

const editFactor = (dataset: ResolvedFactor, index: number) => {
  // Create a deep clone to enable cancellation
  const clonedData = JSON.parse(JSON.stringify(dataset))
  modalData.value = {
    index,
    factor: new ResolvedFactor(clonedData, dataset.siteId),
    isValid: false,
    mode: 'edit'
  }
  isModalOpen.value = true
}

const addFactor = () => {
  const factor = new ResolvedFactor(
    {
      title: '',
      description: '',
      tags: [],
      element: null,
      extras: {
        [useSiteId()]: {
          availability: Availability.LOCAL_AVAILABLE,
          uri: null
        }
      }
    },
    useSiteId()
  )
  modalData.value = {
    index: undefined,
    factor,
    isValid: false,
    mode: 'create'
  }
  isModalOpen.value = true
}

const submit = async (modalData: DatasetModalData) => {
  if (modalData.factor !== undefined) {
    // check if data.gouv.fr URL and update metadata if needed
    const siteExtras = modalData.factor.extras?.[useSiteId()]
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
            modalData.factor.element = {
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
      factors.value.push(modalData.factor)
    } else if (modalData.mode === 'edit' && modalData.index !== undefined) {
      factors.value[modalData.index] = modalData.factor
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

defineExpose({ addFactor, editFactor })
</script>

<template>
  <DsfrModal
    v-if="isModalOpen && modalData.factor"
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
      <FactorFields
        v-model="modalData.factor"
        v-model:groups-model="factorsGroups"
        v-model:errors-model="formErrors"
        :dataset-editorialization
        :factors-in-topic="factors"
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
