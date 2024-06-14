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

const search = (value: string) => {
  query.value = value
}

const doMultiSearch = (item: { text: string; route: string }) => {
  router.push({ name: item.route, query: { q: query.value } })
  selectedMultiSearch.value = undefined
  query.value = ''
  emits('search')
}

const dropdownLabel = (text: string) => {
  return DOMPurify.sanitize(text.replace('{}', `<i>${query.value}</i>`))
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
    id="select-search"
    v-model="selectedMultiSearch"
    class="select-search"
    :options="dropdown"
    label="text"
    track-by="route"
    :placeholder="placeholder"
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
    @search-change="search"
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

  <!-- mock selected/focus state (input) -->
  <div
    tabindex="-1"
    class="multiselect select-search"
    role="combobox"
    aria-owns="listbox-select-search"
  >
    <div class="multiselect__tags">
      <input
        name=""
        id="select-search"
        type="text"
        autocomplete="off"
        spellcheck="false"
        placeholder="Rechercher..."
        tabindex="0"
        class="multiselect__input"
        aria-controls="listbox-select-search"
        style="width: 100%"
        aria-activedescendant="select-search-0"
      />
    </div>
  </div>

  <!-- mock unfocused (fake placeholder) -->
  <div
    tabindex="-1"
    class="multiselect select-search"
    role="combobox"
    aria-owns="listbox-select-search"
  >
    <div class="multiselect__select"></div>
    <div class="multiselect__tags">
      <span class="multiselect__placeholder">Rechercher...</span>
    </div>
    <div
      class="multiselect__content-wrapper"
      tabindex="-1"
      style="max-height: 564px; display: none"
    >
      <ul
        class="multiselect__content"
        role="listbox"
        id="listbox-select-search"
        style="display: inline-block"
      >
        <li class="multiselect__element" id="select-search-0" role="option">
          <span
            class="multiselect__option--highlight multiselect__option"
            data-select=""
            data-selected="Selected"
            data-deselect=""
          >
            <span>Rechercher <i></i> dans les jeux de données</span>
          </span>
        </li>
        <li class="multiselect__element" id="select-search-1" role="option">
          <span
            class="multiselect__option"
            data-select=""
            data-selected="Selected"
            data-deselect=""
          >
            <span>Rechercher <i></i> dans les bouquets</span>
          </span>
        </li>
      </ul>
    </div>
  </div>

  <!-- mock unwrapped list -->
  <div
    tabindex="-1"
    class="multiselect--active multiselect select-search"
    role="combobox"
    aria-owns="listbox-select-search"
  >
    <button type="button" class="fr-btn fr-icon-search-line">Rechercher</button>
    <div class="multiselect__tags">
      <input
        name=""
        id="select-search"
        type="text"
        autocomplete="off"
        spellcheck="false"
        placeholder="Rechercher..."
        tabindex="0"
        class="multiselect__input"
        aria-controls="listbox-select-search"
        style="width: 100%"
      />
    </div>
    <div
      class="multiselect__content-wrapper"
      tabindex="-1"
      style="max-height: 599px"
    >
      <ul
        class="multiselect__content"
        role="listbox"
        id="listbox-select-search"
        style="display: inline-block"
      >
        <li class="multiselect__element" id="select-search-0" role="option">
          <span
            class="multiselect__option--highlight multiselect__option"
            data-select=""
            data-selected="Selected"
            data-deselect=""
          >
            <span>Rechercher <i></i> dans les jeux de données</span>
          </span>
        </li>
        <li class="multiselect__element" id="select-search-1" role="option">
          <span
            class="multiselect__option"
            data-select=""
            data-selected="Selected"
            data-deselect=""
          >
            <span>Rechercher <i></i> dans les bouquets</span>
          </span>
        </li>
      </ul>
    </div>
  </div>
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
