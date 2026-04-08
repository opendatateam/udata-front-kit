<script setup lang="ts">
import SearchSelectFilter from '@/components/SearchSelectFilter.vue'
import { useCurrentPageConf } from '@/router/utils'
import { fromMarkdown } from '@/utils'
import { useAsyncComponent } from '@/utils/component'
import {
  DataserviceCard,
  DatasetCard,
  GlobalSearch,
  TopicCard
} from '@datagouv/components-next'
import { computed } from 'vue'
import { useRoute } from 'vue-router'

// Passed by the router props function; GlobalSearch reads state from the URL directly.
defineProps<{ query?: string; page?: string }>()

const route = useRoute()
const { pageConf } = useCurrentPageConf()

const links = [
  { to: '/', text: 'Accueil' },
  { text: pageConf.breadcrumb_title ?? pageConf.title }
]

const meta = route.meta
const CardComponent = useAsyncComponent(() => meta.cardComponent)

// Custom select filters: filters with search_display set and predefined values (type: select)
const customSelectFilters = computed(() =>
  (pageConf.filters ?? []).filter(
    (f) => f.search_display && f.values?.length && f.type === 'select'
  )
)
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

  <div class="fr-container fr-mb-4w">
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
        <template #topic="{ topic }">
          <component
            :is="CardComponent ?? TopicCard"
            :topic="topic"
            :topic-url="{
              name: `${meta.pageKey}_detail`,
              params: { item_id: topic.id }
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
</template>
