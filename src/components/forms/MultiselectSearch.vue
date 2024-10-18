<script setup lang="ts">
import DOMPurify from 'dompurify'
import Multiselect from 'vue-multiselect'
import 'vue-multiselect/dist/vue-multiselect.css'

const props = defineProps({
  dropdown: { type: Array, required: true },
  query: { type: String, default: '' },
  onSearchChange: { type: Function, required: true },
  doMultiSearch: { type: Function, required: true },
  selectedMultiSearch: { type: Unknown } // FIXME
})

const dropdownLabel = (text: string) => {
  // &#8239; is "espace fine insécable"
  const queryText = props.query.value
    ? `«&#8239;<i>${props.query.value}</i>&#8239;»`
    : ''
  return DOMPurify.sanitize(text.replace('{}', queryText))
}

/*
selectedMultiSearch
> v-model cannot be used on a prop, because local prop bindings are not writable.
>_Use a v-bind binding combined with a v-on listener that emits update:x event instead.
*/
</script>

<template>
  <!--
    - [ ] Dynamic dropdown text
    - [ ] Move to page with query
  -->
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
  </Multiselect>
</template>

<style lang="scss">
.select-search {
  --icon-width: 24px;
  position: relative;
  display: flex;

  .multiselect__tags {
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
  .multiselect__input,
  .multiselect__single {
    background: var(--background-contrast-grey);
  }
  input {
    padding-top: 4px;
    margin-inline-start: var(--icon-width);
    width: 100%;
  }
  .search-icon {
    position: absolute;
    inset-block-start: 50%;
    inset-inline-start: 10px;
    translate: 0 -50%;
    max-width: var(--icon-width);
  }
  .multiselect__content-wrapper {
    margin-top: 42px;
  }
}
</style>
