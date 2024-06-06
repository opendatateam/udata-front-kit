<script setup lang="ts">
import type { ComputedRef, PropType } from 'vue'
import { computed, onMounted } from 'vue'
import { useLoading } from 'vue-loading-overlay'
import { useRouter, useRoute } from 'vue-router'

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
      return bouquet.extras.ecospheres.theme === props.themeName
    })
    .filter((bouquet) => {
      if (props.subthemeName === NoOptionSelected) return true
      return bouquet.extras.ecospheres.subtheme === props.subthemeName
    })
})

const numberOfResultMsg: ComputedRef<string> = computed(() => {
  if (bouquets.value.length === 1) {
    return '1 bouquet disponible'
  } else {
    return bouquets.value.length + ' bouquets disponibles'
  }
})

const goToCreate = () => {
  router.push({ name: 'bouquet_add', query: route.query })
}

onMounted(() => {
  const loader = useLoading().show()
  topicStore.loadTopicsForUniverse().then(() => loader.hide())
})
</script>

<template>
  <div
    v-if="bouquets.length > 0"
    class="fr-grid-row fr-grid-row--gutters fr-grid-row--middle justify-between fr-pb-1w"
  >
    <p class="fr-col-auto fr-my-0">{{ numberOfResultMsg }}</p>
    <div class="fr-col-auto fr-grid-row fr-grid-row--middle">
      <label for="sort-search" class="fr-col-auto fr-text--sm fr-m-0 fr-mr-1w"
        >Trier par :</label
      >
      <div class="fr-col">
        <DsfrSelect
          v-model="topicStore.sort"
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
    class="fr-alert fr-alert--info"
    data-fr-js-alert-actionee="true"
  >
    <h3 class="fr-alert__title">Il n'y a pas encore de bouquet sur ce thème</h3>
    <p>
      N'hésitez pas à contribuer en
      <a href="#" @click.stop.prevent="goToCreate()">en créant un</a>
    </p>
  </div>
  <div class="bouquets-list-container fr-container fr-mt-2w fr-mb-4w">
    <div class="fr-grid-row fr-grid-row--gutters fr-mb-1w">
      <div
        v-for="bouquet in bouquets"
        :key="bouquet.id"
        class="fr-col-md-6 fr-col-12"
      >
        <BouquetCard :bouquet="bouquet" />
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
