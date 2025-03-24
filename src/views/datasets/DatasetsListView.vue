<script setup lang="ts">
import { useDebounceFn } from '@vueuse/core'
import { computed, inject, ref, watch, type Ref } from 'vue'
import { useLoading } from 'vue-loading-overlay'
import { useRoute, useRouter } from 'vue-router'

import GenericContainer from '@/components/GenericContainer.vue'
import DatasetSearch from '@/components/datasets/DatasetSearch.vue'
import config from '@/config'
import {
  AccessibilityPropertiesKey,
  type AccessibilityPropertiesType
} from '@/model/injectionKeys'
import { useSearchStore } from '@/store/SearchStore'
import { fromMarkdown } from '@/utils'
import { debounceWait } from '@/utils/config'

defineEmits(['search'])
const props = defineProps({
  query: {
    type: String,
    default: null
  },
  page: {
    type: String,
    default: null
  },
  organization: {
    type: String,
    default: null
  },
  topic: {
    type: String,
    default: null
  }
})

const router = useRouter()
const route = useRoute()
const store = useSearchStore()
const currentPage = ref(1)
const localQuery = ref()
const loader = useLoading()

const queryResults = ref<HTMLParagraphElement | null>(null)

const selectedTopicId: Ref<string | null> = ref(null)
const selectedOrganizationId: Ref<string | null> = ref(null)

const datasets = computed(() => store.datasets)
const pages = computed(() => store.pagination)

const banner = config.website.datasets.banner

const setAccessibilityProperties = inject(
  AccessibilityPropertiesKey
) as AccessibilityPropertiesType

const metaTitle = computed(() => {
  if (currentPage.value && localQuery.value) {
    return `${route.meta.title} pour "${localQuery.value}" - page ${currentPage.value}`
  } else if (currentPage.value) {
    return `${route.meta.title} - page ${currentPage.value}`
  } else if (localQuery.value) {
    return `${route.meta.title} pour "${localQuery.value}"`
  }
  return document.title
})

const links = [{ to: '/', text: 'Accueil' }, { text: 'Données' }]

const computeUrlQuery = (
  data: Record<string, string | number>
): Record<string, string | number> => {
  return {
    page: currentPage.value,
    ...(localQuery.value && { q: localQuery.value }),
    ...(selectedOrganizationId.value && {
      organization: selectedOrganizationId.value
    }),
    ...(selectedTopicId.value && { topic: selectedTopicId.value }),
    ...data
  }
}

const search = () => {
  router.push({
    path: '/datasets',
    query: computeUrlQuery({ page: 1 }),
    hash: '#datasets-list'
  })
}

const goToPage = (page: number) => {
  router.push({
    path: '/datasets',
    query: computeUrlQuery({ page: page + 1 })
  })
}

watch(
  props,
  () => {
    localQuery.value = props.query
    currentPage.value = props.page ? parseInt(props.page) : 1
    selectedOrganizationId.value = props.organization
    selectedTopicId.value = props.topic
  },
  { immediate: true }
)

const delayedSearch = useDebounceFn(
  (currentQuery, currentTopicId, currentOrganizationId, currentPageValue) => {
    const loadingInstance = loader.show()
    const args = currentOrganizationId
      ? { organization: currentOrganizationId }
      : {}
    store
      .search(currentQuery, currentTopicId, currentPageValue, args)
      .finally(() => {
        const searchResultsMessage = queryResults.value
          ? queryResults.value.innerText
          : ''
        setAccessibilityProperties(metaTitle.value, false, [
          {
            text: searchResultsMessage
          }
        ])
        loadingInstance.hide()
      })
  },
  debounceWait
)

watch(
  [localQuery, selectedTopicId, selectedOrganizationId, currentPage],
  ([currentQuery, currentTopicId, currentOrganizationId, currentPageValue]) => {
    delayedSearch(
      currentQuery,
      currentTopicId,
      currentOrganizationId,
      currentPageValue
    )
  },
  {
    immediate: true
  }
)
</script>

<template>
  <div class="fr-container">
    <DsfrBreadcrumb class="fr-mb-1v" :links="links" />
  </div>
  <div class="fr-container datagouv-components fr-my-2v">
    <h1>Jeux de données</h1>
  </div>
  <section
    v-if="banner"
    class="fr-container--fluid hero-banner datagouv-components fr-mb-4w"
  >
    <div class="fr-container fr-py-12v">
      <!-- eslint-disable-next-line vue/no-v-html -->
      <h2 v-html="banner.title" />
      <!-- eslint-disable-next-line vue/no-v-html -->
      <div v-html="fromMarkdown(banner.content)" />
    </div>
  </section>
  <GenericContainer id="datasets-list">
    <div class="fr-col-md-12 fr-mb-2w">
      <SearchComponent
        id="search-dataset"
        :model-value="props.query"
        :is-filter="true"
        search-label="Rechercher un jeu de données"
        label="Rechercher un jeu de données"
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
            <DatasetSearch />
          </div>
        </nav>
        <div className="fr-col">
          <DatasetList ref="datasetListComp" :datasets="datasets" />
        </div>
      </div>
    </div>
  </GenericContainer>
  <DsfrPagination
    v-if="pages.length"
    class="fr-container"
    :current-page="currentPage - 1"
    :pages="pages"
    @update:current-page="goToPage"
  />
</template>
