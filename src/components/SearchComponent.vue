<script setup lang="ts">
import VIconCustom from '@/components/VIconCustom.vue'
import { ref } from 'vue'

import { useRouter } from 'vue-router'

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
  searchEndpoint: {
    type: String,
    default: () => null
  },
  searchEndpointParams: {
    type: Object as () => Record<string, string>,
    default: () => {
      return {}
    }
  }
})

const selectedQuery = defineModel({
  type: String,
  required: false,
  default: ''
})

const emits = defineEmits(['doSearch'])

const query = ref('')

const buildSearchQueryParams = (q: string) => {
  return { ...props.searchEndpointParams, q }
}

const doSimpleSearch = (event: string) => {
  query.value = event
  router.push({
    path: props.searchEndpoint || router.resolve({ name: 'datasets' }).href,
    query: buildSearchQueryParams(query.value)
  })
  query.value = ''
  emits('doSearch')
}
</script>

<template>
  <search v-if="isFilter">
    <DsfrInputGroup
      :id="id"
      v-model="selectedQuery"
      :label="searchLabel"
      class="filter-input"
      type="search"
      :label-visible="labelVisible"
      :placeholder="!labelVisible ? searchLabel : undefined"
      :title="!labelVisible ? searchLabel : undefined"
    >
      <template #before-input>
        <VIconCustom name="search-line" class="search-icon" />
      </template>
    </DsfrInputGroup>
  </search>

  <!-- FIXME: nested input needs a title attribute for a11y, but not supported by DsfrSearchBar -->
  <DsfrSearchBar
    v-else
    v-model="query"
    :label="searchLabel"
    :placeholder="placeholder"
    @search="doSimpleSearch"
  />
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

.search-icon {
  position: absolute;
  inset-block-end: 0;
  inset-inline-start: 10px;
  translate: 0 -10px;
  max-inline-size: var(--icon-width);
}
</style>
