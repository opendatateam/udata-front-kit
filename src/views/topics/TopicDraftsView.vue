<script setup lang="ts">
import { useDebounceFn } from '@vueuse/core'
import { useLoading } from 'vue-loading-overlay'
import { useRoute } from 'vue-router'

import GenericContainer from '@/components/GenericContainer.vue'
import TopicCard from '@/components/topics/TopicCard.vue'
import type { GenericResponse } from '@/model/api'
import type { Topic } from '@/model/topic'
import TopicsAPI from '@/services/api/resources/TopicsAPI'
import { debounceWait, usePageConf } from '@/utils/config'
import { useUniverseQuery } from '@/utils/universe'

const PAGE_SIZE = 15
const SORT = '-last_modified'

const route = useRoute()
const $loading = useLoading()
const pageKey = computed(() => route.meta.pageKey as string)
const pageConf = computed(() => usePageConf(pageKey.value))
const topics = ref<Topic[]>([])
const isLoaded = ref(false)
const searchQuery = ref('')
const activeQuery = ref('')
const currentPage = ref(1)
const total = ref(0)

const links = computed(() => [
  { to: '/', text: 'Accueil' },
  {
    to: { name: pageKey.value },
    text: pageConf.value.breadcrumb_title ?? pageConf.value.title
  },
  { text: 'Mes brouillons' }
])

const pages = computed(() => {
  const nbPages = Math.ceil(total.value / PAGE_SIZE)
  return [...Array(nbPages).keys()].map((i) => ({
    label: String(i + 1),
    href: '#',
    title: `Page ${i + 1}`
  }))
})

const topicsAPI = new TopicsAPI({ version: 2 })

const loadTopics = async (q?: string, page = 1) => {
  const loader = $loading.show()
  isLoaded.value = false
  const universeQuery = useUniverseQuery(pageKey.value, {})

  const response: GenericResponse = await topicsAPI.list({
    params: {
      private: 'true',
      sort: SORT,
      page,
      page_size: PAGE_SIZE,
      ...(q ? { q } : {}),
      ...universeQuery
    },
    authenticated: true
  })

  topics.value = response.data as Topic[]
  total.value = response.total
  activeQuery.value = q ?? ''
  isLoaded.value = true
  loader.hide()
}

onMounted(() => loadTopics())

const onSearch = (q: string) => {
  currentPage.value = 1
  loadTopics(q || undefined)
}

const onUpdatePage = (page: number) => {
  currentPage.value = page + 1
  loadTopics(activeQuery.value || undefined, currentPage.value)
}

const debouncedSearch = useDebounceFn((q: string) => {
  currentPage.value = 1
  loadTopics(q || undefined)
}, debounceWait)

watch(searchQuery, (q) => {
  if (q.length === 0 || q.length >= 3) {
    debouncedSearch(q)
  }
})
</script>

<template>
  <div class="fr-container">
    <DsfrBreadcrumb class="fr-mb-1v" :links="links" />
  </div>
  <GenericContainer>
    <h1 class="fr-mb-3w">Mes brouillons</h1>
    <DsfrSearchBar
      v-model="searchQuery"
      label="Rechercher dans mes brouillons"
      class="fr-mb-6w"
      @search="onSearch"
    />
    <p v-if="isLoaded && topics.length === 0">
      {{
        activeQuery
          ? 'Aucun brouillon ne correspond à votre recherche.'
          : 'Aucun brouillon.'
      }}
    </p>
    <ul
      v-else-if="topics.length > 0"
      class="fr-grid-row fr-grid-row--gutters es__tiles__list"
    >
      <li v-for="topic in topics" :key="topic.id" class="fr-col-12 fr-col-lg-4">
        <TopicCard :topic="topic" :page-key="pageKey" />
      </li>
    </ul>
  </GenericContainer>
  <div v-if="pages.length > 1" class="fr-container fr-pagination-wrapper">
    <DsfrPagination
      :trunc-limit="3"
      :current-page="currentPage - 1"
      :pages="pages"
      @update:current-page="onUpdatePage"
    />
  </div>
</template>

<style scoped>
.fr-pagination-wrapper :deep(.fr-pagination__list) {
  justify-content: center;
}
</style>
