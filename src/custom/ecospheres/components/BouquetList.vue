<script setup lang="ts">
import type { ComputedRef, PropType } from 'vue'
import { computed, onMounted } from 'vue'
import { useLoading } from 'vue-loading-overlay'
import { useRouter, useRoute, type RouteLocationRaw } from 'vue-router'

import Tile from '@/components/Tile.vue'
import type { Topic } from '@/model'
import { NoOptionSelected } from '@/model'
import { useTopicStore } from '@/store/TopicStore'

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

const computeLink = (bouquet: Topic): RouteLocationRaw => {
  return bouquet.private
    ? { name: 'bouquet_edit', params: { bid: bouquet.id } }
    : {
        name: 'bouquet_detail',
        params: { bid: bouquet.slug }
      }
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
  <div class="fr-container--fluid fr-mt-2w fr-mb-4w">
    <ul class="fr-grid-row fr-grid-row--gutters es__tiles__list fr-mt-1w">
      <li
        v-for="bouquet in bouquets"
        :key="bouquet.id"
        class="fr-col-12 fr-col-lg-6"
      >
        <Tile
          :link="computeLink(bouquet)"
          :title="bouquet.name"
          :description="bouquet.description"
          :is-markdown="true"
          :notice="bouquet.private ? 'Brouillon' : undefined"
        />
      </li>
    </ul>
  </div>
</template>
