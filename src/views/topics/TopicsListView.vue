<script setup lang="ts">
import { useDebounceFn } from '@vueuse/core'
import { storeToRefs } from 'pinia'
import { capitalize, computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import GenericContainer from '@/components/GenericContainer.vue'
import TopicList from '@/components/topics/TopicList.vue'
import type { RouteMeta } from '@/router'
import { useUserStore } from '@/store/UserStore'
import { fromMarkdown } from '@/utils'
import { useAccessibilityProperties } from '@/utils/a11y'
import { debounceWait, usePageConf, useTopicsConf } from '@/utils/config'

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

const { topicsSlug, topicsName } = useTopicsConf()

const router = useRouter()
const route = useRoute()
// FIXME: useRouteMeta
const meta = route.meta as RouteMeta
const pageConf = usePageConf(meta.pageKey || 'topics')

const topicListComp = ref<InstanceType<typeof TopicList> | null>(null)
const searchResultsMessage = computed(
  () => topicListComp.value?.numberOfResultMsg || ''
)
useAccessibilityProperties(toRef(props, 'query'), searchResultsMessage)

const selectedQuery = ref('')

const userStore = useUserStore()
const { canAddBouquet } = storeToRefs(userStore)

const links = [
  { to: '/', text: 'Accueil' },
  { text: pageConf.breadcrumb_title || pageConf.title }
]

const createUrl = computed(() => {
  return { name: `${topicsSlug}_add`, query: route.query }
})

const search = useDebounceFn((query) => {
  router.push({
    name: route.name,
    query: { ...route.query, q: query },
    hash: '#list'
  })
}, debounceWait)

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
    // FIXME: rename file if it works across types
    // FIXME: we need a "draft" selector in there
    () => import('@/components/datasets/DatasetSearch.vue')
  )
})
</script>

<template>
  <div class="fr-container">
    <DsfrBreadcrumb class="fr-mb-1v" :links="links" />
  </div>
  <div class="fr-container datagouv-components fr-my-2v">
    <div class="fr-grid-row fr-grid-row--middle justify-between fr-mb-3w">
      <h1 class="fr-mb-0">{{ capitalize(topicsName) }}s</h1>
      <div
        v-if="canAddBouquet"
        class="fr-col-auto fr-grid-row fr-grid-row--middle"
      >
        <router-link :to="createUrl" class="fr-btn fr-mb-1w">
          <VIconCustom name="add-circle-line" class="fr-mr-1w" align="middle" />
          Ajouter un {{ topicsName }}
        </router-link>
      </div>
    </div>
  </div>
  <section
    v-if="pageConf.banner"
    class="fr-container--fluid hero-banner datagouv-components fr-mb-4w"
  >
    <div class="fr-container fr-py-12v">
      <!-- eslint-disable-next-line vue/no-v-html -->
      <h2 v-html="pageConf.banner.title" />
      <!-- eslint-disable-next-line vue/no-v-html -->
      <div v-html="fromMarkdown(pageConf.banner.content)" />
    </div>
  </section>
  <GenericContainer id="list">
    <div class="fr-col-md-12 fr-mb-2w">
      <SearchComponent
        id="search-topic"
        :model-value="props.query"
        :is-filter="true"
        :search-label="pageConf.search.input"
        :label="pageConf.search.input"
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
        <div className="fr-col-12 fr-col-md-8">
          <TopicList
            ref="topicListComp"
            :query="props.query"
            :page="props.page"
          />
        </div>
      </div>
    </div>
  </GenericContainer>
</template>

<style scoped>
/* put above header (ground+500) so that multiselect floats above menu */
.fr-sidemenu {
  z-index: calc(var(--ground) + 600);
}

@media (max-width: 768px) {
  .fr-sidemenu {
    margin-left: 0;
    margin-right: 0;
    margin-bottom: 2em;
    width: 100%;
    .fr-sidemenu__title {
      box-shadow: none;
    }
  }
}
</style>
