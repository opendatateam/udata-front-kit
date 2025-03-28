<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { computed, watch, type ComputedRef } from 'vue'
import { useLoading } from 'vue-loading-overlay'
import { useRoute, useRouter, type LocationQueryRaw } from 'vue-router'
import type { IndicatorFilters } from '../../model/indicator'
import { useIndicatorStore } from '../../store/IndicatorStore'

import NoResults from '@/components/NoResults.vue'
import SelectComponent from '@/components/SelectComponent.vue'
import IndicatorCard from './IndicatorCard.vue'

const route = useRoute()
const router = useRouter()
const store = useIndicatorStore()

type Props = IndicatorFilters & {
  query: string
  page: number
  sort: string | null
  geozone: string | null
  granularity: string | null
}
const props = withDefaults(defineProps<Props>(), { query: '' })

const emits = defineEmits(['clearFilters'])

const { indicators, pagination, total } = storeToRefs(store)

const numberOfResultMsg: ComputedRef<string> = computed(() => {
  if (total.value === 1) {
    return '1 indicateur disponible'
  } else if (total.value > 1) {
    return `${total.value} indicateurs disponibles`
  } else {
    return 'Aucun résultat ne correspond à votre recherche'
  }
})

const clearFilters = () => {
  const query: LocationQueryRaw = {}
  router
    .push({ name: 'indicators', query, hash: '#indicators-list' })
    .then(() => {
      emits('clearFilters')
    })
}

const executeQuery = async (args: typeof props) => {
  const loader = useLoading().show({ enforceFocus: false })
  return store.query(args).finally(() => loader.hide())
}

const goToPage = (page: number) => {
  router.push({
    name: 'indicators',
    query: { ...route.query, page: page + 1 },
    hash: '#indicators-list'
  })
}

const doSort = (value: string | null) => {
  router.push({
    name: 'indicators',
    query: { ...route.query, sort: value },
    hash: '#indicators-list'
  })
}

// launch search on props (~route.query) changes
watch(props, () => executeQuery(props), { immediate: true, deep: true })

defineExpose({
  numberOfResultMsg
})
</script>

<template>
  <template v-if="indicators.length > 0">
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
      <ul class="fr-grid-row flex-gap fr-mt-3w fr-pl-0" role="list">
        <li
          v-for="indicator in indicators"
          :key="indicator.id"
          class="col-fluid"
        >
          <IndicatorCard :indicator="indicator" />
        </li>
      </ul>
    </div>
    <DsfrPagination
      v-if="pagination.length"
      class="fr-container"
      :current-page="page - 1"
      :pages="pagination"
      @update:current-page="goToPage"
    />
  </template>
  <NoResults v-else :clear-filters="clearFilters" />
</template>

<style scoped>
.fr-grid-row {
  --gap: 1rem;
}
.col-fluid {
  padding: 0;
  flex: 1 1 48%;
  min-inline-size: 30ch;
}
</style>
