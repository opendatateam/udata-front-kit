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
  <Multiselect
    v-else
    id="select-search"
    v-model="selectedMultiSearch"
    class="select-search"
    :options="dropdown"
    label="text"
    track-by="route"
    placeholder=""
    select-label=""
    deselect-label=""
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
      <button type="button" class="fr-btn fr-icon-search-line">
        Rechercher
      </button>
    </template>
  </Multiselect>
</template>

<style lang="scss">
.select-search {
  display: flex;

  .multiselect__tags {
    border: 0;
    border-radius: 0.25rem 0 0;
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
  .multiselect__input,
  .multiselect__single {
    background: var(--background-contrast-grey);
  }
  input::placeholder,
  .multiselect__placeholder {
    font-style: italic;
    color: #666666;
  }
  input {
    padding-top: 4px;
    width: 100%;
  }
  button {
    border-radius: 0 0.25rem 0 0;
    min-height: 42px;
    max-height: 42px;
    order: 2;
  }
  .multiselect__content-wrapper {
    margin-top: 42px;
  }
}
</style>
