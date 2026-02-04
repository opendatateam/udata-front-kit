<script setup lang="ts">
import { storeToRefs } from 'pinia'
import type { ComputedRef } from 'vue'
import { computed } from 'vue'
import { useLoading } from 'vue-loading-overlay'
import { useRoute, useRouter, type LocationQueryRaw } from 'vue-router'

import NoResults from '@/components/NoResults.vue'
import TopicCard from '@/components/topics/TopicCard.vue'
import { useCurrentPageConf, useRouteQueryAsString } from '@/router/utils'
import { useTopicSearchStore } from '@/store/TopicSearchStore'
import { useUserStore } from '@/store/UserStore'
import { useAsyncComponent } from '@/utils/component'

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
const { query: routeQuery } = useRouteQueryAsString()
const store = useTopicSearchStore()

const { meta, pageKey, pageConf } = useCurrentPageConf()

const userStore = useUserStore()

const emits = defineEmits(['clearFilters'])

const { items: topics, pagination, total } = storeToRefs(store)

const numberOfResultMsg: ComputedRef<string> = computed(() => {
  if (total.value === 1) {
    return `1 ${pageConf.labels.singular} disponible`
  } else if (total.value > 1) {
    return `${total.value} ${pageConf.labels.plural} disponibles`
  } else {
    return 'Aucun résultat ne correspond à votre recherche'
  }
})

const createUrl = computed(() => {
  return { name: `${String(route.name)}_add`, query: route.query }
})

const clearFilters = () => {
  const query: LocationQueryRaw = {}
  router.push({ name: route.name, query, hash: '#list' }).then(() => {
    emits('clearFilters')
  })
}

const executeQuery = async () => {
  const loader = useLoading().show({ enforceFocus: false })
  // get filters parameters from route
  return store
    .query(
      {
        ...route.query,
        ...props,
        sort: route.query.sort || pageConf.default_sort
      } as Parameters<typeof store.query>[0],
      pageKey
    )
    .finally(() => loader.hide())
}

// load custom card component from router, or fallback to default
const CardComponent = useAsyncComponent(() => meta?.cardComponent, {
  fallback: TopicCard
})

const goToPage = (page: number) => {
  router.push({
    name: route.name,
    query: { ...route.query, page: page + 1 },
    hash: '#list'
  })
}

const doSort = (value: string | null) => {
  router.push({
    name: route.name,
    query: { ...route.query, sort: value },
    hash: '#list'
  })
}

// launch search on route.query changes
watch(
  () => route.query,
  () => executeQuery(),
  { immediate: true, deep: true }
)

defineExpose({
  numberOfResultMsg
})
</script>

<template>
  <template v-if="total > 0">
    <div
      class="fr-grid-row fr-grid-row--gutters fr-grid-row--middle justify-between fr-pb-2w"
    >
      <h2 id="number-of-results" class="fr-col-auto fr-my-0 h4">
        {{ numberOfResultMsg }}
      </h2>
      <div class="fr-col-auto fr-grid-row fr-grid-row--middle">
        <SelectComponent
          :model-value="routeQuery.sort || pageConf.default_sort || '-created'"
          label="Trier par :"
          :label-class="['fr-col-auto', 'fr-text--sm', 'fr-m-0', 'fr-mr-1w']"
          :options="[
            { id: '-last_modified', name: 'Les plus récemment modifiés' },
            { id: '-created', name: 'Les plus récemment créés' },
            { id: 'name', name: 'Titre' }
          ]"
          @update:model-value="doSort"
        />
      </div>
    </div>
    <div class="fr-mb-4w border-top">
      <ul class="fr-grid-row flex-gap fr-mt-3w fr-pl-0" role="list">
        <li v-for="topic in topics" :key="topic.id" class="fr-col-12">
          <CardComponent :topic="topic" :page-key="pageKey" />
        </li>
      </ul>
    </div>
    <DsfrPagination
      v-if="pagination.length"
      class="fr-container"
      :current-page="parseInt(page || '1') - 1"
      :pages="pagination"
      @update:current-page="goToPage"
    />
  </template>
  <NoResults v-else :clear-filters="clearFilters">
    <template v-if="userStore.canAddTopic(pageKey)" #description>
      Essayez de réinitialiser les filtres pour agrandir votre champ de
      recherche.<br />
      Vous pouvez aussi contribuer en créant un {{ pageConf.labels.singular }}.
    </template>
    <template #actions>
      <router-link
        v-if="userStore.canAddTopic(pageKey)"
        :to="createUrl"
        class="fr-btn fr-btn--secondary fr-ml-1w"
      >
        <VIconCustom name="add-circle-line" class="fr-mr-1v" />
        Ajouter un {{ pageConf.labels.singular }}
      </router-link>
    </template>
  </NoResults>
</template>

<style scoped>
.fr-grid-row {
  --gap: 1rem;
}
</style>
