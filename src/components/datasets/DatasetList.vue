<script setup lang="ts">
import { useDatasetStore } from '@/store/DatasetStore'
import { useSearchPagesConfig } from '@/utils/config'
import { storeToRefs } from 'pinia'
import { computed, ref, watch, type ComputedRef } from 'vue'
import { useLoading } from 'vue-loading-overlay'
import { useRoute, useRouter, type LocationQueryRaw } from 'vue-router'

import SelectComponent from '@/components/SelectComponent.vue'
import IndicatorCard from '@/custom/ecospheres/components/indicators/IndicatorCard.vue'
import { DatasetCard } from '@datagouv/components'

const route = useRoute()
const router = useRouter()
const store = useDatasetStore()

const zIndex = (key: number) => {
  return { zIndex: datasets.value.length - key }
}

const getDatasetPage = (id: string) => {
  return { name: 'dataset_detail', params: { did: id } }
}

const getOrganizationPage = (id: string) => {
  if (router.hasRoute('organization_detail')) {
    return { name: 'organization_detail', params: { oid: id } }
  }
  return ''
}

const searchPageConfigTypeCard = ref<string>('')
const searchPageLabelTitle = ref<string>('')
const config = useSearchPagesConfig(
  route.path.replace('/admin', '').split('/')[1]
)
searchPageConfigTypeCard.value = config.searchPageConfigTypeCard
searchPageLabelTitle.value = config.searchPageLabelTitle

type Props = {
  query: string
  page: number
  sort: string | null
  organization: string | null
  geozone: string | null
  tags: string[]
}
const props = withDefaults(defineProps<Props>(), { query: '' })

const emits = defineEmits(['clearFilters'])

const { datasets, pagination, total } = storeToRefs(store)

const numberOfResultMsg: ComputedRef<string> = computed(() => {
  if (total.value === 1) {
    return `1 ${searchPageLabelTitle.value} disponible`
  } else if (total.value > 1) {
    return `${total.value} ${searchPageLabelTitle.value} disponibles`
  } else {
    return 'Aucun résultat ne correspond à votre recherche'
  }
})

const clearFilters = () => {
  const query: LocationQueryRaw = {}
  router.push({ name: 'datasets', query }).then(() => {
    emits('clearFilters')
  })
}

const executeQuery = async (args: typeof props) => {
  const loader = useLoading().show({ enforceFocus: false })
  return store.query(args).finally(() => loader.hide())
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

// launch search on props (~route.query) changes
watch(props, () => executeQuery(props), { immediate: true, deep: true })

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
  <span v-if="searchPageConfigTypeCard == 'indicators'">
    <div class="indicators-list-container fr-container fr-mb-4w border-top">
      <ul
        class="fr-grid-row fr-grid-row--gutters fr-mb-1w fr-mt-2w"
        role="list"
      >
        <li
          v-for="dataset in datasets"
          :key="dataset.id"
          class="fr-col-md-6 fr-col-md"
        >
          <IndicatorCard :indicator="dataset" />
        </li>
      </ul>
    </div>
  </span>
  <span v-else>
    <DatasetCard
      v-for="(d, index) in datasets"
      :key="d.id"
      :style="zIndex(index)"
      :dataset="d"
      :dataset-url="getDatasetPage(d.id)"
      :organization-url="getOrganizationPage(d.organization?.id ?? '')"
    />
  </span>
  <DsfrPagination
    v-if="pagination.length"
    class="fr-container"
    :current-page="page - 1"
    :pages="pagination"
    @update:current-page="goToPage"
  />
</template>

<style scoped>
/* "revert" gutters — simpler than w/o gutters */
.indicators-list-container {
  padding-right: 0;
  padding-left: 0;
}
</style>
