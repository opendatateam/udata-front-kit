<script setup lang="ts">
import type { ComputedRef, PropType } from 'vue'
import { computed, onMounted } from 'vue'
import { useLoading } from 'vue-loading-overlay'
import { useRouter, useRoute } from 'vue-router'

import type { Topic } from '@/model'
import { NoOptionSelected } from '@/model'
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
  const allTopics = topicStore.sorted
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
  if (props.themeName === NoOptionSelected) {
    return allTopics
  }
  const relevantTopics: Topic[] = []
  if (props.subthemeName !== NoOptionSelected) {
    for (const topic of allTopics) {
      if (
        isRelevant(topic, 'subtheme', props.subthemeName) &&
        isRelevant(topic, 'theme', props.themeName)
      ) {
        relevantTopics.push(topic)
      }
    }
  } else if (props.themeName !== NoOptionSelected) {
    for (const topic of allTopics) {
      if (isRelevant(topic, 'theme', props.themeName)) {
        relevantTopics.push(topic)
      }
    }
  }
  return relevantTopics
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
