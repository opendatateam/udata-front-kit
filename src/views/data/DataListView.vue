<script setup lang="ts">
import { useDebounceFn } from '@vueuse/core'
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import GenericContainer from '@/components/GenericContainer.vue'
import { useCurrentPageConf } from '@/router/utils'
import { fromMarkdown } from '@/utils'
import { useAccessibilityProperties } from '@/utils/a11y'
import { useAsyncComponent } from '@/utils/component'
import { debounceWait } from '@/utils/config'

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
const { meta, pageConf } = useCurrentPageConf()

const listComponentRef = ref<{ numberOfResultMsg?: string } | null>(null)
const searchResultsMessage = computed(
  () => listComponentRef.value?.numberOfResultMsg || ''
)
useAccessibilityProperties(toRef(props, 'query'), searchResultsMessage)

const links = [
  { to: '/', text: 'Accueil' },
  { text: pageConf.breadcrumb_title || pageConf.title }
]

const search = useDebounceFn((query) => {
  router.push({
    name: route.name,
    query: { ...route.query, q: query },
    hash: '#list'
  })
}, debounceWait)

// load list component from router
const ListComponent = useAsyncComponent(() => meta?.listComponent)

// load custom filters component from router, or fallback to default
const FiltersComponent = useAsyncComponent(
  () => meta?.filtersComponent,
  defineAsyncComponent(() => import('@/components/pages/PageFilters.vue'))
)

// TODO: this should be handled by the router, but we don't have access to pageConf there
onMounted(() => {
  if (!pageConf.list_all) {
    router.push({
      name: 'not_found'
    })
  }
})
</script>

<template>
  <div class="fr-container">
    <DsfrBreadcrumb class="fr-mb-1v" :links="links" />
  </div>
  <div class="fr-container datagouv-components fr-my-2w">
    <h1>{{ pageConf.title }}</h1>
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
        id="search-dataset"
        :model-value="props.query"
        :is-filter="true"
        :search-label="pageConf.search.input"
        :label="pageConf.search.input"
        @update:model-value="search"
      />
    </div>
    <div class="fr-mt-2w">
      <div class="fr-grid-row">
        <nav
          v-if="pageConf.filters.length > 0 || meta.filtersComponent"
          class="fr-sidemenu fr-col-md-4"
          aria-labelledby="fr-sidemenu-title"
        >
          <div class="fr-sidemenu__inner">
            <h2 id="fr-sidemenu-title" class="fr-sidemenu__title h3">
              Filtres
            </h2>
            <FiltersComponent />
          </div>
        </nav>
        <div class="fr-col list-container">
          <ListComponent
            ref="listComponentRef"
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

.list-container {
  width: 100%;
  min-width: 0; /* default is `min-content` for flex items */
}
</style>
