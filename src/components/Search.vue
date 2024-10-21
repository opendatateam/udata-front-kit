<script setup lang="ts">
import DOMPurify from 'dompurify'
import { ref } from 'vue'
import Multiselect from 'vue-multiselect'
import 'vue-multiselect/dist/vue-multiselect.css'
import { useRouter } from 'vue-router'

import '@/assets/multiselect.css'
import config from '@/config'

const router = useRouter()

defineProps({
  searchLabel: {
    type: String,
    required: true
  }
})

const emits = defineEmits(['search'])

const placeholder = config.website.header_search.placeholder
const dropdown = config.website.header_search.dropdown
const query = ref('')
const selectedMultiSearch = ref()

const doSimpleSearch = () => {
  router.push({ path: '/datasets', query: { q: query.value } })
  query.value = ''
  emits('search')
}

const doMultiSearch = (item: { text: string; route: string }) => {
  router.push({ name: item.route, query: { q: query.value } })
  selectedMultiSearch.value = undefined
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
</script>

<template>
  <DsfrSearchBar
    v-if="!dropdown"
    v-model="query"
    :label="searchLabel"
    :placeholder="placeholder"
    @search="doSimpleSearch"
  />

  <div v-else>
    <label id="search-label" for="select-search" class="fr-sr-only"
      >Rechercher. Saisissez un mot clé puis choisissez une des options situés
      après le champ pour lancer la recherche dans la rubrique souhaitée</label
    >
    <Multiselect
      id="select-search"
      v-model="selectedMultiSearch"
      class="select-search"
      :options="dropdown"
      label="text"
      track-by="route"
      placeholder=""
      select-label=""
      deselect-label=""
      aria-labelledby="search-label"
      aria-owns=""
      :multiple="false"
      :searchable="true"
      :internal-search="false"
      :clear-on-select="true"
      :close-on-select="true"
      :max-height="600"
      :show-no-results="false"
      :hide-selected="true"
      @search-change="onSearchChange"
      @update:model-value="doMultiSearch"
    >
      <template #option="slotProps">
        <!-- eslint-disable-next-line vue/no-v-html -->
        <span v-html="dropdownLabel(slotProps.option.text)"></span>
      </template>
      <template #caret>
        <span class="fr-icon-search-line search-icon"></span>
      </template>
      <template #placeholder>
        <span aria-hidden="true" class="visible-label">Rechercher</span>
      </template>
    </Multiselect>
  </div>
</template>

<style scoped>
.select-search {
  --icon-width: 24px;
  position: relative;
  display: flex;

  .search-icon {
    position: absolute;
    inset-block-start: 50%;
    inset-inline-start: 10px;
    translate: 0 -50%;
    max-width: var(--icon-width);
  }
  .visible-label {
    margin-left: var(--icon-width);
  }
  .multiselect__placeholder {
    margin-inline-start: var(--icon-width);
  }
}
:deep(.multiselect__tags) {
  border: 0;
  box-shadow: inset 0 -2px 0 0 var(--border-action-high-blue-france);
  margin: 0;
  max-height: none;
  --hover: var(--background-contrast-grey-hover);
  --active: var(--background-contrast-grey-active);
  background-color: var(--background-contrast-grey);
  padding: 6px 40px 0 15px;
  min-height: 42px;
  width: 100%;
  order: 1;
}
:deep(.multiselect__input),
:deep(.multiselect__single) {
  background: var(--background-contrast-grey);
}
.select-search :deep(input) {
  padding-top: 4px;
  margin-inline-start: var(--icon-width);
  width: 100%;
}
:deep(.multiselect__content-wrapper) {
  margin-top: 42px;
}
</style>
