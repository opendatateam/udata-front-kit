<script setup lang="ts">
import NoResults from '@/components/NoResults.vue'
import { useCurrentPageConf } from '@/router/utils'
import { useSearchStore } from '@/store/DatasetSearchStore'
import { DatasetCard } from '@datagouv/components'
import { storeToRefs } from 'pinia'
import { useLoading } from 'vue-loading-overlay'
import { useRoute, useRouter, type LocationQueryRaw } from 'vue-router'

const emits = defineEmits(['clearFilters'])

const props = defineProps({
  query: {
    type: String,
    default: ''
  },
  page: {
    type: String,
    required: true
  }
})

const router = useRouter()
const route = useRoute()

const store = useSearchStore()
const { meta, pageConf } = useCurrentPageConf()
const { datasets, pagination, total, maxTotal } = storeToRefs(store)

const numberOfResultMsg: ComputedRef<string> = computed(() => {
  if (total.value === 1) {
    return `1 ${pageConf.labels.singular} disponible`
  } else if (total.value > 1) {
    return `${maxTotal.value === total.value ? 'Plus de ' : ''}${total.value} ${pageConf.labels.plural} disponibles`
  } else {
    return 'Aucun résultat ne correspond à votre recherche'
  }
})

const getDatasetPage = (id: string) => {
  return { name: 'datasets_detail', params: { item_id: id } }
}

const getOrganizationPage = (id: string | undefined) => {
  if (router.hasRoute('organization_detail')) {
    return { name: 'organization_detail', params: { oid: id } }
  }
  return ''
}

const clearFilters = () => {
  const query: LocationQueryRaw = {}
  router.push({ name: route.name, query, hash: '#list' }).then(() => {
    emits('clearFilters')
  })
}

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

const executeQuery = async () => {
  const loader = useLoading().show({ enforceFocus: false })
  // get filters parameters from route
  const filtersArgs = pageConf.filters.reduce(
    (acc, item) => {
      const value = route.query[item.id]
      const singleton = Array.isArray(value) ? value[0] : value
      if (singleton) {
        acc[item.id] = singleton
      }
      return acc
    },
    {} as Record<string, string>
  )
  return store
    .query({ ...route.query, ...props, ...filtersArgs }, meta.pageKey)
    .finally(() => loader.hide())
}

// load custom card component from router, or fallback to default
const CardComponent = computed(() => {
  const componentLoader = meta?.cardComponent
  if (componentLoader) {
    return defineAsyncComponent({
      loader: componentLoader,
      onError: (err) => {
        console.error('Failed to load component:', err)
      }
    })
  }
  return DatasetCard
})

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
  <template v-if="datasets.length > 0">
    <div
      class="fr-grid-row fr-grid-row--gutters fr-grid-row--middle justify-between fr-pb-2w"
    >
      <h2 class="fr-col-auto fr-my-0 h4">{{ numberOfResultMsg }}</h2>
      <div class="fr-col-auto fr-grid-row fr-grid-row--middle">
        <SelectComponent
          label="Trier par :"
          default-option="Pertinence"
          :label-class="['fr-col-auto', 'fr-text--sm', 'fr-m-0', 'fr-mr-1w']"
          :options="[
            { id: '-created', name: 'Les plus récemment créés' },
            { id: '-last_update', name: 'Les plus récemment modifiés' }
          ]"
          @update:model-value="doSort"
        />
      </div>
    </div>
    <div class="fr-mb-4w border-top">
      <ul class="fr-grid-row fr-grid-row--gutters fr-mt-2w fr-pl-0" role="list">
        <li
          v-for="dataset in datasets"
          :key="dataset.id"
          :class="[meta.cardClass || 'fr-col-12', 'dataset-card-container']"
        >
          <CardComponent
            :key="dataset.id"
            :dataset="dataset"
            :dataset-url="getDatasetPage(dataset.id)"
            :organization-url="getOrganizationPage(dataset.organization?.id)"
            class="dataset-card"
          />
        </li>
      </ul>
    </div>
    <DsfrPagination
      v-if="pagination.length"
      :current-page="parseInt(page) - 1"
      :pages="pagination"
      @update:current-page="goToPage"
    />
  </template>
  <NoResults v-else :clear-filters="clearFilters" />
</template>

<style scoped>
.dataset-card {
  margin-top: 0 !important;
  margin-bottom: 0 !important;
}

.dataset-card-container {
  width: 100%;
}
</style>
