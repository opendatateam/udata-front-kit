<script setup lang="ts">
import { useDebounceFn } from '@vueuse/core'
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import GenericContainer from '@/components/GenericContainer.vue'
import DatasetList from '@/components/datasets/DatasetList.vue'
import type { RouteMeta } from '@/router'
import { fromMarkdown } from '@/utils'
import { useAccessibilityProperties } from '@/utils/a11y'
import { debounceWait, useFiltersConf } from '@/utils/config'

defineEmits(['search'])

const props = defineProps({
  query: {
    type: String,
    default: null
  },
  page: {
    type: String,
    default: '1'
  }
})

const router = useRouter()
const route = useRoute()
const meta = route.meta as RouteMeta
const filtersConf = useFiltersConf(meta.filterKey || 'datasets')

const datasetListComp = ref<InstanceType<typeof DatasetList> | null>(null)
const searchResultsMessage = computed(
  () => datasetListComp.value?.numberOfResultMsg || ''
)
useAccessibilityProperties(toRef(props, 'query'), searchResultsMessage)

const links = [{ to: '/', text: 'Accueil' }, { text: 'Données' }]

const search = useDebounceFn((query) => {
  router.push({
    name: 'datasets',
    query: { ...route.query, q: query },
    hash: '#datasets-list'
  })
}, debounceWait)

// load custom filters component from router, or fallback to default
const FiltersComponent = computed(() => {
  const componentLoader = meta?.filtersComponent
  if (componentLoader) {
    return defineAsyncComponent({
      loader: componentLoader,
      onError: (err) => {
        console.error('Failed to load component:', err)
      }
    })
  }
  return defineAsyncComponent(
    () => import('@/components/datasets/DatasetSearch.vue')
  )
})
</script>

<template>
  <div class="fr-container">
    <DsfrBreadcrumb class="fr-mb-1v" :links="links" />
  </div>
  <div class="fr-container datagouv-components fr-my-2w">
    <h1>{{ filtersConf.title }}</h1>
  </div>
  <section
    v-if="filtersConf.banner"
    class="fr-container--fluid hero-banner datagouv-components fr-mb-4w"
  >
    <div class="fr-container fr-py-12v">
      <!-- eslint-disable-next-line vue/no-v-html -->
      <h2 v-html="filtersConf.banner.title" />
      <!-- eslint-disable-next-line vue/no-v-html -->
      <div v-html="fromMarkdown(filtersConf.banner.content)" />
    </div>
  </section>
  <GenericContainer id="datasets-list">
    <div class="fr-col-md-12 fr-mb-2w">
      <SearchComponent
        id="search-dataset"
        :model-value="props.query"
        :is-filter="true"
        :search-label="filtersConf.search_text"
        :label="filtersConf.search_text"
        @update:model-value="search"
      />
    </div>
    <div class="fr-mt-2w">
      <div className="fr-grid-row">
        <nav
          className="fr-sidemenu fr-col-md-4"
          aria-labelledby="fr-sidemenu-title"
        >
          <div className="fr-sidemenu__inner">
            <h2 id="fr-sidemenu-title" className="fr-sidemenu__title h3">
              Filtres
            </h2>
            <FiltersComponent />
          </div>
        </nav>
        <div className="fr-col">
          <DatasetList
            ref="datasetListComp"
            :query="props.query"
            :page="props.page"
          />
        </div>
      </div>
    </div>
  </GenericContainer>
</template>
