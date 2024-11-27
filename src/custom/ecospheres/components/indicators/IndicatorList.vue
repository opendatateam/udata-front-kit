<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { computed, watch, type ComputedRef, type PropType } from 'vue'
import { useLoading } from 'vue-loading-overlay'
import { useRoute, useRouter, type LocationQueryRaw } from 'vue-router'
import { useIndicatorStore } from '../../store/IndicatorStore'

import BouquetCard from '@/components/bouquets/BouquetCard.vue'

const route = useRoute()
const router = useRouter()
const store = useIndicatorStore()

const props = defineProps({
  theme: {
    type: String as PropType<string | null>,
    default: null
  },
  geozone: {
    type: String as PropType<string | null>,
    default: null
  },
  query: {
    type: String,
    default: ''
  },
  page: {
    type: Number,
    default: null
  }
})

const emits = defineEmits(['clearFilters'])

const { indicators, pagination } = storeToRefs(store)

const numberOfResultMsg: ComputedRef<string> = computed(() => {
  if (indicators.value.length === 1) {
    return '1 indicateur disponible'
  } else if (indicators.value.length > 1) {
    return `${indicators.value.length} indicateurs disponibles`
  } else {
    return 'Aucun résultat ne correspond à votre recherche'
  }
})

const clearFilters = () => {
  const query: LocationQueryRaw = {}
  router.push({ name: 'indicators', query }).then(() => {
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
    query: { ...route.query, page: page + 1 }
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
    v-if="indicators.length > 0"
    class="fr-grid-row fr-grid-row--gutters fr-grid-row--middle justify-between fr-pb-2w"
  >
    <h2 class="fr-col-auto fr-my-0 h4">{{ numberOfResultMsg }}</h2>
    <div class="fr-col-auto fr-grid-row fr-grid-row--middle">
      <label for="sort-search" class="fr-col-auto fr-text--sm fr-m-0 fr-mr-1w"
        >Trier par :</label
      >
      <div class="fr-col">
        <!-- TODO: find out possible sorts on the API -->
        <!-- <DsfrSelect
          v-model="topicStore.sort"
          select-id="sort-search"
          :options="[
            { value: '-created_at', text: 'Les plus récemment créés' },
            { value: '-last_modified', text: 'Les plus récemment modifiés' },
            { value: 'name', text: 'Titre' }
          ]"
        ></DsfrSelect> -->
      </div>
    </div>
  </div>
  <div
    v-if="indicators.length === 0"
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
  <div class="indicators-list-container fr-container fr-mb-4w border-top">
    <div class="fr-grid-row fr-grid-row--gutters fr-mb-1w">
      <div class="fr-col-12">
        <BouquetCard
          v-for="indicator in indicators"
          :key="indicator.id"
          :bouquet="indicator"
        />
      </div>
    </div>
  </div>
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
