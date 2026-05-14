<script setup lang="ts">
import { useDebounceFn } from '@vueuse/core'
import { storeToRefs } from 'pinia'
import { useLoading } from 'vue-loading-overlay'
import { useRoute } from 'vue-router'

import GenericContainer from '@/components/GenericContainer.vue'
import TopicCard from '@/components/topics/TopicCard.vue'
import { useTopicStore } from '@/store/TopicStore'
import { debounceWait, usePageConf } from '@/utils/config'

const route = useRoute()
const $loading = useLoading()
const pageKey = computed(() => route.meta.pageKey as string)
const pageConf = computed(() => usePageConf(pageKey.value))
const isLoaded = ref(false)
const searchQuery = ref('')
const currentPage = ref(1)

const topicStore = useTopicStore()
const { drafts, draftsPagination } = storeToRefs(topicStore)

const links = computed(() => [
  { to: '/', text: 'Accueil' },
  {
    to: { name: pageKey.value },
    text: pageConf.value.breadcrumb_title ?? pageConf.value.title
  },
  { text: 'Mes brouillons' }
])

const loadTopics = async (q?: string, page = 1) => {
  const loader = $loading.show()
  isLoaded.value = false
  await topicStore.loadDrafts({ q, page, pageKey: pageKey.value })
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
  loadTopics(searchQuery.value || undefined, currentPage.value)
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
    <p v-if="isLoaded && drafts.length === 0">
      {{
        searchQuery
          ? 'Aucun brouillon ne correspond à votre recherche.'
          : 'Aucun brouillon.'
      }}
    </p>
    <ul
      v-else-if="drafts.length > 0"
      class="fr-grid-row fr-grid-row--gutters es__tiles__list"
    >
      <li v-for="topic in drafts" :key="topic.id" class="fr-col-12 fr-col-lg-4">
        <TopicCard :topic="topic" :page-key="pageKey" />
      </li>
    </ul>
  </GenericContainer>
  <div
    v-if="draftsPagination.length > 1"
    class="fr-container fr-pagination-wrapper"
  >
    <DsfrPagination
      :trunc-limit="3"
      :current-page="currentPage - 1"
      :pages="draftsPagination"
      @update:current-page="onUpdatePage"
    />
  </div>
</template>

<style scoped>
.fr-pagination-wrapper :deep(.fr-pagination__list) {
  justify-content: center;
}

.es__tiles__list :deep(article) {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.es__tiles__list :deep(.card-footer) {
  margin-top: auto;
}
</style>
