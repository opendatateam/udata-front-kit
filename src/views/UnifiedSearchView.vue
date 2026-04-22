<script setup lang="ts">
import SearchSelectFilter from '@/components/search/SearchSelectFilter.vue'
import TopicCard from '@/components/topics/TopicCard.vue'
import VIconCustom from '@/components/VIconCustom.vue'
import { useUserStore } from '@/store/UserStore'
import { fromMarkdown } from '@/utils'
import { useAsyncComponent } from '@/utils/component'
import { usePageConf } from '@/utils/config'
import { useLabels } from '@/utils/labels'
import {
  DataserviceCard,
  DatasetCard,
  GlobalSearch,
  type Dataset,
  type TopicV2
} from '@datagouv/components-next'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const pageKey = computed(() => route.meta.pageKey as string)
const pageConf = computed(() => usePageConf(pageKey.value))

const organizationUrl = (id: string | undefined) =>
  router.hasRoute('organization_detail')
    ? { name: 'organization_detail', params: { oid: id } }
    : undefined
const userStore = useUserStore()
const labels = computed(() => useLabels(pageConf.value.labels))

const links = computed(() => [
  { to: '/', text: 'Accueil' },
  { text: pageConf.value.breadcrumb_title ?? pageConf.value.title }
])

const meta = route.meta
const CardComponent = useAsyncComponent(() => meta.cardComponent)

// localType is a plain ref (not prop-backed) so GlobalSearch can mutate it freely.
// Synced to pageKey on route change so the type selector stays in sync when the
// component is reused by Vue Router (no remount).
const localType = ref(pageKey.value)
watch(pageKey, (newKey) => {
  localType.value = newKey
})

watch(localType, async (newType) => {
  if (newType !== pageKey.value) {
    const scrollY = window.scrollY
    const { page, ...restQuery } = route.query
    await router.push({ name: newType, query: restQuery })
    await nextTick()
    // Both scrollBehavior (router) and this manual restore are needed:
    // scrollBehavior prevents Vue Router from scrolling to top on navigation,
    // but the browser still clamps scrollY when the document shrinks during
    // the reactive re-render (old results → loading state → new results).
    window.scrollTo(0, scrollY)
  }
})

onMounted(() => {
  if (!pageConf.value.list_all) {
    router.push({ name: 'not_found' })
  }
})
const createUrl = computed(() => ({
  name: `${pageKey.value}_add`,
  query: route.query
}))
</script>

<template>
  <div class="fr-container">
    <DsfrBreadcrumb class="fr-mb-1v" :links="links" />
  </div>

  <div class="fr-container fr-my-2v">
    <div class="fr-grid-row fr-grid-row--middle justify-between fr-mb-3w">
      <h1 class="fr-mb-0">{{ pageConf.title }}</h1>
      <div
        v-if="userStore.canAddTopic(pageKey)"
        class="fr-col-auto fr-grid-row fr-grid-row--middle"
      >
        <router-link :to="createUrl" class="fr-btn fr-mb-1w">
          <VIconCustom name="add-circle-line" class="fr-mr-1w" align="middle" />
          Ajouter {{ labels.articles.un }} {{ labels.singular }}
        </router-link>
      </div>
    </div>
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
      <GlobalSearch v-model:type="localType" :config="meta.searchConfig!">
        <!-- FIXME: validate placement top/bottom -->
        <template v-if="meta.tagFilters?.length" #custom-filters-top>
          <SearchSelectFilter
            v-for="filter in meta.tagFilters"
            :key="filter.urlParam"
            :config="filter"
          />
        </template>
        <template #dataset="{ dataset }">
          <component
            :is="CardComponent ?? DatasetCard"
            :dataset="dataset"
            :dataset-url="{
              name: `${meta.pageKey}_detail`,
              params: { item_id: dataset.id }
            }"
            :organization-url="
              organizationUrl((dataset as Dataset).organization?.id)
            "
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
            :topic="topic as TopicV2"
            :page-key="pageKey"
            :topic-url="{
              name: `${meta.pageKey}_detail`,
              params: { item_id: (topic as TopicV2).slug }
            }"
            :organization-url="
              organizationUrl((topic as TopicV2).organization?.id)
            "
          />
        </template>
      </GlobalSearch>
    </Suspense>
  </div>
</template>
