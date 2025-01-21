<script setup lang="ts">
import DOMPurify from 'dompurify'
import { ref } from 'vue'

import Multiselect from '@vueform/multiselect'
import '@vueform/multiselect/themes/default.css'

import { useRouter } from 'vue-router'

import '@/assets/multiselect.css'

const router = useRouter()

const props = defineProps({
  searchLabel: {
    type: String,
    required: true
  },
  placeholder: {
    type: String,
    default: ''
  },
  id: {
    type: String,
    required: true
  },
  isFilter: {
    type: Boolean,
    default: false
  },
  labelVisible: {
    type: Boolean,
    default: true
  },
  dropdown: {
    type: Array,
    default: () => []
  },
  searchEndpoint: {
    type: String,
    default: () => null
  }
})

const selectedQuery = defineModel({
  type: String,
  required: false,
  default: ''
})

const emits = defineEmits(['search'])

const query = ref('')
const selectedMultiSearch = ref()
const multiselect = useTemplateRef('multiselect')

const doSimpleSearch = (event: string) => {
  query.value = event
  router.push({
    path: props.searchEndpoint || router.resolve({ name: 'datasets' }).href,
    query: { q: query.value }
  })
  query.value = ''
  emits('search')
}

const doMultiSearch = (item: { text: string; route: string }) => {
  router.push({ name: item.route, query: { q: query.value } })
  clear()
  query.value = ''
  emits('search')
}

const onSearchChange = (value: string) => {
  query.value = value
}

const dropdownLabel = (text: string) => {
  // &#8239; is "espace fine insécable"
  const queryText = query.value ? `«&#8239;<i>${query.value}</i>&#8239;»` : ''
  return DOMPurify.sanitize(text.replace('{}', queryText))
}

const clear = () => {
  // reset v-model
  selectedMultiSearch.value = undefined
  // reset component state
  multiselect.value?.clear()
}
</script>

<template>
  <DsfrInputGroup
    v-if="isFilter"
    :id="id"
    v-model="selectedQuery"
    :label="searchLabel"
    class="filter-input"
    :label-visible="labelVisible"
    :placeholder="!labelVisible ? searchLabel : undefined"
  >
    <template #before-input>
      <VIconCustom name="search-line" class="search-icon" />
    </template>
  </DsfrInputGroup>

  <DsfrSearchBar
    v-else-if="!dropdown.length"
    v-model="query"
    :label="searchLabel"
    :placeholder="placeholder"
    @search="doSimpleSearch"
  />

  <div v-else>
    <label :id="`${id}-label`" :for="id" class="fr-sr-only">Rechercher</label>
    <p :id="`${id}-description`" class="fr-sr-only">
      Saisissez un mot clé puis choisissez une des options situés après le champ
      pour lancer la recherche dans la rubrique souhaitée
    </p>
    <Multiselect
      :id="id"
      ref="multiselect"
      v-model="selectedMultiSearch"
      class="select-search"
      role="search"
      :object="true"
      value-prop="route"
      label="text"
      :searchable="true"
      :filter-results="false"
      :options="dropdown"
      :clear-on-select="true"
      :clear-on-search="true"
      :clear-on-blur="true"
      :close-on-select="true"
      placeholder=""
      aria-owns=""
      :aria="{
        'aria-describedby': `${id}-description`,
        // useless or unsupported https://github.com/vueform/multiselect/issues/436
        'aria-multiselectable': null,
        'aria-placeholder': null
      }"
      @search-change="onSearchChange"
      @update:model-value="doMultiSearch"
    >
      <template #clear>
        <button
          class="multiselect-clear"
          @click="clear"
          @keydown.enter="clear"
          @keydown.space="clear"
        >
          <span class="fr-sr-only">Supprimer la sélection</span>
          <span aria-hidden class="multiselect-clear-icon"></span>
        </button>
      </template>

      <template #singlelabel>
        <div class="multiselect-single-label fr-py-2w">
          {{ query }}
        </div>
      </template>

      <template #option="{ option }">
        <!-- eslint-disable-next-line vue/no-v-html -->
        <button v-html="dropdownLabel(option.text)" />
      </template>

      <template #caret>
        <VIconCustom name="search-line" class="search-icon" />
      </template>
    </Multiselect>
  </div>
</template>

<style scoped>
:global(:root) {
  --icon-width: 24px;
}

.fr-input-group {
  margin: 0;
}
:deep(.fr-label.invisible + .filter-input) {
  margin: 0;
}
:deep(.filter-input) {
  padding-inline-start: calc(var(--icon-width) + 1rem);
}
.select-search {
  position: relative;
  display: flex;
}
.select-search :deep(input) {
  padding-inline-start: calc(var(--icon-width) + 1rem);
}
.visible-label {
  margin-inline-start: var(--icon-width);
}

:deep(.multiselect__placeholder) {
  margin: 0;
  font-style: italic;
  color: var(--text-mention-grey);
  white-space: nowrap;
  text-overflow: ellipsis;
  inline-size: 100%;
  overflow: hidden;
}
::placeholder {
  font-style: italic;
  color: var(--text-mention-grey);
}

.search-icon {
  position: absolute;
  inset-block-end: 0;
  inset-inline-start: 10px;
  translate: 0 -10px;
  max-inline-size: var(--icon-width);
}
:deep(.multiselect__tags) {
  border: 0;
  box-shadow: inset 0 -2px 0 0 var(--border-action-high-blue-france);
  margin: 0;
  max-block-size: none;
  --hover: var(--background-contrast-grey-hover);
  --active: var(--background-contrast-grey-active);
  background-color: var(--background-contrast-grey);
  padding: 6px 40px 0 15px;
  min-inline-size: 42px;
  inline-size: 100%;
}
:deep(.multiselect__input),
:deep(.multiselect__single) {
  background: var(--background-contrast-grey);
}

:deep(.multiselect__content-wrapper) {
  margin-block-start: 40px;
}
</style>
