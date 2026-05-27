<script setup lang="ts">
import SearchOrganizationFilter from '@/components/search/SearchOrganizationFilter.vue'
import SearchSelectFilter from '@/components/search/SearchSelectFilter.vue'
import TopicCard from '@/components/topics/TopicCard.vue'
import VIconCustom from '@/components/VIconCustom.vue'
import {
  AccessibilityPropertiesKey,
  type AccessibilityPropertiesType
} from '@/model/injectionKeys'
import { useUserStore } from '@/store/UserStore'
import { fromMarkdown } from '@/utils'
import { useAsyncComponent } from '@/utils/component'
import { usePageConf } from '@/utils/config'
import { useLabels } from '@/utils/labels'
import { useCanonicalUrl, useMeta } from '@/utils/seo'
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

const CardComponent = useAsyncComponent(
  () => route.meta.cardComponent as (() => Promise<Component>) | undefined
)

const createUrl = computed(() => ({
  name: `${pageKey.value}_add`,
  query: route.query
}))

// localType is needed because pageKey is read-only (derived from route), but
// GlobalSearch needs a writable ref to track the active type (v-model:type).
// When the user switches type, localType changes and the watch below navigates.
// This watch keeps localType in sync when the route changes externally.
const localType = ref(pageKey.value)
watch(pageKey, (newKey) => {
  localType.value = newKey
})

// When the user switches type, navigate to the new route. The guard prevents
// a loop: when pageKey changes externally and syncs localType (watch above),
// this fires but newType === pageKey.value so the push is skipped.
watch(localType, async (newType) => {
  if (newType !== pageKey.value) {
    const scrollY = window.scrollY
    const { page, ...allQuery } = route.query
    // Org filter values are type-specific (different list per type) — don't carry them over
    const orgParams = new Set(
      (route.meta.customFilters ?? [])
        .filter((f) => !('values' in f))
        .map((f) => f.urlParam)
    )
    const restQuery = Object.fromEntries(
      Object.entries(allQuery).filter(([k]) => !orgParams.has(k))
    )
    await router.push({ name: newType, query: restQuery })
    await nextTick()
    // Both scrollBehavior (router) and this manual restore are needed:
    // scrollBehavior prevents Vue Router from scrolling to top on navigation,
    // but the browser still clamps scrollY when the document shrinks during
    // the reactive re-render (old results → loading state → new results).
    window.scrollTo(0, scrollY)
  }
})

useMeta({
  description: () => pageConf.value?.meta?.description,
  canonicalUrl: useCanonicalUrl()
})

onMounted(() => {
  if (!pageConf.value.list_all) {
    router.push({ name: 'not_found' })
  }
})

const setAccessibilityProperties = inject(
  AccessibilityPropertiesKey
) as AccessibilityPropertiesType

const lastAnnouncementKey = ref<string | null>(null)

const announcedTitle = computed(() => {
  const q = route.query.q as string | undefined
  return q ? `${pageConf.value.title} pour "${q}"` : pageConf.value.title
})

const announceSearchResults = (total: number) => {
  const { page: _p, ...rest } = route.query
  const key = JSON.stringify({ ...rest, total })
  if (key === lastAnnouncementKey.value) return
  lastAnnouncementKey.value = key
  const text =
    total === 0
      ? 'Aucun résultat'
      : total === 1
        ? '1 résultat'
        : `${total} résultats`
  setAccessibilityProperties(announcedTitle.value, false, [{ text }])
}
</script>

<template>
  <div class="fr-container">
    <DsfrBreadcrumb class="fr-mb-1v" :links="links" />
  </div>

  <div class="fr-container fr-my-2v">
    <div class="fr-grid-row fr-grid-row--middle justify-between fr-mb-3w">
      <h1 class="fr-mb-0">{{ pageConf.title }}</h1>
      <div
        v-if="
          pageConf.object_type === 'topics' && userStore.canAddTopic(pageKey)
        "
        class="fr-col-auto fr-grid-row fr-grid-row--middle fr-grid-row--gutters"
      >
        <div class="fr-col-auto">
          <router-link :to="createUrl" class="fr-btn fr-mb-1w">
            <VIconCustom
              name="add-circle-line"
              class="fr-mr-1w"
              align="middle"
            />
            Ajouter {{ labels.articles.un }} {{ labels.singular }}
          </router-link>
        </div>
        <div class="fr-col-auto">
          <router-link
            :to="{ name: `${pageKey}_drafts` }"
            class="fr-btn fr-btn--secondary fr-mb-1w"
          >
            Mes brouillons
          </router-link>
        </div>
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
    <h2 v-if="pageConf.search?.input" class="fr-mb-2w">
      {{ pageConf.search.input }}
    </h2>
    <Suspense>
      <GlobalSearch
        v-model:type="localType"
        :config="route.meta.searchConfig!"
        :auto-focus="false"
        @results-count="announceSearchResults"
      >
        <template v-if="route.meta.customFilters?.length" #custom-filters-top>
          <template
            v-for="filter in route.meta.customFilters"
            :key="filter.urlParam"
          >
            <SearchSelectFilter v-if="'values' in filter" :config="filter" />
            <SearchOrganizationFilter
              v-else-if="'pageKey' in filter"
              :config="filter"
            />
          </template>
        </template>
        <template #dataset="{ dataset }">
          <component
            :is="
              pageConf.object_type === 'datasets' && CardComponent
                ? CardComponent
                : DatasetCard
            "
            :dataset="dataset"
            :dataset-url="{
              name: `${localType}_detail`,
              params: { item_id: dataset.id }
            }"
            :organization-url="
              organizationUrl((dataset as Dataset).organization?.id)
            "
          />
        </template>
        <template #dataservice="{ dataservice }">
          <component
            :is="
              pageConf.object_type === 'dataservices' && CardComponent
                ? CardComponent
                : DataserviceCard
            "
            :dataservice="dataservice"
            :dataservice-url="{
              name: `${localType}_detail`,
              params: { item_id: dataservice.id }
            }"
          />
        </template>
        <template #topic="{ topic }">
          <component
            :is="
              pageConf.object_type === 'topics' && CardComponent
                ? CardComponent
                : TopicCard
            "
            :topic="topic as TopicV2"
            :page-key="pageKey"
            :topic-url="{
              name: `${localType}_detail`,
              params: { item_id: (topic as TopicV2).slug }
            }"
          />
        </template>
      </GlobalSearch>
    </Suspense>
  </div>
</template>
