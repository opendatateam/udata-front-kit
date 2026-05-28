<script lang="ts" setup>
import config from '@/config'
import { useMeta } from '@/utils/seo'

import TopicsAPI from '@/services/api/resources/TopicsAPI'

import HomeHero from '@/custom/accessibilite/components/home/HomeHero.vue'
import type { Topic } from '@/model/topic'
import TopicCard from '@datagouv/components-next/src/components/TopicCard.vue'

useMeta({
  description: () => config.website.homepage.meta_description,
  canonicalUrl: () => window.location.origin
})

const topicsAPI = new TopicsAPI()
const topics = ref<Topic[] | null>(null)

const themeIcon = (tags: string[]) => {
  const theme = tags[1].split('-').at(-1)
  return theme
}

onMounted(async () => {
  const response = await topicsAPI.search({
    tag: 'accessibilite-univers',
    page: 1,
    page_size: 8
  })
  topics.value = response.data
})
</script>

<template>
  <HomeHero />
  <section class="fr-container fr-pt-6w fr-pb-7w">
    <h2>Qu’est-ce que des données d’accessibilité ?</h2>
    <p>
      Les données d’accessibilité sont des informations qui permettent de savoir
      si un lieu, un service, un trajet, un équipement sportif ou encore un site
      internet est accessible aux personnes en situation de handicap.
    </p>
  </section>

  <section class="fr-container">
    <h2>Explorer par thème</h2>
    <ul v-if="topics" role="list">
      <li v-for="topic in topics" :key="topic.id">
        {{ topic.name }} - {{ topic.tags }}
        <img
          v-if="themeIcon(topic.tags)"
          :src="`/static/accessibilite/assets/icons/icon-theme-${themeIcon(topic.tags)}.svg`"
          alt=""
        />
        <TopicCard :topic="topic" />
      </li>
    </ul>
  </section>
</template>

<style>
h1,
h2,
h3 {
  text-wrap: balance;
}

h2 {
  /* fluid typography: 28px at ~375px viewport → 32px at ~992px viewport */
  font-size: clamp(1.75rem, 0.65vw + 1.6rem, 2rem);
}
</style>
