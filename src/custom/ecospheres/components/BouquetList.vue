<script setup lang="ts">
import type { ComputedRef, PropType } from 'vue'
import { computed, onMounted } from 'vue'
import { useLoading } from 'vue-loading-overlay'
import { useRouter, useRoute, type LocationQueryRaw } from 'vue-router'

import { NoOptionSelected } from '@/model/theme'
import type { Topic } from '@/model/topic'
import { useTopicStore } from '@/store/TopicStore'

import BouquetCard from '../components/BouquetCard.vue'

const router = useRouter()
const route = useRoute()
const topicStore = useTopicStore()

const props = defineProps({
  themeName: {
    type: String,
    default: NoOptionSelected
  },
  subthemeName: {
    type: String,
    default: NoOptionSelected
  },
  showDrafts: {
    type: Boolean
  },
  geozone: {
    type: String as PropType<string | null>,
    default: null
  },
  query: {
    type: String,
    default: ''
  }
})

const bouquets: ComputedRef<Topic[]> = computed(() => {
  return topicStore.sorted
    .filter((bouquet) => {
      return !props.showDrafts ? !bouquet.private : true
    })
    .filter((bouquet) => {
      if (props.geozone === null) return true
      return (
        bouquet.spatial?.zones &&
        bouquet.spatial.zones.length > 0 &&
        bouquet.spatial.zones.includes(props.geozone)
      )
    })
    .filter((bouquet) => {
      if (props.themeName === NoOptionSelected) return true
      return isRelevant(bouquet, 'theme', props.themeName)
    })
    .filter((bouquet) => {
      if (props.subthemeName === NoOptionSelected) return true
      return isRelevant(bouquet, 'subtheme', props.subthemeName)
    })
    .filter((bouquet) => {
      if (props.query === '') return true
      return bouquet.name.toLowerCase().includes(props.query.toLowerCase())
    })
})

const numberOfResultMsg: ComputedRef<string> = computed(() => {
  if (bouquets.value.length === 1) {
    return '1 bouquet disponible'
  } else {
    return bouquets.value.length + ' bouquets disponibles'
  }
})

const isRelevant = (topic: Topic, property: string, value: string): Boolean => {
  const topicInformations: { [key: string]: string }[] =
    topic.extras['ecospheres:informations']
  if (topicInformations) {
    for (const information of topicInformations) {
      if (information[property] === value) {
        return true
      }
    }
  }
  return false
}

const goToCreate = () => {
  router.push({ name: 'bouquet_add', query: route.query })
}

const clearFilters = () => {
  const query: LocationQueryRaw = {}
  if (route.query.drafts) query.drafts = route.query.drafts
  router.push({ name: 'bouquets', hash: '#main', query })
}

onMounted(() => {
  const loader = useLoading().show()
  topicStore.loadTopicsForUniverse().then(() => loader.hide())
})
</script>

<template>
  <div
    v-if="bouquets.length > 0"
    class="fr-grid-row fr-grid-row--gutters fr-grid-row--middle justify-between fr-pb-2w"
  >
    <p class="fr-col-auto fr-my-0">{{ numberOfResultMsg }}</p>
    <div class="fr-col-auto fr-grid-row fr-grid-row--middle">
      <label for="sort-search" class="fr-col-auto fr-text--sm fr-m-0 fr-mr-1w"
        >Trier par :</label
      >
      <div class="fr-col">
        <DsfrSelect
          v-model="topicStore.sort"
          select-id="sort-search"
          :options="[
            { value: '-created_at', text: 'Les plus récemment créés' },
            { value: '-last_modified', text: 'Les plus récemment modifiés' },
            { value: 'name', text: 'Titre' }
          ]"
        ></DsfrSelect>
      </div>
    </div>
  </div>
  <div
    v-if="bouquets.length === 0"
    class="fr-mt-2w rounded-xxs fr-p-3w fr-grid-row flex-direction-column bg-contrast-blue-cumulus"
  >
    <div class="fr-col fr-grid-row fr-grid-row--gutters text-blue-400">
      <div class="fr-col-auto">
        <img
          class="w-100"
          src="/search/france_with_magnifying_glass.svg"
          alt=""
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
            recherche.<br />
            Vous pouvez aussi contribuer en créant un bouquet.
          </p>
        </div>
        <div class="fr-grid-row fr-grid-row--undefined">
          <button class="fr-btn" @click.stop.prevent="clearFilters">
            Réinitialiser les filtres
          </button>
          <button
            class="fr-btn fr-btn--secondary fr-ml-1w"
            @click.stop.prevent="goToCreate"
          >
            Ajouter un bouquet
          </button>
        </div>
      </div>
    </div>
  </div>
  <div class="bouquets-list-container fr-container fr-mb-4w border-top">
    <div class="fr-grid-row fr-grid-row--gutters fr-mb-1w">
      <div class="fr-col-12">
        <BouquetCard
          v-for="bouquet in bouquets"
          :key="bouquet.id"
          :bouquet="bouquet"
        />
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
// "revert" gutters — simpler than w/o gutters
.bouquets-list-container {
  padding-right: 0;
  padding-left: 0;
}
</style>
