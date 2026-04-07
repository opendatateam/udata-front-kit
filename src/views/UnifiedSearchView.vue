<script setup lang="ts">
import SearchComponent from '@/components/SearchComponent.vue'
import SearchSelectFilter from '@/components/SearchSelectFilter.vue'
import TopicList from '@/components/topics/TopicList.vue'
import { useCurrentPageConf } from '@/router/utils'
import { fromMarkdown } from '@/utils'
import { useAsyncComponent } from '@/utils/component'
import { debounceWait } from '@/utils/config'
import {
  DataserviceCard,
  DatasetCard,
  GlobalSearch
} from '@datagouv/components-next'
import { useDebounceFn } from '@vueuse/core'
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

// Passed by the router props function; GlobalSearch/TopicList read state from the URL directly.
const props = defineProps<{
  query?: string
  page?: string
  useSearchEndpoint?: boolean
}>()

const route = useRoute()
const router = useRouter()
const { pageConf } = useCurrentPageConf()

const links = [
  { to: '/', text: 'Accueil' },
  { text: pageConf.breadcrumb_title ?? pageConf.title }
]

const meta = route.meta
const CardComponent = useAsyncComponent(() => meta.cardComponent)

// Custom select filters from config: filters with search_display set and predefined values
const customSelectFilters = computed(() =>
  pageConf.filters.filter(
    (f) => f.search_display && f.values?.length && f.type === 'select'
  )
)

// Topic search input (searchType === 'topics' only)
const topicSearch = useDebounceFn((query: string) => {
  router.push({ name: route.name, query: { ...route.query, q: query } })
}, debounceWait)
</script>

<template>
  <div class="fr-container">
    <DsfrBreadcrumb class="fr-mb-1v" :links="links" />
  </div>

  <section
    v-if="pageConf.banner"
    class="fr-container--fluid hero-banner fr-mb-4w"
  >
    <div class="fr-container fr-py-12v">
      <!-- eslint-disable vue/no-v-html -->
      <h2
        :class="!pageConf.banner.content ? 'fr-mb-0' : ''"
        v-html="pageConf.banner.title"
      />
      <div
        v-if="pageConf.banner.content"
        v-html="fromMarkdown(pageConf.banner.content)"
      />
      <!-- eslint-enable vue/no-v-html -->
    </div>
  </section>

  <!-- GlobalSearch for datasets / dataservices -->
  <div
    v-if="meta.searchType === 'datasets' || meta.searchType === 'dataservices'"
    class="fr-container fr-mb-4w"
  >
    <Suspense>
      <GlobalSearch :config="meta.searchConfig!">
        <template #dataset="{ dataset }">
          <component
            :is="CardComponent ?? DatasetCard"
            :dataset="dataset"
            :dataset-url="{
              name: `${meta.pageKey}_detail`,
              params: { item_id: dataset.id }
            }"
          />
        </template>
        <template #dataservice="{ dataservice }">
          <component
            :is="CardComponent ?? DataserviceCard"
            :dataservice="dataservice"
            :dataservice-url="{
              name: `${meta.pageKey}_detail`,
              params: { item_id: dataservice.id }
            }"
          />
        </template>
        <template v-if="customSelectFilters.length" #filters>
          <SearchSelectFilter
            v-for="filter in customSelectFilters"
            :key="filter.id"
            :filter="filter"
          />
        </template>
      </GlobalSearch>
    </Suspense>
  </div>

  <!-- Topic search for bouquets/collections.
       TODO: replace PageFilters with GlobalSearch once upstream supports topics class.
       Tracked in: https://github.com/ecolabdata/ecospheres/issues/1010 -->
  <div v-else-if="meta.searchType === 'topics'" class="fr-container fr-mb-4w">
    <div class="fr-mb-2w">
      <SearchComponent
        id="search-topic"
        :model-value="props.query"
        :is-filter="true"
        :search-label="pageConf.search.input"
        :label="pageConf.search.input"
        @update:model-value="topicSearch"
      />
    </div>
    <TopicList
      :query="props.query"
      :page="props.page"
      :use-search-endpoint="props.useSearchEndpoint ?? false"
    />
  </div>
</template>
