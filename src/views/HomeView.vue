<script setup>
import MarkdownIt from 'markdown-it'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

import config from '@/config'

import HomeButtons from '../components/HomeButtons.vue'
import HomeCharts from '../components/HomeCharts.vue'
import HomeTopics from '../components/HomeTopics.vue'
import HomeThemes from '../components/HomeThemes.vue'

const router = useRouter()
const query = ref('')
const markdown = new MarkdownIt()

// TODO: mutualize w/ App.vue
const updateQuery = (q) => {
  query.value = q
}

const doSearch = () => {
  router.push({ name: 'datasets', query: { q: query.value } })
}

const homepageTitle = config.website.homepage_title
const homepageSubTitle = config.website.homepage_subtitle
const topics = config.website.list_highlighted_topics
const buttons = config.website.home_buttons
const showTopicChart = config.website.show_topic_charts
</script>

<template>
  <div class="fr-container fr-mt-8w fr-mb-16w">
    <h1>{{ homepageTitle }}</h1>
    <div class="es__hero fr-mt-4w fr-mb-4w">
      <span v-html="markdown.render(homepageSubTitle)" />
    </div>
    <DsfrSearchBar
      button-text="Rechercher"
      placeholder="Rechercher un jeu de données"
      :large="true"
      @search="doSearch"
      @update:modelValue="updateQuery"
    />
    <HomeThemes className="home-tile-list" :selectedThemeName="this.$route.query.theme"/>
    <HomeButtons v-if="buttons" :buttons="buttons" />
    <HomeTopics v-if="topics" :topics="topics" />
    <HomeCharts v-if="showTopicChart" />
  </div>
</template>

<style scoped lang="scss">
.fr-container {
  text-align: center;
}
.es__hero {
  font-size: 1.5rem;
  line-height: 1.5rem;
}
</style>
