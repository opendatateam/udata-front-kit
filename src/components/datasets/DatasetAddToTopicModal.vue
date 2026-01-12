<script setup lang="ts">
import type { DatasetV2 } from '@datagouv/components-next'
import type { DsfrButtonGroupProps } from '@gouvminint/vue-dsfr'
import { capitalize, computed, onMounted, ref, type Ref } from 'vue'
import { useLoading } from 'vue-loading-overlay'
import { toast } from 'vue3-toastify'

import ErrorMessage from '@/components/forms/ErrorMessage.vue'
import FactorTextFields from '@/components/forms/dataset/FactorTextFields.vue'
import type { Topic } from '@/model/topic'
import { Availability, ResolvedFactor } from '@/model/topic'
import { useTopicElementStore } from '@/store/TopicElementStore'
import { useTopicStore } from '@/store/TopicStore'
import { useDatasetsConf, usePageConf, useSiteId } from '@/utils/config'
import { useForm } from '@/utils/form'
import { useTopicFactors } from '@/utils/topic'
import { useGroups } from '@/utils/topicGroups'
import SelectTopicFactorGroup from '../forms/SelectTopicFactorGroup.vue'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  dataset: {
    type: Object as () => DatasetV2,
    required: true
  },
  topicPageKey: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['update:show'])
const loader = useLoading()
const topicStore = useTopicStore()
const datasetsConf = useDatasetsConf()
const topicPageConf = usePageConf(props.topicPageKey)

const topics = topicStore.myTopics
const factor = ref<ResolvedFactor>(
  new ResolvedFactor(
    {
      title: '',
      description: '',
      tags: [],
      element: {
        class: 'Dataset',
        id: props.dataset.id
      },
      extras: {
        [useSiteId()]: {
          uri: `/datasets/${props.dataset.id}`,
          availability: Availability.LOCAL_AVAILABLE
        }
      }
    },
    useSiteId()
  )
)
const selectedTopicId: Ref<string | null> = ref(null)

const topicOptions = computed(() => {
  return topics.value.map((topic) => {
    return {
      value: topic.id,
      text: topic.name
    }
  })
})

const formErrors: Ref<string[]> = ref([])

const validateFields = () => {
  if (!factor.value.title.trim()) {
    formErrors.value.push('title')
  }
  if (!factor.value.description?.trim()) {
    formErrors.value.push('purpose')
  }
  if (!selectedTopicId.value) {
    formErrors.value.push('topicId')
  }
  if (
    factor.value.siteExtras.group &&
    factor.value.siteExtras.group.trim().length > 100
  ) {
    formErrors.value.push('group')
  }
}

const isValid = computed(() => {
  return !formErrors.value.length
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

const errorSummary = useTemplateRef<ComponentPublicInstance>('errorSummary')
const selectedTopic: Ref<Topic | null> = ref(null)

watch(selectedTopicId, async () => {
  selectedTopic.value =
    selectedTopicId.value === null
      ? null
      : await topicStore.load(selectedTopicId.value)
})

const { factors } = useTopicFactors(selectedTopic)

const isDatasetInTopic = computed(() => {
  if (!selectedTopicId.value) {
    return false
  }
  return factors.value.some((factor) => factor.element?.id === props.dataset.id)
})

const { groupedFactors: groups } = useGroups(factors)

const submit = async () => {
  if (selectedTopic.value === null) {
    throw Error('Trying to attach to topic without id')
  }
  await useTopicElementStore().createElement(
    selectedTopic.value.id,
    factor.value
  )
  toast(
    `Jeu de données ajouté avec succès au ${topicPageConf.labels.singular} "${selectedTopic.value.name}"`,
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
} = useForm(formErrors, topicPageConf.labels.singular, {
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
  topicStore
    .loadTopicsForUniverse(props.topicPageKey)
    .then(() => loading.hide())
})
</script>

<template>
  <DsfrModal
    v-if="show"
    size="lg"
    :title="`Ajouter le jeu de données à un de vos ${topicPageConf.labels.plural}`"
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
      id="input-topicId"
      v-model="selectedTopicId"
      :label="`${capitalize(topicPageConf.labels.singular)} à associer (obligatoire)`"
      :options="topicOptions"
      :default-unselected-text="`Choisissez un ${topicPageConf.labels.singular}`"
      :aria-invalid="
        formErrors.includes('topicId') && isSubmitted ? true : undefined
      "
      aria-errormessage="errors-topicId"
    />
    <ErrorMessage
      v-if="!!getErrorMessage('topicId')"
      input-name="topicId"
      :error-message="getErrorMessage('topicId')"
    />

    <DsfrBadge
      v-if="isDatasetInTopic"
      type="info"
      :label="`Déjà utilisé dans ce ${topicPageConf.labels.singular}`"
      small
      ellipsis
      class="fr-mb-2w"
    />
    <div class="fr-input-group">
      <SelectTopicFactorGroup
        v-model:factor-model="factor"
        v-model:groups-model="groups"
        label="Regroupement"
        description="Rechercher ou créer un regroupement (100 caractères maximum). Un regroupement contient un ou plusieurs jeux de données."
        :error-message="getErrorMessage('group')"
      />
    </div>
    <FactorTextFields
      v-model:factor-model="factor"
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
:deep(.fr-select-group:has(+ #errors-topicId)) {
  margin-bottom: 0;
}
</style>
