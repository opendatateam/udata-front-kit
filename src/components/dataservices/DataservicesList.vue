<script setup lang="ts">
import NoResults from '@/components/NoResults.vue'
import SelectComponent from '@/components/SelectComponent.vue'
import { useCurrentPageConf } from '@/router/utils'
import { useDataserviceSearchStore } from '@/store/DataserviceSearchStore'
import { DataserviceCard, type Dataservice } from '@datagouv/components-next'
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

const store = useDataserviceSearchStore()
const { meta, pageConf } = useCurrentPageConf()
const { items: dataservices, pagination, total } = storeToRefs(store)

const numberOfResultMsg: ComputedRef<string> = computed(() => {
  if (total.value === 1) {
    return `1 ${pageConf.labels.singular} disponible`
  } else if (total.value > 1) {
    return `${total.value} ${pageConf.labels.plural} disponibles`
  } else {
    return 'Aucun résultat ne correspond à votre recherche'
  }
})

const getDataservicePage = (id: string) => {
  return { name: 'dataservices_detail', params: { item_id: id } }
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
  <template v-if="dataservices.length > 0">
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
            { id: '-last_modified', name: 'Les plus récemment modifiés' }
          ]"
          @update:model-value="doSort"
        />
      </div>
    </div>
    <div class="fr-mb-4w border-top">
      <ul class="fr-grid-row fr-grid-row--gutters fr-mt-2w fr-pl-0" role="list">
        <li
          v-for="dataservice in dataservices"
          :key="dataservice.id"
          :class="[meta.cardClass || 'fr-col-12', 'dataservice-card-container']"
        >
          <DataserviceCard
            :key="dataservice.id"
            :dataservice="dataservice as unknown as Dataservice"
            :dataservice-url="getDataservicePage(dataservice.id)"
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
.dataservice-card-container {
  width: 100%;
  padding-top: 0 !important;
  padding-bottom: 0 !important;
}

:deep(h4 > a) {
  color: var(--text-title-grey);
}
</style>
