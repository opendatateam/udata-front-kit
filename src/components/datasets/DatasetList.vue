<script setup lang="ts">
import { useSearchStore } from '@/store/SearchStore'
import { useFiltersConf } from '@/utils/config'
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
const filtersConf = useFiltersConf('datasets')
const { datasets, pagination, total, maxTotal } = storeToRefs(store)

const numberOfResultMsg: ComputedRef<string> = computed(() => {
  if (total.value === 1) {
    return '1 jeu de données disponible'
  } else if (total.value > 1) {
    return `${maxTotal.value === total.value ? 'Plus de ' : ''}${total.value} jeux de données disponibles`
  } else {
    return 'Aucun résultat ne correspond à votre recherche'
  }
})

const getDatasetPage = (id: string) => {
  return { name: 'dataset_detail', params: { did: id } }
}

const getOrganizationPage = (id: string | undefined) => {
  if (router.hasRoute('organization_detail')) {
    return { name: 'organization_detail', params: { oid: id } }
  }
  return ''
}

const clearFilters = () => {
  const query: LocationQueryRaw = {}
  router.push({ name: 'datasets', query, hash: '#datasets-list' }).then(() => {
    emits('clearFilters')
  })
}

const goToPage = (page: number) => {
  router.push({
    name: 'datasets',
    query: { ...route.query, page: page + 1 },
    hash: '#datasets-list'
  })
}

const doSort = (value: string | null) => {
  router.push({
    name: 'datasets',
    query: { ...route.query, sort: value },
    hash: '#datasets-list'
  })
}

const executeQuery = async () => {
  const loader = useLoading().show({ enforceFocus: false })
  // get filters parameters from route
  const filtersArgs = filtersConf.items.reduce(
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
    .query({ ...route.query, ...props, ...filtersArgs })
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
  <div
    v-if="datasets.length > 0"
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
  <div
    v-if="datasets.length === 0"
    class="fr-mt-2w rounded-xxs fr-p-3w fr-grid-row flex-direction-column bg-contrast-blue-cumulus"
  >
    <div class="fr-col fr-grid-row fr-grid-row--gutters text-blue-400">
      <div class="fr-col-auto">
        <img
          src="/search/france_with_magnifying_glass.svg"
          alt=""
          loading="lazy"
          class="w-100"
          height="134"
          width="124"
        />
      </div>
      <div
        class="fr-col-12 fr-col-sm fr-grid-row flex-direction-column justify-between"
      >
        <div class="fr-mb-1w">
          <h2 class="fr-m-0 fr-mb-1w fr-text--bold fr-text--md">
            Aucun résultat ne correspond à votre recherche
          </h2>
          <p class="fr-mt-1v fr-mb-3v">
            Essayez de réinitialiser les filtres pour agrandir votre champ de
            recherche.
          </p>
        </div>
        <div class="fr-grid-row fr-grid-row--undefined">
          <button class="fr-btn" @click.stop.prevent="clearFilters">
            Réinitialiser les filtres
          </button>
        </div>
      </div>
    </div>
  </div>
  <div class="fr-mb-4w border-top">
    <ul class="fr-grid-row flex-gap fr-mt-3w fr-pl-0" role="list">
      <li v-for="dataset in datasets" :key="dataset.id" class="col-fluid">
        <DatasetCard
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
    class="fr-container"
    :current-page="parseInt(page) - 1"
    :pages="pagination"
    @update:current-page="goToPage"
  />
</template>

<style scoped>
.dataset-card {
  margin-top: 0 !important;
  margin-bottom: 0 !important;
}
</style>
