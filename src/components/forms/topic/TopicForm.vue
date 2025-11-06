<script setup lang="ts">
import SelectSpatialCoverage from '@/components/forms/SelectSpatialCoverage.vue'
import type { SpatialCoverage } from '@/model/spatial'
import type { TopicPostData } from '@/model/topic'
import { useCurrentPageConf } from '@/router/utils'
import { useFiltersState, useFilterValue } from '@/utils/filters'
import type { FormErrorMessagesMap } from '@/utils/form'
import { useSpatialCoverage } from '@/utils/spatial'
import { useTagsForFilter } from '@/utils/tags'
import ErrorMessage from '../ErrorMessage.vue'

const { pageKey, pageConf } = useCurrentPageConf()

const topic = defineModel({
  type: Object as () => Partial<TopicPostData> &
    Pick<TopicPostData, 'extras' | 'tags'>,
  required: true
})
const formErrors = defineModel('formErrors', {
  type: Array,
  default: () => []
})

const props = defineProps({
  formErrorMessagesMap: {
    type: Object as () => FormErrorMessagesMap,
    required: true
  }
})

const hasSpatialCoverage = pageConf.filters.some(
  (f) => f.type === 'spatial_zone'
)
const spatialCoverage = useSpatialCoverage(topic)

const filters = pageConf.filters.filter((f) => f.form != null)
const initialValuesForFilters = filters.reduce((acc, filter) => {
  const tags = useTagsForFilter(filter, pageConf.filter_prefix, topic.value)
  return {
    ...acc,
    [filter.id]: tags.length ? tags[0].id : null
  }
}, {})
const { filtersState } = useFiltersState(
  initialValuesForFilters,
  pageKey || 'topics',
  true
)

const validateFields = (): boolean => {
  // Create a new array rather than pushing to existing one to make reactivity work on formErrors
  const errors: string[] = []

  if (!topic.value.name?.trim()) {
    errors.push('name')
  }
  if (!topic.value.description?.trim()) {
    errors.push('description')
  }
  filters.forEach((filter) => {
    if (
      filter.form?.required &&
      filtersState[filter.id].selectedValue == null
    ) {
      errors.push(filter.id)
    }
  })

  formErrors.value = errors
  return errors.length === 0
}

const hasError = (field: string) => {
  return formErrors.value.includes(field)
}

const getErrorMessage = (field: string) => {
  return props.formErrorMessagesMap.get(field) || ''
}

const onSubmit = () => {
  formErrors.value = []
  const isValid = validateFields()
  if (isValid) {
    onValidSubmit()
  }
}

const onValidSubmit = async () => {
  // filter out known filters from existing tags and add those gotten from this form
  const filtersPrefixes = filters.map((filter) =>
    useFilterValue(
      pageKey || 'topics',
      filter.id,
      undefined,
      Boolean(filter.use_filter_prefix)
    )
  )
  const filtersTags = filters
    .map((filter) =>
      filtersState[filter.id].selectedValue
        ? useFilterValue(
            pageKey || 'topics',
            filter.id,
            filtersState[filter.id].selectedValue,
            Boolean(filter.use_filter_prefix)
          )
        : null
    )
    .filter((tag) => tag !== null)
  topic.value.tags = [
    ...topic.value.tags.filter(
      (tag) => !filtersPrefixes.some((prefix) => tag.startsWith(prefix))
    ),
    ...filtersTags
  ]
}

const onUpdateSpatialCoverage = (value: SpatialCoverage | undefined) => {
  const zones = value === undefined ? null : [value.id]
  topic.value.spatial = { ...topic.value.spatial, zones }
}

defineExpose({
  onSubmit
})
</script>

<template>
  <!-- Title -->
  <div class="fr-input-group">
    <DsfrInput
      id="input-name"
      v-model="topic.name"
      :label="`Sujet du ${pageConf.labels.singular} (obligatoire)`"
      label-visible
      :aria-invalid="hasError('name') ? true : undefined"
      :description-id="hasError('name') ? 'errors-name' : undefined"
    />
    <ErrorMessage
      v-if="hasError('name')"
      input-name="name"
      :error-message="getErrorMessage('name')"
    />
  </div>
  <!-- Description -->
  <div class="fr-input-group">
    <DsfrInput
      id="input-description"
      v-model="topic.description"
      is-textarea
      :label="`Objectif du ${pageConf.labels.singular} (obligatoire)`"
      label-visible
      :aria-invalid="hasError('description') ? true : undefined"
      :description-id="
        hasError('description')
          ? 'errors-description description-instructions'
          : 'description-instructions'
      "
    />
    <ErrorMessage
      v-if="hasError('description')"
      input-name="description"
      :error-message="getErrorMessage('description')"
    />
    <p id="description-instructions" class="fr-mt-1v fr-text--sm">
      Renseignez ici les informations nécessaires à la compréhension du
      {{ pageConf.labels.singular }}&nbsp;: politique publique et problématique
      à laquelle il répond, lien vers toute méthodologie de traitement des
      données, description de l'organisme porteur du projet, etc.<br />
      Utilisez du
      <a target="_blank" href="https://www.markdownguide.org/cheat-sheet/"
        ><span lang="en">markdown</span> (guide en anglais)</a
      >
      pour mettre en forme votre texte.
    </p>
  </div>
  <!-- Filters -->
  <div
    v-for="filter in filters"
    :key="filter.id"
    class="fr-select-group fr-input-group"
  >
    <label class="fr-label" for="input-theme">
      {{ filter.name }} <span v-if="filter.form?.required">(obligatoire)</span>
    </label>
    <select
      :id="`input-${filter.id}`"
      v-model="filtersState[filter.id].selectedValue"
      class="fr-select fr-col"
      :aria-invalid="hasError(filter.id) ? true : undefined"
      :aria-errormessage="`errors-${filter.id}`"
    >
      <option
        v-for="option in filtersState[filter.id].options"
        :key="option.id"
        :value="option.id"
      >
        {{ option.name }}
      </option>
    </select>
    <ErrorMessage
      v-if="hasError(filter.id)"
      :input-name="filter.id"
      :error-message="getErrorMessage(filter.id)"
    />
  </div>
  <!-- Spatial coverage -->
  <div v-if="hasSpatialCoverage" class="fr-select-group">
    <label class="fr-label" for="select-spatial-coverage"
      >Couverture territoriale (facultatif)</label
    >
    <SelectSpatialCoverage
      v-model:spatial-coverage-model="spatialCoverage"
      @update:spatial-coverage-model="onUpdateSpatialCoverage"
    />
  </div>
</template>

<style scoped>
:deep(textarea) {
  min-height: 150px;
}
</style>
